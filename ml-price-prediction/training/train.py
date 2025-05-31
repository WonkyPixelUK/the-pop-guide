import argparse
import pandas as pd
import xgboost as xgb
import joblib
import json
import os
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import numpy as np
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def model_fn(model_dir):
    """Load model for inference"""
    model = joblib.load(os.path.join(model_dir, "model.joblib"))
    return model

def input_fn(request_body, request_content_type):
    """Parse input data for inference"""
    logger.info(f"Received request with content type: {request_content_type}")
    
    if request_content_type == "application/json":
        input_data = json.loads(request_body)
        # Convert to DataFrame with expected feature order
        return pd.DataFrame([input_data])
    elif request_content_type == "text/csv":
        return pd.read_csv(pd.StringIO(request_body), header=None)
    else:
        raise ValueError(f"Unsupported content type: {request_content_type}")

def predict_fn(input_data, model):
    """Make predictions"""
    logger.info(f"Making prediction for input shape: {input_data.shape}")
    
    # Convert DataFrame to numpy array for XGBoost
    if isinstance(input_data, pd.DataFrame):
        input_array = input_data.values
    else:
        input_array = input_data
    
    # Create DMatrix for XGBoost
    dtest = xgb.DMatrix(input_array)
    predictions = model.predict(dtest)
    
    logger.info(f"Generated {len(predictions)} predictions")
    return predictions

def output_fn(prediction, content_type):
    """Format output"""
    if content_type == "application/json":
        return json.dumps({
            "predictions": prediction.tolist(),
            "model_version": "1.0.0"
        })
    elif content_type == "text/csv":
        return pd.DataFrame(prediction).to_csv(index=False, header=False)
    else:
        raise ValueError(f"Unsupported content type: {content_type}")

def calculate_metrics(y_true, y_pred):
    """Calculate model performance metrics"""
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    
    # Calculate MAPE (Mean Absolute Percentage Error)
    mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
    
    return {
        'mae': mae,
        'mse': mse,
        'rmse': rmse,
        'r2': r2,
        'mape': mape
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    
    # SageMaker specific arguments
    parser.add_argument("--model-dir", type=str, default=os.environ.get("SM_MODEL_DIR"))
    parser.add_argument("--train", type=str, default=os.environ.get("SM_CHANNEL_TRAIN"))
    parser.add_argument("--validation", type=str, default=os.environ.get("SM_CHANNEL_VALIDATION"))
    
    # XGBoost hyperparameters
    parser.add_argument("--max-depth", type=int, default=6)
    parser.add_argument("--eta", type=float, default=0.2)
    parser.add_argument("--gamma", type=int, default=4)
    parser.add_argument("--min-child-weight", type=int, default=6)
    parser.add_argument("--subsample", type=float, default=0.8)
    parser.add_argument("--colsample-bytree", type=float, default=0.8)
    parser.add_argument("--num-round", type=int, default=1000)
    parser.add_argument("--early-stopping-rounds", type=int, default=50)
    parser.add_argument("--objective", type=str, default="reg:squarederror")
    
    args = parser.parse_args()
    
    logger.info("Starting XGBoost training for Funko price prediction...")
    logger.info(f"Hyperparameters: {vars(args)}")
    
    try:
        # Load training data
        logger.info("Loading training data...")
        train_data = pd.read_csv(os.path.join(args.train, "train.csv"), header=None)
        val_data = pd.read_csv(os.path.join(args.validation, "validation.csv"), header=None)
        
        logger.info(f"Training data shape: {train_data.shape}")
        logger.info(f"Validation data shape: {val_data.shape}")
        
        # Prepare data for XGBoost
        X_train = train_data.iloc[:, 1:].values  # Features (skip target column)
        y_train = train_data.iloc[:, 0].values   # Target (first column)
        
        X_val = val_data.iloc[:, 1:].values
        y_val = val_data.iloc[:, 0].values
        
        logger.info(f"Feature dimensions: {X_train.shape[1]}")
        logger.info(f"Training samples: {len(y_train)}")
        logger.info(f"Validation samples: {len(y_val)}")
        
        # Log target variable statistics
        logger.info(f"Target statistics - Train: min={y_train.min():.2f}, max={y_train.max():.2f}, mean={y_train.mean():.2f}")
        logger.info(f"Target statistics - Val: min={y_val.min():.2f}, max={y_val.max():.2f}, mean={y_val.mean():.2f}")
        
        # Create DMatrix for XGBoost
        dtrain = xgb.DMatrix(X_train, label=y_train)
        dval = xgb.DMatrix(X_val, label=y_val)
        
        # XGBoost parameters
        params = {
            'max_depth': args.max_depth,
            'eta': args.eta,
            'gamma': args.gamma,
            'min_child_weight': args.min_child_weight,
            'subsample': args.subsample,
            'colsample_bytree': args.colsample_bytree,
            'objective': args.objective,
            'eval_metric': ['mae', 'rmse'],
            'tree_method': 'auto',
            'random_state': 42
        }
        
        logger.info(f"XGBoost parameters: {params}")
        
        # Train model with early stopping
        logger.info("Training XGBoost model...")
        model = xgb.train(
            params=params,
            dtrain=dtrain,
            num_boost_round=args.num_round,
            evals=[(dtrain, 'train'), (dval, 'validation')],
            early_stopping_rounds=args.early_stopping_rounds,
            verbose_eval=50  # Print every 50 rounds
        )
        
        logger.info("Training completed!")
        
        # Make predictions for evaluation
        logger.info("Evaluating model performance...")
        train_pred = model.predict(dtrain)
        val_pred = model.predict(dval)
        
        # Calculate metrics
        train_metrics = calculate_metrics(y_train, train_pred)
        val_metrics = calculate_metrics(y_val, val_pred)
        
        # Log metrics
        logger.info("Training Metrics:")
        for metric, value in train_metrics.items():
            logger.info(f"  {metric.upper()}: {value:.4f}")
        
        logger.info("Validation Metrics:")
        for metric, value in val_metrics.items():
            logger.info(f"  {metric.upper()}: {value:.4f}")
        
        # Feature importance
        importance = model.get_score(importance_type='weight')
        logger.info("Top 10 most important features:")
        sorted_importance = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:10]
        for feature, score in sorted_importance:
            logger.info(f"  {feature}: {score}")
        
        # Save model
        logger.info(f"Saving model to {args.model_dir}")
        joblib.dump(model, os.path.join(args.model_dir, "model.joblib"))
        
        # Save feature importance
        with open(os.path.join(args.model_dir, "feature_importance.json"), 'w') as f:
            json.dump(importance, f)
        
        # Save metrics
        metrics_summary = {
            'training_metrics': train_metrics,
            'validation_metrics': val_metrics,
            'hyperparameters': vars(args),
            'feature_count': X_train.shape[1],
            'training_samples': len(y_train),
            'validation_samples': len(y_val)
        }
        
        with open(os.path.join(args.model_dir, "metrics.json"), 'w') as f:
            json.dump(metrics_summary, f, indent=2)
        
        # Save model info for inference
        model_info = {
            'model_type': 'xgboost',
            'version': '1.0.0',
            'feature_count': X_train.shape[1],
            'objective': args.objective,
            'performance': {
                'validation_mae': val_metrics['mae'],
                'validation_r2': val_metrics['r2']
            }
        }
        
        with open(os.path.join(args.model_dir, "model_info.json"), 'w') as f:
            json.dump(model_info, f, indent=2)
        
        logger.info("✅ Model training completed successfully!")
        logger.info(f"Final Validation MAE: {val_metrics['mae']:.2f}")
        logger.info(f"Final Validation R²: {val_metrics['r2']:.3f}")
        logger.info(f"Final Validation MAPE: {val_metrics['mape']:.2f}%")
        
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        raise 