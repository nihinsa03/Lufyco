const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const FRONTEND_ASSETS_DIR = path.join(__dirname, '../../Lufyco_Frontend/assets/images');
const UPLOADS_DIR = path.join(__dirname, '../public/uploads/products');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Map subdirectories to categories
const determineCategory = (filePath) => {
    const relativePath = path.relative(FRONTEND_ASSETS_DIR, filePath);
    const parts = relativePath.split(path.sep);
    if (parts.length > 0) {
        const topDir = parts[0].toLowerCase();
        if (topDir === 'categories' && parts.length > 1) {
            const subDir = parts[1].toLowerCase();
            if (subDir === 'men') return "Men's Wear";
            if (subDir === 'women') return "Women's Wear";
            if (subDir === 'jewellery') return "Jewellery";
            if (subDir === 'beauty') return "Beauty Products";
            if (subDir === 'accessories') return "Accessories";
        }
        if (topDir === 'men') return "Men's Wear";
        if (topDir === 'women') return "Women's Wear";
        return "Special Collection";
    }
    return "Trending";
};

const findImages = (dir, fileList = []) => {
    if (!fs.existsSync(dir)) {
        console.warn(`Directory not found: ${dir}`);
        return fileList;
    }
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findImages(filePath, fileList);
        } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
            // Ignore icon files generally found in root assets
            if (file.toLowerCase().includes('icon') || file === 'favicon.png' || file.includes('logo')) {
                continue;
            }
            fileList.push(filePath);
        }
    }
    return fileList;
};

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lufyco');
        console.log('📦 Connected to MongoDB');

        const images = findImages(FRONTEND_ASSETS_DIR);
        console.log(`🔍 Found ${images.length} potential product images to process...`);

        let addedCount = 0;
        let skipCount = 0;

        for (const imagePath of images) {
            const fileName = path.basename(imagePath);
            
            // Clean filename to use as product name
            const nameCleaned = fileName
                .replace(/\.[^/.]+$/, "") // Remove ext
                .replace(/[-_]/g, ' ')    // Replace dashes and underscores
                .replace(/\b\w/g, c => c.toUpperCase()); // Title case
            
            const relativeUrl = `/uploads/products/${fileName}`;
            const destinationPath = path.join(UPLOADS_DIR, fileName);

            // Duplicate Check
            const existing = await Product.findOne({
                $or: [{ name: nameCleaned }, { image: relativeUrl }]
            });

            if (existing) {
                console.log(`⏩ Skipping duplicate: ${nameCleaned}`);
                skipCount++;
                continue;
            }

            // Copy file physically
            fs.copyFileSync(imagePath, destinationPath);

            const category = determineCategory(imagePath);

            // Create document
            const newProduct = new Product({
                name: nameCleaned,
                price: 2990.00, // Default price constraint requested
                description: `High-quality ${nameCleaned.toLowerCase()} featuring premium materials. Perfect addition to your wardrobe.`,
                image: relativeUrl,
                category: category,
                subCategory: category === "Men's Wear" ? "Casuals" : "Essentials",
                gender: category === "Men's Wear" ? "Men" : category === "Women's Wear" ? "Women" : "Unisex",
                featureVector: [],
            });

            await newProduct.save();
            console.log(`✅ Added product: ${nameCleaned} | Category: ${category}`);
            addedCount++;
        }

        console.log(`\n🎉 Seeding complete! Added: ${addedCount}, Skipped: ${skipCount}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
};

seedDatabase();
