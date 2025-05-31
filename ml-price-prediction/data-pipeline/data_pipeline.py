import pandas as pd
import numpy as np
import boto3
from datetime import datetime, timedelta
import json
import os
from supabase import create_client, Client
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FunkoDataPipeline:
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.bucket_name = f'funko-ml-data-{boto3.Session().get_credentials().access_key[-6:]}'
        
        # Initialize Supabase client
        self.supabase: Client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_ANON_KEY')
        )
        
    def create_s3_bucket_if_not_exists(self):
        """Create S3 bucket if it doesn't exist"""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"Bucket {self.bucket_name} already exists")
        except:
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
                logger.info(f"Created bucket {self.bucket_name}")
            except Exception as e:
                logger.error(f"Failed to create bucket: {e}")
                raise
    
    def extract_training_data(self):
        """Extract data from Supabase database"""
        logger.info("Extracting training data from Supabase...")
        
        try:
            # Get all funko pops with their basic info
            funko_response = self.supabase.table('funko_pops').select(
                'id, name, series, character, funko_number, release_date, '
                'is_chase, is_exclusive, is_vaulted, estimated_value, rarity'
            ).execute()
            
            if not funko_response.data:
                raise ValueError("No funko data found")
            
            # Since we don't have actual price history yet, let's simulate some
            # In production, this would come from your actual price_history table
            price_data = []
            
            for funko in funko_response.data:
                # Simulate price history for each funko
                base_price = funko.get('estimated_value', 10) or 10
                
                # Generate 20-100 price points over the last 2 years
                num_prices = np.random.randint(20, 101)
                
                for i in range(num_prices):
                    # Random date within last 2 years
                    days_ago = np.random.randint(1, 730)
                    sale_date = datetime.now() - timedelta(days=days_ago)
                    
                    # Price with some variation and trend
                    price_variation = np.random.normal(1.0, 0.3)  # ±30% variation
                    age_factor = 1 + (days_ago / 730) * 0.5  # Older = potentially more valuable
                    rarity_multiplier = 1.0
                    
                    if funko.get('is_chase'):
                        rarity_multiplier *= 2.5
                    if funko.get('is_exclusive'):
                        rarity_multiplier *= 1.8
                    if funko.get('is_vaulted'):
                        rarity_multiplier *= 2.0
                    
                    final_price = max(5, base_price * price_variation * age_factor * rarity_multiplier)
                    
                    price_data.append({
                        'funko_pop_id': funko['id'],
                        'price': round(final_price, 2),
                        'marketplace': np.random.choice(['ebay', 'mercari', 'amazon', 'funko_shop'], 
                                                      p=[0.6, 0.2, 0.1, 0.1]),
                        'condition': np.random.choice(['mint', 'near_mint', 'very_fine', 'fine', 'poor'],
                                                    p=[0.4, 0.3, 0.2, 0.08, 0.02]),
                        'date_sold': sale_date.isoformat()
                    })
            
            logger.info(f"Generated {len(price_data)} price records for {len(funko_response.data)} funkos")
            
            return pd.DataFrame(price_data), pd.DataFrame(funko_response.data)
            
        except Exception as e:
            logger.error(f"Error extracting data: {e}")
            raise
    
    def engineer_features(self, price_df, funko_df):
        """Create ML features for price prediction"""
        logger.info("Engineering features...")
        
        # Merge price and funko data
        merged_df = pd.merge(price_df, funko_df, left_on='funko_pop_id', right_on='id')
        
        # Feature engineering
        features_df = pd.DataFrame()
        
        # Time-based features
        merged_df['release_date'] = pd.to_datetime(merged_df['release_date'])
        merged_df['price_date'] = pd.to_datetime(merged_df['date_sold'])
        
        features_df['days_since_release'] = (merged_df['price_date'] - merged_df['release_date']).dt.days
        features_df['release_month'] = merged_df['release_date'].dt.month
        features_df['sale_month'] = merged_df['price_date'].dt.month
        features_df['sale_day_of_week'] = merged_df['price_date'].dt.dayofweek
        features_df['is_weekend_sale'] = (merged_df['price_date'].dt.dayofweek >= 5).astype(int)
        
        # Rarity features
        features_df['is_chase'] = merged_df['is_chase'].fillna(False).astype(int)
        features_df['is_exclusive'] = merged_df['is_exclusive'].fillna(False).astype(int)
        features_df['is_vaulted'] = merged_df['is_vaulted'].fillna(False).astype(int)
        features_df['funko_number'] = merged_df['funko_number'].fillna(0)
        
        # Series and character features (encoding)
        series_mapping = {series: idx for idx, series in enumerate(merged_df['series'].unique())}
        character_mapping = {char: idx for idx, char in enumerate(merged_df['character'].unique())}
        
        features_df['series_encoded'] = merged_df['series'].map(series_mapping).fillna(0)
        features_df['character_encoded'] = merged_df['character'].map(character_mapping).fillna(0)
        
        # Save mappings for inference
        self.save_mappings({
            'series_mapping': series_mapping,
            'character_mapping': character_mapping
        })
        
        # Condition features
        condition_map = {'mint': 5, 'near_mint': 4, 'very_fine': 3, 'fine': 2, 'poor': 1}
        features_df['condition_score'] = merged_df['condition'].map(condition_map).fillna(3)
        
        # Marketplace features
        marketplace_map = {'ebay': 1, 'mercari': 2, 'amazon': 3, 'funko_shop': 4}
        features_df['marketplace_encoded'] = merged_df['marketplace'].map(marketplace_map).fillna(1)
        
        # Historical price features (rolling averages)
        merged_df_sorted = merged_df.sort_values(['funko_pop_id', 'price_date'])
        
        for window in [7, 30, 90]:
            features_df[f'avg_price_{window}d'] = (
                merged_df_sorted.groupby('funko_pop_id')['price']
                .rolling(window=window, min_periods=1)
                .mean()
                .values
            )
        
        # Price volatility (rolling standard deviation)
        features_df['price_volatility_30d'] = (
            merged_df_sorted.groupby('funko_pop_id')['price']
            .rolling(window=30, min_periods=1)
            .std()
            .fillna(0)
            .values
        )
        
        # Estimated value feature
        features_df['base_estimated_value'] = merged_df['estimated_value'].fillna(10)
        
        # Target variable (this is what we're predicting)
        features_df['target_price'] = merged_df['price']
        
        # Remove any rows with NaN values
        features_df = features_df.dropna()
        
        logger.info(f"Created {len(features_df)} feature vectors with {len(features_df.columns)-1} features")
        
        return features_df
    
    def save_mappings(self, mappings):
        """Save category mappings for inference"""
        mapping_path = '/tmp/feature_mappings.json'
        with open(mapping_path, 'w') as f:
            json.dump(mappings, f)
        
        # Upload to S3
        self.s3_client.upload_file(
            mapping_path,
            self.bucket_name,
            'funko-price-prediction/feature_mappings.json'
        )
    
    def prepare_sagemaker_data(self, features_df):
        """Prepare data in SageMaker format (CSV with target in first column)"""
        logger.info("Preparing data for SageMaker...")
        
        # SageMaker expects target variable in first column
        columns = ['target_price'] + [col for col in features_df.columns if col != 'target_price']
        sagemaker_df = features_df[columns]
        
        # Split into train/validation/test (70/20/10)
        n = len(sagemaker_df)
        train_size = int(0.7 * n)
        val_size = int(0.2 * n)
        
        # Shuffle the data
        sagemaker_df = sagemaker_df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        train_df = sagemaker_df[:train_size]
        val_df = sagemaker_df[train_size:train_size + val_size]
        test_df = sagemaker_df[train_size + val_size:]
        
        logger.info(f"Split data: {len(train_df)} train, {len(val_df)} validation, {len(test_df)} test")
        
        return train_df, val_df, test_df
    
    def upload_to_s3(self, train_df, val_df, test_df):
        """Upload training data to S3"""
        logger.info("Uploading data to S3...")
        
        # Save to CSV and upload
        train_df.to_csv('/tmp/train.csv', index=False, header=False)
        val_df.to_csv('/tmp/validation.csv', index=False, header=False)
        test_df.to_csv('/tmp/test.csv', index=False, header=False)
        
        # Also save feature names for reference
        feature_names = [col for col in train_df.columns if col != 'target_price']
        with open('/tmp/feature_names.json', 'w') as f:
            json.dump(feature_names, f)
        
        # Upload to S3
        for dataset in ['train', 'validation', 'test']:
            self.s3_client.upload_file(
                f'/tmp/{dataset}.csv',
                self.bucket_name,
                f'funko-price-prediction/{dataset}.csv'
            )
        
        self.s3_client.upload_file(
            '/tmp/feature_names.json',
            self.bucket_name,
            'funko-price-prediction/feature_names.json'
        )
        
        s3_paths = {
            'train': f's3://{self.bucket_name}/funko-price-prediction/train.csv',
            'validation': f's3://{self.bucket_name}/funko-price-prediction/validation.csv',
            'test': f's3://{self.bucket_name}/funko-price-prediction/test.csv',
            'feature_names': f's3://{self.bucket_name}/funko-price-prediction/feature_names.json',
            'mappings': f's3://{self.bucket_name}/funko-price-prediction/feature_mappings.json'
        }
        
        logger.info("Data uploaded successfully!")
        return s3_paths

def main():
    """Run the complete data pipeline"""
    logger.info("Starting Funko Price Prediction Data Pipeline...")
    
    pipeline = FunkoDataPipeline()
    
    try:
        # Create S3 bucket
        pipeline.create_s3_bucket_if_not_exists()
        
        # Extract data
        logger.info("Step 1: Extracting data...")
        price_df, funko_df = pipeline.extract_training_data()
        
        # Engineer features
        logger.info("Step 2: Engineering features...")
        features_df = pipeline.engineer_features(price_df, funko_df)
        
        # Prepare for SageMaker
        logger.info("Step 3: Preparing SageMaker data...")
        train_df, val_df, test_df = pipeline.prepare_sagemaker_data(features_df)
        
        # Upload to S3
        logger.info("Step 4: Uploading to S3...")
        s3_paths = pipeline.upload_to_s3(train_df, val_df, test_df)
        
        logger.info("✅ Data pipeline completed successfully!")
        logger.info("S3 paths:")
        for key, path in s3_paths.items():
            logger.info(f"  {key}: {path}")
            
        return s3_paths
        
    except Exception as e:
        logger.error(f"❌ Pipeline failed: {e}")
        raise

if __name__ == "__main__":
    main() 