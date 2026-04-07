const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // For image decoding in pure JS mode

// Try to load native TensorFlow (GPU or CPU), fall back to pure JS
let tf;
try {
    tf = require('@tensorflow/tfjs-node-gpu');
    console.log('✅ Loaded @tensorflow/tfjs-node-gpu');
} catch (e1) {
    try {
        tf = require('@tensorflow/tfjs-node');
        console.log('✅ Loaded @tensorflow/tfjs-node');
    } catch (e2) {
        console.warn('⚠️ Native TensorFlow not found, falling back to pure JS @tensorflow/tfjs');
        tf = require('@tensorflow/tfjs');
    }
}

const MODEL_DIR = path.join(__dirname, '../models/fashion-similarity-model_tfjs');
const MODEL_PATH = path.join(MODEL_DIR, 'model.json');

let customModel = null;

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
                weightData: weightBuffers[0],   // MobileNet weights are usually sharded, but tfjs-converter concatenates them if small enough, wait!
                // Actually, if there are multiple weight files, we need to concatenate their buffers properly.
                format: modelJson.format,
                generatedBy: modelJson.generatedBy,
                convertedBy: modelJson.convertedBy,
            };
        },
    };
};

/**
 * Custom IOHandler supporting multiple shards
 */
const createFsIOHandlerMultiShard = (modelDir) => {
    const modelJsonPath = path.join(modelDir, 'model.json');
    const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf-8'));

    return {
        load: async () => {
            const weightSpecs = modelJson.weightsManifest?.[0]?.weights ?? [];
            const weightPaths = modelJson.weightsManifest?.[0]?.paths ?? [];

            // Read all shard files
            const weightBuffers = weightPaths.map(p => fs.readFileSync(path.join(modelDir, p)));

            // Concatenate all buffs into one ArrayBuffer (TF.js expects a single ArrayBuffer for weightData)
            const totalLength = weightBuffers.reduce((sum, buf) => sum + buf.length, 0);
            const concatenated = new Uint8Array(totalLength);
            let offset = 0;
            for (const buf of weightBuffers) {
                concatenated.set(buf, offset);
                offset += buf.length;
            }

            return {
                modelTopology: modelJson.modelTopology,
                weightSpecs,
                weightData: concatenated.buffer,
                format: modelJson.format,
                generatedBy: modelJson.generatedBy,
                convertedBy: modelJson.convertedBy,
            };
        },
    };
};

/**
 * Load custom trained model
 * @returns {Promise<void>}
 */
const loadCustomModel = async () => {
    if (customModel) return; // Model already loaded

    try {
        // Check if custom model exists
        if (fs.existsSync(MODEL_PATH)) {
            console.log(`🎯 Loading custom trained fashion model: ${MODEL_PATH}`);
            
            // If tfjs-node is available, use file:// protocol which is faster and more reliable
            if (tf.version_node) {
                const modelUrl = `file://${MODEL_PATH}`;
                try {
                    customModel = await tf.loadLayersModel(modelUrl);
                } catch (err) {
                    console.warn('⚠️ Failed to load as LayersModel, trying GraphModel...');
                    customModel = await tf.loadGraphModel(modelUrl);
                }
            } else {
                // Pure JS fallback
                const ioHandler = createFsIOHandlerMultiShard(MODEL_DIR);
                try {
                    customModel = await tf.loadLayersModel(ioHandler);
                } catch (err) {
                    console.warn('⚠️ Failed to load as LayersModel via custom IO, trying GraphModel...');
                    customModel = await tf.loadGraphModel(ioHandler);
                }
            }
            console.log('✅ Custom fashion model loaded successfully');
        } else {
            console.log('⚠️ Custom model not found, falling back to pre-trained MobileNet');
            // Fallback to pre-trained model
            customModel = await tf.loadGraphModel(
                'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/feature_vector/3/default/1',
                { fromTFHub: true }
            );
            console.log('✅ Pre-trained MobileNet v2 loaded as fallback');
        }
    } catch (error) {
        console.error('❌ Error loading model:', error);
        throw error;
    }
};

/**
 * Extract feature vector from image buffer using custom or pre-trained model
 * @param {Buffer} imageBuffer - Image buffer from uploaded file
 * @returns {Promise<Array>} Feature vector
 */
const extractFeaturesCustom = async (imageBuffer) => {
    try {
        // Ensure model is loaded
        await loadCustomModel();

        let imageTensor;

        // Use tf.node.decodeImage if available (native backend)
        if (tf.node && tf.node.decodeImage) {
            imageTensor = tf.node.decodeImage(imageBuffer, 3);
        } else {
            // Fallback: Decode using sharp (pure JS backend)
            const { data, info } = await sharp(imageBuffer)
                .removeAlpha()
                .resize(224, 224, { fit: 'fill' }) // Resize directly for efficiency
                .raw()
                .toBuffer({ resolveWithObject: true });

            imageTensor = tf.tensor3d(new Uint8Array(data), [224, 224, 3]);
        }

        // Processing (Resize if not already, Normalize)
        let processedTensor = imageTensor;

        // If we didn't resize in sharp (native path), resize here
        if (tf.node && tf.node.decodeImage) {
            processedTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
        } else {
            // Sharp already resized to 224x224, but ensure float32
            processedTensor = imageTensor.toFloat();
        }

        // Normalize pixel values to [0, 1]
        const normalized = processedTensor.div(255.0);

        // Add batch dimension
        const batched = normalized.expandDims(0);

        // Get feature vector from model
        const features = customModel.predict(batched);

        // Convert to array
        const featureArray = await features.data();
        const featureVector = Array.from(featureArray);

        // Cleanup tensors
        imageTensor.dispose();
        if (processedTensor !== imageTensor) processedTensor.dispose();
        normalized.dispose();
        batched.dispose();
        features.dispose();

        return featureVector;
    } catch (error) {
        console.error('Feature extraction error:', error);
        throw error;
    }
};

/**
 * Calculate cosine similarity between two feature vectors
 * @param {Array} vector1 - First feature vector
 * @param {Array} vector2 - Second feature vector
 * @returns {Number} Similarity score (0-100)
 */
const cosineSimilarity = (vector1, vector2) => {
    if (vector1.length !== vector2.length) {
        throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
        dotProduct += vector1[i] * vector2[i];
        norm1 += vector1[i] * vector1[i];
        norm2 += vector2[i] * vector2[i];
    }

    const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
    const similarity = denom === 0 ? 0 : dotProduct / denom;

    // Convert to 0-100 scale
    return Math.round((similarity + 1) * 50); // Cosine ranges from -1 to 1
};

/**
 * Find similar products based on feature vector
 * @param {Array} queryVector - Feature vector of query image
 * @param {Array} products - Array of products with featureVectors
 * @param {Number} topK - Number of top results to return
 * @returns {Array} Ranked similar products
 */
const findSimilarProducts = (queryVector, products, topK = 10) => {
    // Filter products that have valid feature vectors
    const productsWithFeatures = products.filter(p => p.featureVector && p.featureVector.length > 0);
    console.log(`🔍 Finding similar products among ${queryVector} with feature vectors`);

    if (productsWithFeatures.length > 0 && queryVector && queryVector.length > 0) {
        // ML-based similarity search
        try {
            const results = productsWithFeatures
                .map(product => ({
                    product,
                    similarity: cosineSimilarity(queryVector, product.featureVector)
                }))
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, topK);
            return results;
        } catch (err) {
            console.warn('⚠️ Cosine similarity failed:', err.message);
        }
    }

    // Fallback: return random products with a note that ML matching wasn't available
    console.log('⚠️ No products have feature vectors - using fallback (random) results');
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, topK).map(product => ({
        product,
        similarity: Math.floor(Math.random() * 20) + 60, // 60-80% placeholder
        fallback: true
    }));
};

/**
 * Get model info
 * @returns {Object} Model information
 */
const getModelInfo = () => {
    return {
        isCustomModel: fs.existsSync(MODEL_PATH),
        modelPath: MODEL_PATH,
        backend: tf.getBackend(),
        memory: tf.memory()
    };
};

module.exports = {
    loadCustomModel,
    extractFeatures: extractFeaturesCustom,
    cosineSimilarity,
    findSimilarProducts,
    getModelInfo
};
