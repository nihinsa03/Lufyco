const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || 'demo',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} imageBuffer - Image buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (imageBuffer, folder = 'lufyco/search') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        uploadStream.end(imageBuffer);
    });
};

/**
 * Extract dominant colors from image URL
 * @param {String} imageUrl - Cloudinary image URL
 * @returns {Promise<Array>} Array of dominant colors
 */
const extractColors = async (imageUrl) => {
    try {
        // Use Cloudinary's auto_color feature
        const analysis = await cloudinary.api.resource(imageUrl, {
            colors: true,
            max_results: 5
        });

        return analysis.colors || [];
    } catch (error) {
        console.error('Color extraction error:', error);
        return [];
    }
};

/**
 * Calculate color similarity between two color arrays
 * @param {Array} colors1 - First color array
 * @param {Array} colors2 - Second color array
 * @returns {Number} Similarity score (0-100)
 */
const calculateColorSimilarity = (colors1, colors2) => {
    if (!colors1?.length || !colors2?.length) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    colors1.slice(0, 3).forEach(color1 => {
        colors2.slice(0, 3).forEach(color2 => {
            // Simple hex color comparison
            const similarity = compareHexColors(color1, color2);
            totalSimilarity += similarity;
            comparisons++;
        });
    });

    return comparisons > 0 ? Math.round(totalSimilarity / comparisons) : 0;
};

/**
 * Compare two hex colors for similarity
 * @param {String} hex1 - First hex color
 * @param {String} hex2 - Second hex color
 * @returns {Number} Similarity score (0-100)
 */
const compareHexColors = (hex1, hex2) => {
    // Convert hex to RGB
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    if (!rgb1 || !rgb2) return 0;

    // Calculate Euclidean distance
    const distance = Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );

    // Normalize to 0-100 (max distance is ~441)
    return Math.max(0, 100 - (distance / 441) * 100);
};

/**
 * Convert hex color to RGB
 * @param {String} hex - Hex color code
 * @returns {Object} RGB object {r, g, b}
 */
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// Frontend palette we want to match exactly (must mirror PALETTE in AddToClosetPreviewScreen.tsx)
const FRONTEND_PALETTE = [
    // Neutrals
    "#000000", // Black
    "#FFFFFF", // White
    "#F5F5F5", // Off-white / Cream
    "#808080", // Gray
    // Reds
    "#FF0000", // Red
    "#8B0000", // Dark Red
    "#800000", // Maroon
    "#A52A2A", // Brown
    // Blues
    "#0000FF", // Blue
    "#000080", // Navy
    // Others
    "#00FF00", // Green
    "#008080", // Teal
    "#FFFF00", // Yellow
    "#FF8C00", // Orange
    "#FFC0CB", // Pink
    "#800080", // Purple
];

/**
 * Find the closest color in the frontend palette to a given RGB color
 * @param {Object} rgb - RGB object {r, g, b}
 * @returns {String} Closest hex color from the palette
 */
const findClosestPaletteColor = (rgb) => {
    if (!rgb) return "#000000";

    let closestColor = FRONTEND_PALETTE[0];
    let minDistance = Infinity;

    for (const hex of FRONTEND_PALETTE) {
        const paletteRgb = hexToRgb(hex);
        if (!paletteRgb) continue;

        // Calculate Euclidean distance
        const distance = Math.sqrt(
            Math.pow(rgb.r - paletteRgb.r, 2) +
            Math.pow(rgb.g - paletteRgb.g, 2) +
            Math.pow(rgb.b - paletteRgb.b, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = hex;
        }
    }

    return closestColor;
};

/**
 * Extract dominant clothing color from image buffer using smart pixel sampling.
 * Focuses on center of image and filters out skin tones, shadows, and green backgrounds.
 * @param {Buffer} imageBuffer - Image buffer from multer
 * @returns {Promise<String>} Closest hex color from the predefined palette
 */
const extractDominantColorLocal = async (imageBuffer) => {
    try {
        const sharp = require('sharp');

        // Resize to a manageable size for pixel analysis
        const { data, info } = await sharp(imageBuffer)
            .resize(80, 120, { fit: 'fill' })
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height } = info;
        const channels = 3;

        // Focus on the CENTER of the image (avoid background edges)
        // Clothing is typically the main subject in the center
        const xStart = Math.floor(width * 0.15);
        const xEnd = Math.floor(width * 0.85);
        const yStart = Math.floor(height * 0.10);
        const yEnd = Math.floor(height * 0.90);

        let rSum = 0, gSum = 0, bSum = 0, count = 0;

        for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
                const idx = (y * width + x) * channels;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];

                const brightness = (r + g + b) / 3;

                // Skip very dark pixels (shadows, dark backgrounds – likely not clothing color)
                if (brightness < 25) continue;

                // Skip very bright/white pixels (highlights, white backgrounds)
                if (brightness > 230) continue;

                // Skip skin-tone pixels (so we detect clothing not exposed skin)
                const isSkin = r > 80 && g > 50 && b > 20 &&
                    r > g && r > b &&
                    (r - g) > 8 && (r - b) > 15 &&
                    r < 250;
                if (isSkin) continue;

                // Skip dominant green pixels (outdoor background, trees, plants)
                const isGreen = g > r && g > b && (g - r) > 20 && g > 80;
                if (isGreen) continue;

                // Skip dominant blue/sky pixels
                const isSky = b > r && b > g && (b - r) > 30 && b > 100;
                if (isSky) continue;

                rSum += r;
                gSum += g;
                bSum += b;
                count++;
            }
        }

        console.log(`🎨 Clothing pixels sampled: ${count}`);

        let dominant;
        if (count < 50) {
            // Not enough clothing pixels found — try broader sampling without greenfilter
            console.warn('⚠️ Few clothing pixels, falling back to broader stats');
            const stats = await sharp(imageBuffer)
                .resize(50, 50, { fit: 'inside' })
                .removeAlpha()
                .stats();
            dominant = stats.dominant;
        } else {
            dominant = {
                r: Math.round(rSum / count),
                g: Math.round(gSum / count),
                b: Math.round(bSum / count),
            };
        }

        console.log(`🎨 Avg clothing RGB: r=${dominant.r} g=${dominant.g} b=${dominant.b}`);
        return findClosestPaletteColor(dominant);

    } catch (error) {
        console.error('Local color extraction error:', error);
        return '#000000'; // fallback
    }
};


module.exports = {
    uploadToCloudinary,
    extractColors,
    calculateColorSimilarity,
    compareHexColors,
    extractDominantColorLocal
};
