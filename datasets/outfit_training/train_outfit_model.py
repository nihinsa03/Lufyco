"""
train_outfit_model.py
---------------------
Trains a neural network on outfit_dataset.csv and exports it to TF.js format.

Requirements:
    pip install tensorflow tensorflowjs numpy pandas scikit-learn

Usage:
    python train_outfit_model.py

Output:
    ../../Lufyco_Backend/models/outfit-recommendation-model_tfjs/
    model.json + weight files
"""

import os
import sys
import json
import shutil
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

# -- Compatibility patch: tensorflowjs internally uses deprecated np.bool/np.int/np.complex
# -- which were removed in numpy 1.24+. Patch them back before importing tfjs.
np.bool    = bool
np.int     = int
np.float   = float
np.complex = complex
np.object  = object
np.str     = str

# --- Paths ------------------------------------------------------------------
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, 'outfit_dataset.csv')
OUTPUT_DIR   = os.path.join(SCRIPT_DIR, '..', '..', 'Lufyco_Backend', 'models',
                             'outfit-recommendation-model_tfjs')

# --- Load Dataset -----------------------------------------------------------
print("Loading dataset...")
df = pd.read_csv(DATASET_PATH)
print("  Rows:", len(df), " | Positive:", int(df['label'].sum()),
      " | Negative:", int((df['label'] == 0).sum()))

# --- Feature Engineering ---------------------------------------------------
CATEGORICAL_COLS = ['top', 'bottom', 'shoes', 'occasion', 'weather_condition', 'mood']
TARGET_COL       = 'label'

df_encoded = pd.get_dummies(df[CATEGORICAL_COLS], prefix=CATEGORICAL_COLS)

scaler = MinMaxScaler()
df_encoded['temp_c_scaled'] = scaler.fit_transform(df[['temp_c']])

X = df_encoded.astype(np.float32).values
y = df[TARGET_COL].astype(np.float32).values

print("  Feature vector size:", X.shape[1])

# Save metadata
feature_cols = list(df_encoded.columns)
meta = {
    'feature_columns': feature_cols,
    'categorical_cols': CATEGORICAL_COLS,
    'temp_min': float(scaler.data_min_[0]),
    'temp_max': float(scaler.data_max_[0]),
}
meta_path = os.path.join(SCRIPT_DIR, 'outfit_model_meta.json')
with open(meta_path, 'w') as f:
    json.dump(meta, f, indent=2)
print("  Metadata saved ->", meta_path)

# --- Train / Val Split ------------------------------------------------------
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.15, random_state=42)

# --- Build Model ------------------------------------------------------------
print("\nBuilding neural network...")
try:
    import tensorflow as tf
except ImportError:
    print("ERROR: TensorFlow not found. Run: pip install tensorflow tensorflowjs")
    sys.exit(1)

model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(X.shape[1],)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid'),
], name='outfit_recommender')

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='binary_crossentropy',
    metrics=['accuracy', tf.keras.metrics.AUC(name='auc')],
)
model.summary()

# --- Train ------------------------------------------------------------------
print("\nTraining...")
early_stop = tf.keras.callbacks.EarlyStopping(
    monitor='val_auc', patience=8, restore_best_weights=True, mode='max'
)

history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=80,
    batch_size=256,
    callbacks=[early_stop],
    verbose=1,
)

# --- Evaluate ---------------------------------------------------------------
val_loss, val_acc, val_auc = model.evaluate(X_val, y_val, verbose=0)
print("\nValidation Results:")
print("  Loss:    ", round(val_loss, 4))
print("  Accuracy:", round(val_acc, 4))
print("  AUC:     ", round(val_auc, 4))

# --- Save Keras model -------------------------------------------------------
h5_path = os.path.join(SCRIPT_DIR, 'outfit_model.h5')
model.save(h5_path)
print("\nKeras model saved ->", h5_path)

# --- Export to TF.js --------------------------------------------------------
print("\nExporting to TF.js ->", OUTPUT_DIR)
try:
    import tensorflowjs as tfjs
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    tfjs.converters.save_keras_model(model, OUTPUT_DIR)
    print("TF.js model exported successfully")
    print("Files created:")
    for fname in os.listdir(OUTPUT_DIR):
        print("  -", fname)
except ImportError:
    print("ERROR: tensorflowjs not found.")
    print("  Run: pip install tensorflowjs")
    print("  Or convert manually:")
    print("    tensorflowjs_converter --input_format=keras", h5_path, OUTPUT_DIR)

# Copy meta file into model dir
meta_dest = os.path.join(OUTPUT_DIR, 'outfit_model_meta.json')
try:
    shutil.copy(meta_path, meta_dest)
    print("Meta file copied ->", meta_dest)
except Exception as e:
    print("Could not copy meta file:", e)

print("\nDone! The model is ready for the Node.js backend.")
