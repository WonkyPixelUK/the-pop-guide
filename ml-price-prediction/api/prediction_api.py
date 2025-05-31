from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import boto3
import json
import logging
from datetime import datetime, timedelta
import os
from supabase import create_client, Client
import pandas as pd
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Funko Price Prediction API",
    description="AI-powered price prediction for Funko Pop collectibles",
    version="1.0.0"
)

# Configuration
SAGEMAKER_ENDPOINT = os.getenv('SAGEMAKER_ENDPOINT_NAME', 'funko-price-endpoint')
AWS_REGION = os.getenv('AWS_REGION', 'us-west-2')

# Initialize clients
sagemaker_runtime = boto3.client('sagemaker-runtime', region_name=AWS_REGION)
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_ANON_KEY')
)

# Pydantic models for API
class PricePredictionRequest(BaseModel):
    funko_pop_id: str = Field(..., description="Funko Pop ID from database")
    condition: str = Field(default="mint", description="Condition: mint, near_mint, very_fine, fine, poor")
    marketplace: str = Field(default="ebay", description="Marketplace: ebay, mercari, amazon, funko_shop")
    future_days: int = Field(default=30, description="Days into future for prediction")

class BatchPredictionRequest(BaseModel):
    funko_pop_ids: List[str] = Field(..., description="List of Funko Pop IDs")
    condition: str = Field(default="mint", description="Condition for all items")
    marketplace: str = Field(default="ebay", description="Marketplace for all items")
    future_days: int = Field(default=30, description="Days into future for prediction")

class PricePredictionResponse(BaseModel):
    funko_pop_id: str
    funko_name: str
    series: str
    predicted_price: float
    confidence_score: float
    price_range: Dict[str, float]  # min, max
    factors: Dict[str, Any]
    prediction_date: str
    model_version: str

class PriceHistoryResponse(BaseModel):
    funko_pop_id: str
    historical_prices: List[Dict[str, Any]]
    trend_analysis: Dict[str, Any]
    volatility_score: float

class FunkoPricePredictionAPI:
    def __init__(self):
        self.feature_mappings = self._load_feature_mappings()
        self.feature_names = self._load_feature_names()
        
    def _load_feature_mappings(self):
        """Load feature mappings from S3 or cache"""
        try:
            # In production, cache these mappings
            s3_client = boto3.client('s3')
            # You'd implement S3 loading here
            # For now, return default mappings
            return {
                'series_mapping': {},
                'character_mapping': {}
            }
        except Exception as e:
            logger.error(f"Failed to load feature mappings: {e}")
            return {'series_mapping': {}, 'character_mapping': {}}
    
    def _load_feature_names(self):
        """Load feature names from S3 or cache"""
        try:
            # In production, load from S3
            return [
                'days_since_release', 'release_month', 'sale_month',
                'sale_day_of_week', 'is_weekend_sale', 'is_chase',
                'is_exclusive', 'is_vaulted', 'funko_number',
                'series_encoded', 'character_encoded', 'condition_score',
                'marketplace_encoded', 'avg_price_7d', 'avg_price_30d',
                'avg_price_90d', 'price_volatility_30d', 'base_estimated_value'
            ]
        except Exception as e:
            logger.error(f"Failed to load feature names: {e}")
            return []
    
    def get_funko_data(self, funko_pop_id: str):
        """Get Funko Pop data from Supabase"""
        try:
            response = supabase.table('funko_pops').select(
                'id, name, series, character, funko_number, release_date, '
                'is_chase, is_exclusive, is_vaulted, estimated_value, rarity'
            ).eq('id', funko_pop_id).execute()
            
            if not response.data:
                raise ValueError(f"Funko Pop with ID {funko_pop_id} not found")
            
            return response.data[0]
            
        except Exception as e:
            logger.error(f"Error fetching Funko data: {e}")
            raise
    
    def get_price_history(self, funko_pop_id: str, days=90):
        """Get price history for a Funko Pop"""
        try:
            # In a real implementation, you'd query your price_history table
            # For now, return simulated data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Simulate price history
            prices = []
            for i in range(min(days, 30)):  # Generate up to 30 data points
                price_date = start_date + timedelta(days=i * (days // 30))
                # Simulate price with some randomness
                base_price = 20 + np.random.normal(0, 5)
                prices.append({
                    'date': price_date.isoformat(),
                    'price': max(5, base_price),
                    'marketplace': 'ebay',
                    'condition': 'mint'
                })
            
            return prices
            
        except Exception as e:
            logger.error(f"Error fetching price history: {e}")
            return []
    
    def engineer_prediction_features(self, funko_data, condition, marketplace, future_days):
        """Engineer features for prediction"""
        try:
            features = {}
            
            # Time-based features
            release_date = pd.to_datetime(funko_data['release_date'])
            prediction_date = pd.to_datetime(datetime.now()) + pd.Timedelta(days=future_days)
            
            features['days_since_release'] = (prediction_date - release_date).days
            features['release_month'] = release_date.month
            features['sale_month'] = prediction_date.month
            features['sale_day_of_week'] = prediction_date.dayofweek
            features['is_weekend_sale'] = 1 if prediction_date.dayofweek >= 5 else 0
            
            # Rarity features
            features['is_chase'] = 1 if funko_data.get('is_chase') else 0
            features['is_exclusive'] = 1 if funko_data.get('is_exclusive') else 0
            features['is_vaulted'] = 1 if funko_data.get('is_vaulted') else 0
            features['funko_number'] = funko_data.get('funko_number', 0) or 0
            
            # Series and character encoding (simplified)
            series = funko_data.get('series', '')
            character = funko_data.get('character', '')
            features['series_encoded'] = hash(series) % 1000 if series else 0
            features['character_encoded'] = hash(character) % 1000 if character else 0
            
            # Condition mapping
            condition_map = {'mint': 5, 'near_mint': 4, 'very_fine': 3, 'fine': 2, 'poor': 1}
            features['condition_score'] = condition_map.get(condition, 3)
            
            # Marketplace mapping
            marketplace_map = {'ebay': 1, 'mercari': 2, 'amazon': 3, 'funko_shop': 4}
            features['marketplace_encoded'] = marketplace_map.get(marketplace, 1)
            
            # Get historical price features
            price_history = self.get_price_history(funko_data['id'])
            
            if price_history:
                prices = [p['price'] for p in price_history]
                features['avg_price_7d'] = np.mean(prices[-7:]) if len(prices) >= 7 else np.mean(prices)
                features['avg_price_30d'] = np.mean(prices[-30:]) if len(prices) >= 30 else np.mean(prices)
                features['avg_price_90d'] = np.mean(prices)
                features['price_volatility_30d'] = np.std(prices[-30:]) if len(prices) >= 30 else np.std(prices)
            else:
                # Use base estimated value if no history
                base_value = funko_data.get('estimated_value', 15) or 15
                features['avg_price_7d'] = base_value
                features['avg_price_30d'] = base_value
                features['avg_price_90d'] = base_value
                features['price_volatility_30d'] = 2.0
            
            features['base_estimated_value'] = funko_data.get('estimated_value', 15) or 15
            
            return features
            
        except Exception as e:
            logger.error(f"Error engineering features: {e}")
            raise
    
    def predict_price(self, features):
        """Call SageMaker endpoint for prediction"""
        try:
            # Prepare features in the correct order
            feature_vector = [features.get(name, 0) for name in self.feature_names]
            
            # Prepare payload for SageMaker
            payload = {
                'instances': [feature_vector]
            }
            
            # Call SageMaker endpoint
            response = sagemaker_runtime.invoke_endpoint(
                EndpointName=SAGEMAKER_ENDPOINT,
                ContentType='application/json',
                Body=json.dumps(payload)
            )
            
            # Parse response
            result = json.loads(response['Body'].read().decode())
            predicted_price = result['predictions'][0]
            
            return predicted_price
            
        except Exception as e:
            logger.error(f"Error calling SageMaker endpoint: {e}")
            # Fallback to simple estimation
            return features.get('base_estimated_value', 15) * 1.2
    
    def calculate_confidence_and_range(self, predicted_price, features):
        """Calculate confidence score and price range"""
        try:
            # Simple confidence calculation based on volatility and data availability
            volatility = features.get('price_volatility_30d', 2.0)
            base_confidence = 0.8
            
            # Reduce confidence for high volatility
            volatility_factor = max(0.3, 1 - (volatility / 10))
            confidence = base_confidence * volatility_factor
            
            # Calculate price range (±20% for typical confidence)
            range_percentage = 0.2 / confidence  # Lower confidence = wider range
            price_min = predicted_price * (1 - range_percentage)
            price_max = predicted_price * (1 + range_percentage)
            
            return confidence, {'min': price_min, 'max': price_max}
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {e}")
            return 0.7, {'min': predicted_price * 0.8, 'max': predicted_price * 1.2}

# Initialize API instance
predictor_api = FunkoPricePredictionAPI()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/predict", response_model=PricePredictionResponse)
async def predict_price(request: PricePredictionRequest):
    """Predict price for a single Funko Pop"""
    try:
        logger.info(f"Predicting price for Funko ID: {request.funko_pop_id}")
        
        # Get Funko data
        funko_data = predictor_api.get_funko_data(request.funko_pop_id)
        
        # Engineer features
        features = predictor_api.engineer_prediction_features(
            funko_data, request.condition, request.marketplace, request.future_days
        )
        
        # Make prediction
        predicted_price = predictor_api.predict_price(features)
        
        # Calculate confidence and range
        confidence, price_range = predictor_api.calculate_confidence_and_range(
            predicted_price, features
        )
        
        # Prepare response
        response = PricePredictionResponse(
            funko_pop_id=request.funko_pop_id,
            funko_name=funko_data['name'],
            series=funko_data['series'],
            predicted_price=round(predicted_price, 2),
            confidence_score=round(confidence, 3),
            price_range={
                'min': round(price_range['min'], 2),
                'max': round(price_range['max'], 2)
            },
            factors={
                'is_chase': features['is_chase'],
                'is_exclusive': features['is_exclusive'],
                'is_vaulted': features['is_vaulted'],
                'condition': request.condition,
                'marketplace': request.marketplace,
                'days_since_release': features['days_since_release']
            },
            prediction_date=datetime.now().isoformat(),
            model_version="1.0.0"
        )
        
        logger.info(f"Prediction completed: ${predicted_price:.2f} (confidence: {confidence:.3f})")
        return response
        
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch", response_model=List[PricePredictionResponse])
async def predict_batch(request: BatchPredictionRequest):
    """Predict prices for multiple Funko Pops"""
    try:
        logger.info(f"Batch prediction for {len(request.funko_pop_ids)} Funkos")
        
        results = []
        for funko_id in request.funko_pop_ids:
            try:
                single_request = PricePredictionRequest(
                    funko_pop_id=funko_id,
                    condition=request.condition,
                    marketplace=request.marketplace,
                    future_days=request.future_days
                )
                result = await predict_price(single_request)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed prediction for {funko_id}: {e}")
                continue
        
        logger.info(f"Batch prediction completed: {len(results)}/{len(request.funko_pop_ids)} successful")
        return results
        
    except Exception as e:
        logger.error(f"Batch prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{funko_pop_id}", response_model=PriceHistoryResponse)
async def get_price_history(funko_pop_id: str, days: int = 90):
    """Get price history and trend analysis"""
    try:
        logger.info(f"Getting price history for Funko ID: {funko_pop_id}")
        
        # Get historical prices
        price_history = predictor_api.get_price_history(funko_pop_id, days)
        
        if not price_history:
            raise HTTPException(status_code=404, detail="No price history found")
        
        # Calculate trend analysis
        prices = [p['price'] for p in price_history]
        trend_slope = np.polyfit(range(len(prices)), prices, 1)[0] if len(prices) > 1 else 0
        avg_price = np.mean(prices)
        volatility = np.std(prices) / avg_price if avg_price > 0 else 0
        
        trend_analysis = {
            'trend_direction': 'increasing' if trend_slope > 0.1 else 'decreasing' if trend_slope < -0.1 else 'stable',
            'trend_strength': abs(trend_slope),
            'average_price': round(avg_price, 2),
            'price_change_30d': round(prices[-1] - prices[0], 2) if len(prices) > 1 else 0,
            'highest_price': max(prices),
            'lowest_price': min(prices)
        }
        
        response = PriceHistoryResponse(
            funko_pop_id=funko_pop_id,
            historical_prices=price_history,
            trend_analysis=trend_analysis,
            volatility_score=round(volatility, 3)
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Price history fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/status")
async def get_model_status():
    """Get model and endpoint status"""
    try:
        # Check SageMaker endpoint status
        sagemaker_client = boto3.client('sagemaker', region_name=AWS_REGION)
        
        try:
            endpoint_response = sagemaker_client.describe_endpoint(EndpointName=SAGEMAKER_ENDPOINT)
            endpoint_status = endpoint_response['EndpointStatus']
        except:
            endpoint_status = 'NOT_FOUND'
        
        return {
            'model_version': '1.0.0',
            'endpoint_name': SAGEMAKER_ENDPOINT,
            'endpoint_status': endpoint_status,
            'features_count': len(predictor_api.feature_names),
            'last_updated': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 