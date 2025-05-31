import boto3
import sagemaker
from sagemaker.xgboost import XGBoostModel
from sagemaker.estimator import Estimator
from sagemaker.inputs import TrainingInput
import time
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FunkoPriceModelDeployer:
    def __init__(self, region='us-west-2'):
        self.session = sagemaker.Session()
        self.role = sagemaker.get_execution_role()
        self.region = region
        self.bucket = self.session.default_bucket()
        
        # Model configuration
        self.model_name = 'funko-price-predictor'
        self.endpoint_name = f'funko-price-endpoint-{int(time.time())}'
        
        logger.info(f"Initialized deployer for region: {region}")
        logger.info(f"Using S3 bucket: {self.bucket}")
        logger.info(f"Using IAM role: {self.role}")
    
    def train_model(self, s3_train_path, s3_validation_path, hyperparameters=None):
        """Train XGBoost model on SageMaker"""
        logger.info("Starting SageMaker training job...")
        
        # Default hyperparameters
        if hyperparameters is None:
            hyperparameters = {
                'max_depth': 6,
                'eta': 0.2,
                'gamma': 4,
                'min_child_weight': 6,
                'subsample': 0.8,
                'colsample_bytree': 0.8,
                'num_round': 1000,
                'early_stopping_rounds': 50,
                'objective': 'reg:squarederror'
            }
        
        # Create XGBoost estimator
        xgb_estimator = Estimator(
            image_uri=sagemaker.image_uris.retrieve('xgboost', self.region, '1.5-1'),
            entry_point='train.py',
            source_dir='training',
            role=self.role,
            instance_count=1,
            instance_type='ml.m5.large',
            hyperparameters=hyperparameters,
            output_path=f's3://{self.bucket}/funko-price-prediction/models/',
            sagemaker_session=self.session
        )
        
        # Set up data channels
        train_input = TrainingInput(s3_train_path, content_type='text/csv')
        validation_input = TrainingInput(s3_validation_path, content_type='text/csv')
        
        # Start training
        job_name = f"funko-price-training-{int(time.time())}"
        logger.info(f"Starting training job: {job_name}")
        
        xgb_estimator.fit({
            'train': train_input,
            'validation': validation_input
        }, job_name=job_name)
        
        logger.info("✅ Training job completed!")
        return xgb_estimator
    
    def deploy_model(self, estimator):
        """Deploy trained model to SageMaker endpoint"""
        logger.info("Deploying model to SageMaker endpoint...")
        
        try:
            # Deploy the model
            predictor = estimator.deploy(
                initial_instance_count=1,
                instance_type='ml.t2.medium',
                endpoint_name=self.endpoint_name,
                serializer=sagemaker.serializers.JSONSerializer(),
                deserializer=sagemaker.deserializers.JSONDeserializer()
            )
            
            logger.info(f"✅ Model deployed successfully!")
            logger.info(f"Endpoint name: {self.endpoint_name}")
            logger.info(f"Endpoint URL: https://runtime.sagemaker.{self.region}.amazonaws.com/endpoints/{self.endpoint_name}/invocations")
            
            return predictor
            
        except Exception as e:
            logger.error(f"❌ Deployment failed: {e}")
            raise
    
    def create_model_from_artifacts(self, model_artifacts_path):
        """Create model from existing artifacts (for re-deployment)"""
        logger.info("Creating XGBoost model from artifacts...")
        
        model = XGBoostModel(
            model_data=model_artifacts_path,
            role=self.role,
            entry_point='train.py',
            source_dir='training',
            framework_version='1.5-1'
        )
        
        return model
    
    def test_endpoint(self, predictor, test_data=None):
        """Test the deployed endpoint"""
        logger.info("Testing deployed endpoint...")
        
        if test_data is None:
            # Create sample test data
            test_data = {
                "days_since_release": 365,
                "release_month": 10,
                "sale_month": 12,
                "sale_day_of_week": 5,
                "is_weekend_sale": 1,
                "is_chase": 1,
                "is_exclusive": 0,
                "is_vaulted": 0,
                "funko_number": 123,
                "series_encoded": 5,
                "character_encoded": 15,
                "condition_score": 5,
                "marketplace_encoded": 1,
                "avg_price_7d": 25.0,
                "avg_price_30d": 23.5,
                "avg_price_90d": 22.0,
                "price_volatility_30d": 3.2,
                "base_estimated_value": 15.0
            }
        
        try:
            result = predictor.predict(test_data)
            predicted_price = result['predictions'][0]
            
            logger.info(f"✅ Endpoint test successful!")
            logger.info(f"Test input: {test_data}")
            logger.info(f"Predicted price: ${predicted_price:.2f}")
            
            return predicted_price
            
        except Exception as e:
            logger.error(f"❌ Endpoint test failed: {e}")
            raise
    
    def update_endpoint_config(self, predictor, instance_type='ml.t2.medium', instance_count=1):
        """Update endpoint configuration"""
        logger.info("Updating endpoint configuration...")
        
        try:
            predictor.update_endpoint(
                initial_instance_count=instance_count,
                instance_type=instance_type
            )
            
            logger.info(f"✅ Endpoint updated successfully!")
            logger.info(f"New configuration: {instance_count}x {instance_type}")
            
        except Exception as e:
            logger.error(f"❌ Endpoint update failed: {e}")
            raise
    
    def delete_endpoint(self, endpoint_name=None):
        """Delete SageMaker endpoint"""
        endpoint_to_delete = endpoint_name or self.endpoint_name
        logger.info(f"Deleting endpoint: {endpoint_to_delete}")
        
        try:
            sagemaker_client = boto3.client('sagemaker', region_name=self.region)
            sagemaker_client.delete_endpoint(EndpointName=endpoint_to_delete)
            
            logger.info(f"✅ Endpoint {endpoint_to_delete} deleted successfully!")
            
        except Exception as e:
            logger.error(f"❌ Failed to delete endpoint: {e}")
            raise
    
    def get_endpoint_status(self, endpoint_name=None):
        """Get endpoint status and metrics"""
        endpoint_to_check = endpoint_name or self.endpoint_name
        
        try:
            sagemaker_client = boto3.client('sagemaker', region_name=self.region)
            response = sagemaker_client.describe_endpoint(EndpointName=endpoint_to_check)
            
            status_info = {
                'endpoint_name': response['EndpointName'],
                'endpoint_status': response['EndpointStatus'],
                'creation_time': response['CreationTime'],
                'last_modified_time': response['LastModifiedTime'],
                'endpoint_arn': response['EndpointArn']
            }
            
            logger.info(f"Endpoint Status: {status_info}")
            return status_info
            
        except Exception as e:
            logger.error(f"❌ Failed to get endpoint status: {e}")
            raise
    
    def setup_auto_scaling(self, endpoint_name=None, min_capacity=1, max_capacity=10):
        """Setup auto-scaling for the endpoint"""
        endpoint_to_scale = endpoint_name or self.endpoint_name
        logger.info(f"Setting up auto-scaling for endpoint: {endpoint_to_scale}")
        
        try:
            autoscaling_client = boto3.client('application-autoscaling', region_name=self.region)
            
            # Register scalable target
            autoscaling_client.register_scalable_target(
                ServiceNamespace='sagemaker',
                ResourceId=f'endpoint/{endpoint_to_scale}/variant/AllTraffic',
                ScalableDimension='sagemaker:variant:DesiredInstanceCount',
                MinCapacity=min_capacity,
                MaxCapacity=max_capacity
            )
            
            # Create scaling policy
            autoscaling_client.put_scaling_policy(
                PolicyName=f'{endpoint_to_scale}-scaling-policy',
                ServiceNamespace='sagemaker',
                ResourceId=f'endpoint/{endpoint_to_scale}/variant/AllTraffic',
                ScalableDimension='sagemaker:variant:DesiredInstanceCount',
                PolicyType='TargetTrackingScaling',
                TargetTrackingScalingPolicyConfiguration={
                    'TargetValue': 70.0,
                    'PredefinedMetricSpecification': {
                        'PredefinedMetricType': 'SageMakerVariantInvocationsPerInstance'
                    },
                    'ScaleOutCooldown': 300,
                    'ScaleInCooldown': 300
                }
            )
            
            logger.info(f"✅ Auto-scaling configured! Min: {min_capacity}, Max: {max_capacity}")
            
        except Exception as e:
            logger.error(f"❌ Auto-scaling setup failed: {e}")
            raise

def main():
    """Example deployment workflow"""
    logger.info("Starting Funko Price Model deployment...")
    
    deployer = FunkoPriceModelDeployer()
    
    try:
        # For this example, we'll assume training data is already in S3
        # In practice, you'd run the data pipeline first
        
        s3_train_path = f's3://{deployer.bucket}/funko-price-prediction/train.csv'
        s3_validation_path = f's3://{deployer.bucket}/funko-price-prediction/validation.csv'
        
        # Train model
        logger.info("Step 1: Training model...")
        estimator = deployer.train_model(s3_train_path, s3_validation_path)
        
        # Deploy model
        logger.info("Step 2: Deploying model...")
        predictor = deployer.deploy_model(estimator)
        
        # Test endpoint
        logger.info("Step 3: Testing endpoint...")
        deployer.test_endpoint(predictor)
        
        # Setup auto-scaling
        logger.info("Step 4: Setting up auto-scaling...")
        deployer.setup_auto_scaling()
        
        # Get status
        logger.info("Step 5: Getting endpoint status...")
        status = deployer.get_endpoint_status()
        
        logger.info("✅ Deployment completed successfully!")
        logger.info(f"Endpoint URL: {predictor.endpoint_name}")
        
        return predictor
        
    except Exception as e:
        logger.error(f"❌ Deployment failed: {e}")
        raise

if __name__ == "__main__":
    main() 