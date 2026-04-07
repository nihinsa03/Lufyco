# Outfit Model Training

This folder contains the Python scripts to generate training data and train the neural network for outfit compatibility scoring.

## Quick Start

```bash
# 1. Install Python dependencies (one-time)
pip install tensorflow tensorflowjs numpy pandas scikit-learn

# 2. Generate the dataset
python generate_dataset.py
# Output: outfit_dataset.csv  (~12,000 rows)

# 3. Train the model and export to TF.js
python train_outfit_model.py
# Output: ../../Lufyco_Backend/models/outfit-recommendation-model_tfjs/
```

## Files

| File | Purpose |
|---|---|
| `generate_dataset.py` | Generates synthetic outfit compatibility dataset |
| `train_outfit_model.py` | Trains neural network and exports to TF.js |
| `outfit_dataset.csv` | Generated dataset (created after step 2) |
| `outfit_model.h5` | Keras model checkpoint (created after step 3) |
| `outfit_model_meta.json` | Feature column metadata used at inference time |

## Model Architecture

```
Input (26 features: one-hot encoded clothing + occasion + weather + mood + scaled temp)
  └── Dense(128, relu)
  └── Dropout(0.2)
  └── Dense(64, relu)
  └── Dropout(0.2)
  └── Dense(32, relu)
  └── Dense(1, sigmoid)   → compatibility score 0.0–1.0
```

## Notes
- You only need to run these scripts **once** to generate the model files
- After that the backend uses `@tensorflow/tfjs-node` to run inference
- If the model files don't exist, the backend falls back to the original rule-based outfit picker
