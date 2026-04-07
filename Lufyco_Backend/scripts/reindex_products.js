const connectDB = require('../config/db');
require('dotenv').config();
const Product = require('../models/Product');
const { extractFeatures } = require('../services/mlFeatureExtractor');
const axios = require('axios');
const path = require('path');



const reindex = async () => {
    try {
        console.log('🔄 Connecting to Database...');
        await connectDB();
        console.log('✅ Connected.');

        const products = await Product.find({ 
            $or: [
                { featureVector: { $exists: false } },
                { featureVector: { $size: 0 } }
            ]
        });

        console.log(`🔍 Found ${products.length} products to re-index.`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            console.log(`[${i+1}/${products.length}] Processing: ${product.name}`);

            try {
                let buffer;
                if (product.image.startsWith('http')) {
                    const res = await axios.get(product.image, { responseType: 'arraybuffer' });
                    buffer = Buffer.from(res.data);
                } else {
                    console.warn(`⚠️ Skipping ${product.name}: Image URL not supported for auto-index`);
                    continue;
                }

                const features = await extractFeatures(buffer);
                product.featureVector = features;
                await product.save();
                console.log(`✅ Indexed ${product.name}`);
            } catch (err) {
                console.error(`❌ Failed to index ${product.name}:`, err.message);
            }
        }

        console.log('🎉 Re-indexing complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Indexing script error:', err);
        process.exit(1);
    }
};

reindex();
