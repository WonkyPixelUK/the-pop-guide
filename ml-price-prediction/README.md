# 🤖 Funko Pop AI Price Prediction System

A complete AWS SageMaker-based machine learning system for predicting Funko Pop collectible prices using XGBoost and advanced feature engineering.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase DB   │ -> │  Data Pipeline  │ -> │   S3 Storage    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App UI    │ <- │  FastAPI/Lambda │ <- │  SageMaker      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- AWS Account with SageMaker access
- Python 3.8+ 
- Terraform (for infrastructure)
- Supabase project (already set up)

### 1. Infrastructure Setup

```bash
# Navigate to infrastructure directory
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Deploy infrastructure
terraform apply
```

### 2. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 3. Environment Configuration

Create `.env` file:

```env
# AWS Configuration
AWS_REGION=us-west-2
SAGEMAKER_ENDPOINT_NAME=funko-price-endpoint

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
REACT_APP_ML_API_URL=http://localhost:8000
```

### 4. Run the Data Pipeline

```bash
# Set environment variables
export SUPABASE_URL="your_supabase_url"
export SUPABASE_ANON_KEY="your_supabase_anon_key"

# Run data pipeline
cd data-pipeline
python data_pipeline.py
```

### 5. Train and Deploy Model

```bash
# Deploy model to SageMaker
cd deployment
python deploy_model.py
```

### 6. Start the API Server

```bash
# Start FastAPI server
cd api
uvicorn prediction_api:app --host 0.0.0.0 --port 8000 --reload
```

## 📊 Features Engineered

The ML model uses these features for price prediction:

### Time-Based Features
- `days_since_release` - Days between release date and prediction date
- `release_month` - Month of original release
- `sale_month` - Month of predicted sale
- `sale_day_of_week` - Day of week (0=Monday, 6=Sunday)
- `is_weekend_sale` - Binary flag for weekend sales

### Rarity Features
- `is_chase` - Chase variant flag
- `is_exclusive` - Store exclusive flag
- `is_vaulted` - Vaulted/discontinued flag
- `funko_number` - Funko Pop number in series

### Categorical Features
- `series_encoded` - Encoded series name
- `character_encoded` - Encoded character name
- `condition_score` - Condition rating (1-5)
- `marketplace_encoded` - Encoded marketplace

### Historical Price Features
- `avg_price_7d` - 7-day rolling average price
- `avg_price_30d` - 30-day rolling average price
- `avg_price_90d` - 90-day rolling average price
- `price_volatility_30d` - 30-day price standard deviation
- `base_estimated_value` - Base estimated value from database

## 🔧 API Endpoints

### Health Check
```http
GET /health
```

### Single Prediction
```http
POST /predict
Content-Type: application/json

{
  "funko_pop_id": "12345",
  "condition": "mint",
  "marketplace": "ebay",
  "future_days": 30
}
```

### Batch Prediction
```http
POST /predict/batch
Content-Type: application/json

{
  "funko_pop_ids": ["12345", "67890"],
  "condition": "mint",
  "marketplace": "ebay",
  "future_days": 30
}
```

### Price History
```http
GET /history/{funko_pop_id}?days=90
```

### Model Status
```http
GET /model/status
```

## 📈 Model Performance

Expected model metrics:
- **MAE (Mean Absolute Error)**: < $5.00
- **R² Score**: > 0.75
- **MAPE (Mean Absolute Percentage Error)**: < 20%

## 🎯 Prediction Response Format

```json
{
  "funko_pop_id": "12345",
  "funko_name": "Batman #01",
  "series": "DC Comics",
  "predicted_price": 25.50,
  "confidence_score": 0.85,
  "price_range": {
    "min": 20.25,
    "max": 30.75
  },
  "factors": {
    "is_chase": 0,
    "is_exclusive": 1,
    "is_vaulted": 0,
    "condition": "mint",
    "marketplace": "ebay",
    "days_since_release": 365
  },
  "prediction_date": "2025-01-31T10:30:00Z",
  "model_version": "1.0.0"
}
```

## 🔄 Retraining Process

### Automated Retraining (Weekly)
The system can be configured for automatic weekly retraining:

1. **Data Collection**: New price data is continuously collected
2. **Feature Engineering**: Features are re-engineered with latest data
3. **Model Training**: XGBoost model is retrained on SageMaker
4. **Model Validation**: Performance metrics are evaluated
5. **Deployment**: New model replaces old one if performance improves

### Manual Retraining
```bash
# Trigger manual retraining
cd deployment
python deploy_model.py --retrain
```

## 📊 Monitoring & Alerts

The system includes comprehensive monitoring:

- **Endpoint Latency**: Alerts if response time > 5 seconds
- **Error Rate**: Alerts if 4XX errors > 5 per 5 minutes
- **Model Drift**: Monitors prediction distribution changes
- **Data Quality**: Validates input feature distributions

## 💰 Cost Optimization

### Training Costs
- **Instance Type**: `ml.m5.large` (~$0.115/hour)
- **Training Time**: ~10-20 minutes
- **Weekly Cost**: ~$1.00

### Inference Costs
- **Instance Type**: `ml.t2.medium` (~$0.0576/hour)
- **Auto Scaling**: 1-10 instances based on demand
- **Monthly Cost**: ~$40-400 (depending on traffic)

### Storage Costs
- **S3 Storage**: ~$0.023/GB/month
- **Estimated Data**: ~1GB
- **Monthly Cost**: ~$0.03

## 🛠️ Development Workflow

### Adding New Features

1. **Update Data Pipeline**:
   ```python
   # In data_pipeline.py
   features_df['new_feature'] = calculate_new_feature(data)
   ```

2. **Update Training Script**:
   ```python
   # In train.py - feature names list
   feature_names.append('new_feature')
   ```

3. **Update API**:
   ```python
   # In prediction_api.py
   features['new_feature'] = calculate_new_feature(funko_data)
   ```

4. **Retrain Model**:
   ```bash
   python deploy_model.py --retrain
   ```

### Testing

```bash
# Run unit tests
pytest tests/

# Test API endpoints
pytest tests/test_api.py

# Test data pipeline
pytest tests/test_pipeline.py
```

## 🚨 Troubleshooting

### Common Issues

**SageMaker Endpoint Not Found**
```bash
# Check endpoint status
aws sagemaker describe-endpoint --endpoint-name funko-price-endpoint
```

**Training Job Fails**
```bash
# Check training logs
aws logs get-log-events --log-group-name /aws/sagemaker/TrainingJobs/funko-price-predictor
```

**API Connection Issues**
```bash
# Test local API
curl -X GET http://localhost:8000/health
```

**Data Pipeline Errors**
```bash
# Check Supabase connection
python -c "from supabase import create_client; print('Connected!')"
```

## 📚 References

- [AWS SageMaker Documentation](https://docs.aws.amazon.com/sagemaker/)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Python Client](https://github.com/supabase/supabase-py)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for the Funko Pop collecting community** 