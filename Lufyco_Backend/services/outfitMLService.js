/**
 * outfitMLService.js
 * ------------------
 * TF.js inference service for the outfit compatibility model.
 *
 * Loads the trained neural network from:
 *   models/outfit-recommendation-model_tfjs/model.json
 *
 * Exposes:
 *   scoreOutfitCombination(top, bottom, shoes, occasion, weatherCondition, tempC, mood)
 *   → Promise<number>  0.0 – 1.0 (higher = better outfit match)
 */

const fs = require('fs');
const path = require('path');

// ---- TF backend (same lazy-load pattern as mlFeatureExtractor) -----------
let tf;
try {
    tf = require('@tensorflow/tfjs-node');
    console.log('✅ [OutfitML] Loaded @tensorflow/tfjs-node');
} catch {
    try {
        tf = require('@tensorflow/tfjs');
        console.log('⚠️  [OutfitML] Loaded @tensorflow/tfjs (pure JS fallback)');
    } catch {
        console.warn('❌ [OutfitML] TensorFlow not available — outfit ML disabled');
        tf = null;
    }
}

// ---- Paths ---------------------------------------------------------------
const MODEL_DIR = path.join(__dirname, '../models/outfit-recommendation-model_tfjs');
const MODEL_JSON = path.join(MODEL_DIR, 'model.json');
const META_JSON = path.join(MODEL_DIR, 'outfit_model_meta.json');

let model = null;
let modelMeta = null;
let modelReady = false;

// ---- Vocabulary (must match generate_dataset.py) -------------------------
// These are used to build the one-hot encoded feature vector at inference time.
const VOCAB = {
    top: ['Blouse', 'Coat', 'Dress', 'Hoodie', 'Jacket', 'Shirt', 'Sweater', 'T-Shirt'],
    bottom: ['Jeans', 'Pants', 'Shorts', 'Skirt'],
    shoes: ['Boots', 'Casual Shoes', 'Heels', 'Sandals', 'Sports Shoes'],
    occasion: ['Casual', 'Date', 'Office', 'Party', 'Wedding'],
    weather_condition: ['Clear', 'Cloudy', 'Rainy', 'Snow', 'Sunny'],
    mood: ['Bold', 'Happy', 'Professional', 'Relaxed', 'Romantic'],
};

const TEMP_RANGE = { min: 5, max: 40 }; // must match training scaler

// ---- Helpers -------------------------------------------------------------

/**
 * Build a one-hot + scaled numeric feature vector from outfit inputs.
 * Column order must exactly match the training feature columns.
 */
function buildFeatureVector(top, bottom, shoes, occasion, weatherCondition, tempC, mood) {
    const vec = [];

    // One-hot encode each categorical field
    const categoricals = { top, bottom, shoes, occasion, weather_condition: weatherCondition, mood };
    for (const [field, value] of Object.entries(categoricals)) {
        const options = VOCAB[field];
        for (const opt of options) {
            vec.push(opt === value ? 1.0 : 0.0);
        }
    }

    // Scaled temperature  [0, 1]
    const scaled = (tempC - TEMP_RANGE.min) / (TEMP_RANGE.max - TEMP_RANGE.min);
    vec.push(Math.max(0, Math.min(1, scaled)));

    return vec;
}

// ---- Model Loading -------------------------------------------------------

/**
 * Custom IOHandler that reads model.json and weight files from disk using Node.js fs.
 * This works with pure @tensorflow/tfjs (no tfjs-node required).
 */
const createFsIOHandler = (modelDir) => {
    const modelJsonPath = path.join(modelDir, 'model.json');
    const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf-8'));

    return {
        load: async () => {
            const weightSpecs = modelJson.weightsManifest?.[0]?.weights ?? [];
            const weightPaths = modelJson.weightsManifest?.[0]?.paths ?? [];
            const weightBuffers = weightPaths.map(p =>
                fs.readFileSync(path.join(modelDir, p)).buffer
            );

            return {
                modelTopology: modelJson.modelTopology,
                weightSpecs,
                weightData: weightBuffers[0],   // single shard
                format: modelJson.format,
                generatedBy: modelJson.generatedBy,
                convertedBy: modelJson.convertedBy,
            };
        },
    };
};

const loadModel = async () => {
    if (model) return true;                          // already loaded
    if (!tf) return false;                         // TF not available
    if (!fs.existsSync(MODEL_JSON)) {
        console.warn('⚠️  [OutfitML] model.json not found — run Python training script first');
        return false;
    }

    try {
        console.log('🎯 [OutfitML] Loading outfit recommendation model...');
        const ioHandler = createFsIOHandler(MODEL_DIR);
        model = await tf.loadLayersModel(ioHandler);

        if (fs.existsSync(META_JSON)) {
            modelMeta = JSON.parse(fs.readFileSync(META_JSON, 'utf-8'));
        }

        modelReady = true;
        console.log('✅ [OutfitML] Outfit model loaded successfully');
        return true;
    } catch (err) {
        console.error('❌ [OutfitML] Failed to load model:', err.message);
        return false;
    }
};

// ---- Public API ----------------------------------------------------------

/**
 * Score an outfit combination using the ML model.
 *
 * @param {string} top               - e.g. 'Shirt'
 * @param {string} bottom            - e.g. 'Jeans'
 * @param {string} shoes             - e.g. 'Casual Shoes'
 * @param {string} occasion          - e.g. 'Office'
 * @param {string} weatherCondition  - e.g. 'Sunny'
 * @param {number} tempC             - temperature in °C  (e.g. 28)
 * @param {string} mood              - e.g. 'Professional'
 * @returns {Promise<number|null>}   0.0–1.0 or null if model unavailable
 */
const scoreOutfitCombination = async (top, bottom, shoes, occasion, weatherCondition, tempC, mood) => {
    const ready = await loadModel();
    if (!ready || !model) return null;

    try {
        const features = buildFeatureVector(top, bottom, shoes, occasion, weatherCondition, tempC, mood);
        const inputTensor = tf.tensor2d([features]);
        const prediction = model.predict(inputTensor);
        const scoreArr = await prediction.data();
        const score = scoreArr[0];

        inputTensor.dispose();
        prediction.dispose();

        return parseFloat(score.toFixed(4));
    } catch (err) {
        console.warn('⚠️  [OutfitML] Scoring error:', err.message);
        return null;
    }
};

/**
 * Score multiple outfit candidates and return them sorted best-first.
 *
 * @param {Array<{top, bottom, shoes}>} candidates
 * @param {string} occasion
 * @param {string} weatherCondition
 * @param {number} tempC
 * @param {string} mood
 * @returns {Promise<Array<{top, bottom, shoes, score}>>}
 */
const rankOutfits = async (candidates, occasion, weatherCondition, tempC, mood) => {
    const ready = await loadModel();
    if (!ready || !model || candidates.length === 0) return candidates;

    try {
        // Batch all candidates into one forward pass
        const batchFeatures = candidates.map(c =>
            buildFeatureVector(c.top?.type || c.top, c.bottom?.type || c.bottom,
                c.shoes?.type || c.shoes, occasion, weatherCondition, tempC, mood)
        );

        const inputTensor = tf.tensor2d(batchFeatures);
        const predictions = model.predict(inputTensor);
        const scores = await predictions.data();

        inputTensor.dispose();
        predictions.dispose();

        return candidates
            .map((c, i) => ({ ...c, mlScore: parseFloat(scores[i].toFixed(4)) }))
            .sort((a, b) => b.mlScore - a.mlScore);

    } catch (err) {
        console.warn('⚠️  [OutfitML] Batch scoring error:', err.message);
        return candidates;
    }
};

/**
 * Pre-warm the model (call once at server startup if desired).
 */
const warmup = () => loadModel();

module.exports = {
    scoreOutfitCombination,
    rankOutfits,
    warmup,
    isReady: () => modelReady,
};
