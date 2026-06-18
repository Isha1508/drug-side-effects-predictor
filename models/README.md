# Models Directory

This directory contains trained ML models and associated files.

## Model Files

After training (see `notebooks/train_model.ipynb`), the following files should be present:

```
models/
├── side_effect_predictor_v1.joblib      # Trained model
├── side_effect_predictor_v1_labels.json # Side-effect label mapping
└── side_effect_predictor_v1_metadata.json # Model metadata
```

## Model Metadata

The metadata file contains:
- Model name and version
- Training date
- Training data statistics
- Hyperparameters
- Performance metrics
- Limitations

## Loading Models

Models are automatically loaded by:
- `backend/ml/model_inference.py` - For predictions
- `backend/ml/explainability.py` - For SHAP explanations

## Model Versioning

- Use semantic versioning (v1, v2, etc.)
- Document changes in metadata
- Keep old versions for reproducibility

## Important Notes

⚠️ **Models must be trained before the system can make predictions.**

If models are missing, the system will:
- Return error messages
- Log warnings
- Still provide database-sourced drug information

See `notebooks/train_model.ipynb` for training instructions.



