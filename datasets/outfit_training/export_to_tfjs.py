"""
export_to_tfjs.py
-----------------
Standalone script that patches numpy compatibility issues and exports the
trained Keras model to TF.js format.

Run AFTER train_outfit_model.py has completed:
    python export_to_tfjs.py
"""

import os
import sys

# Patch deprecated numpy types BEFORE any other import
import numpy as np
np.bool    = bool
np.int     = int
np.float   = float
np.complex = complex
np.object  = object
np.str     = str

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
H5_PATH     = os.path.join(SCRIPT_DIR, 'outfit_model.h5')
OUTPUT_DIR  = os.path.join(SCRIPT_DIR, '..', '..', 'Lufyco_Backend', 'models',
                            'outfit-recommendation-model_tfjs')
META_SRC    = os.path.join(SCRIPT_DIR, 'outfit_model_meta.json')
META_DEST   = os.path.join(OUTPUT_DIR, 'outfit_model_meta.json')

if not os.path.exists(H5_PATH):
    print("ERROR: outfit_model.h5 not found.")
    print("  Run train_outfit_model.py first.")
    sys.exit(1)

print("Loading Keras model from:", H5_PATH)
import tensorflow as tf
model = tf.keras.models.load_model(H5_PATH)
print("Model loaded. Summary:")
model.summary()

print("\nExporting to TF.js ->", OUTPUT_DIR)
try:
    import tensorflowjs as tfjs
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    tfjs.converters.save_keras_model(model, OUTPUT_DIR)
    print("Export complete. Files:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
        print(f"  {f}  ({size:,} bytes)")
except Exception as e:
    print("ERROR during TF.js export:", e)
    sys.exit(1)

# Copy metadata
import shutil
try:
    shutil.copy(META_SRC, META_DEST)
    print("\nMeta file copied to model dir.")
except Exception as e:
    print("Could not copy meta:", e)

print("\nDone! Node.js backend will load from:", OUTPUT_DIR)
