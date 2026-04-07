/**
 * outfitService.js
 * ----------------
 * Generates outfit recommendations using:
 *   1. ML scoring (outfitMLService) — ranks item combinations by neural net score
 *   2. Rule-based fallback — random pick (original behaviour) if ML unavailable
 */

const Product = require('../models/Product');
const outfitMLService = require('./outfitMLService');
const ClosetItem = require("../models/ClosetItem");

// ─── Weather helpers ─────────────────────────────────────────────────────────

/**
 * Convert weather object from the API call into { conditionStr, tempC }
 * Handles both Fahrenheit (legacy) and Celsius inputs.
 */
const parseWeather = (weather) => {
    let tempC = 22; // default moderate
    if (weather?.temperature !== undefined) {
        const t = Number(weather.temperature);
        // If temp looks like Fahrenheit (> 50), convert
        tempC = t > 50 ? (t - 32) * 5 / 9 : t;
    }
    const conditionStr = weather?.condition || 'Clear';
    return { conditionStr, tempC };
};

// ─── Product categorisation ───────────────────────────────────────────────────

const categorizeProducts = (products) => ({
    tops: products.filter(p => ['Tops', 'Shirt', 'Blouse', 'T-Shirt', 'Dress'].includes(p.subCategory || p.type)),
    bottoms: products.filter(p => ['Bottoms', 'Pants', 'Jeans', 'Shorts', 'Skirt'].includes(p.subCategory || p.type)),
    dresses: products.filter(p => ['Dress', 'Dresses'].includes(p.subCategory || p.category)),
    outerwear: products.filter(p => ['Outerwear', 'Jacket', 'Hoodie', 'Sweater', 'Coat'].includes(p.type || p.subCategory)),
    shoes: products.filter(p => ['Shoes', 'Footwear', 'Casual Shoes', 'Sports Shoes', 'Heels', 'Boots', 'Sandals']
        .includes(p.category || p.subCategory || p.type)),
});

const randomPick = (array) => array[Math.floor(Math.random() * array.length)];

// ─── Weather-based pre-filter ─────────────────────────────────────────────────

const filterByWeather = (products, conditionStr, tempC) => {
    const isHot = tempC > 28 || ['Sunny', 'Clear'].includes(conditionStr);
    const isCold = tempC < 15 || ['Rain', 'Snow', 'Fog'].includes(conditionStr);

    if (isHot) {
        return products.filter(p => {
            const t = (p.type || '').toLowerCase();
            return !['hoodie', 'sweater', 'jacket', 'coat'].includes(t);
        });
    }
    return products; // cold or moderate → keep all
};
// ─── Gender-based filter ────────────────────────────────────────────────────────

const filterByGender = (products, gender) => {
    if (!gender) return products; // no gender filter
    return products.filter(p => {
        const productGender = p.gender || 'Unisex';
        return productGender === gender || productGender === 'Unisex';
    });
};
// ─── ML-powered outfit builder ────────────────────────────────────────────────

/**
 * Map a Mongoose product to the clothing type string the ML model expects.
 */
const productToMLType = (product) => {
    const t = product.type || '';
    const s = product.subCategory || '';
    // Order matters — match most specific first
    const candidates = [t, s].map(x => x.trim());
    const knownTypes = ['Shirt', 'T-Shirt', 'Blouse', 'Hoodie', 'Sweater', 'Jacket',
        'Coat', 'Jeans', 'Pants', 'Shorts', 'Skirt', 'Dress',
        'Casual Shoes', 'Sports Shoes', 'Heels', 'Boots', 'Sandals'];
    for (const c of candidates) {
        if (knownTypes.includes(c)) return c;
    }
    return t || s || 'Shirt'; // fallback
};

/**
 * Use the ML model to pick the best top+bottom+shoes combo.
 * Falls back to randomPick if ML is unavailable.
 * @param {Object} categorized - products categorized by type
 * @param {string} occasion - e.g., 'Casual', 'Office', 'Party'
 * @param {string} conditionStr - weather condition
 * @param {number} tempC - temperature in Celsius
 * @param {string} mood - e.g., 'Happy', 'Professional'
 * @param {string} gender - user's gender (for filtering, not ML input yet)
 */
const mlAssembleOutfit = async (categorized, occasion, conditionStr, tempC, mood, gender) => {
    const outfit = [];
    const useDress = categorized.dresses.length > 0 &&
        ['Party', 'Date', 'Wedding'].includes(occasion) &&
        Math.random() < 0.30;

    if (useDress) {
        outfit.push(randomPick(categorized.dresses));
        // Score and pick shoes
        if (categorized.shoes.length > 0) {
            if (outfitMLService.isReady()) {
                const dress = outfit[0];
                const ranked = await outfitMLService.rankOutfits(
                    categorized.shoes.map(s => ({
                        raw: s,
                        top: productToMLType(dress),
                        bottom: 'Skirt',
                        shoes: productToMLType(s),
                    })),
                    occasion, conditionStr, tempC, mood
                );
                outfit.push(ranked[0].raw);
            } else {
                outfit.push(randomPick(categorized.shoes));
            }
        }
    } else {
        // Build all top × bottom × shoes combinations (cap at 50 for performance)
        const tops = categorized.tops.slice(0, 10);
        const bottoms = categorized.bottoms.slice(0, 10);
        const shoes = categorized.shoes.slice(0, 10);

        if (tops.length > 0 && bottoms.length > 0 && shoes.length > 0 &&
            outfitMLService.isReady()) {

            // Generate candidate combos
            const candidates = [];
            for (const top of tops) {
                for (const bottom of bottoms) {
                    for (const shoe of shoes) {
                        candidates.push({
                            rawTop: top, rawBottom: bottom, rawShoes: shoe,
                            top: productToMLType(top),
                            bottom: productToMLType(bottom),
                            shoes: productToMLType(shoe),
                        });
                    }
                }
            }

            // Rank all combos in one batch call
            const ranked = await outfitMLService.rankOutfits(
                candidates, occasion, conditionStr, tempC, mood
            );

            const best = ranked[0];
            outfit.push(best.rawTop, best.rawBottom, best.rawShoes);
            console.log(`✅ [OutfitService] ML ranked ${candidates.length} combos — best score: ${best.mlScore}`);

        } else {
            // Fallback: random pick
            if (tops.length > 0) outfit.push(randomPick(tops));
            if (bottoms.length > 0) outfit.push(randomPick(bottoms));
            if (shoes.length > 0) outfit.push(randomPick(shoes));
        }
    }

    // Optionally add outerwear (cold weather or 20% chance)
    const isCold = tempC < 15 || ['Snow', 'Rain', 'Fog'].includes(conditionStr);
    if (categorized.outerwear.length > 0 && (isCold || Math.random() < 0.2)) {
        outfit.push(randomPick(categorized.outerwear));
    }

    return outfit.filter(Boolean);
};

// ─── Accessories ─────────────────────────────────────────────────────────────

const suggestAccessories = (outfit, occasion) => {
    const accessories = [];
    if (['Office', 'Wedding', 'Date'].includes(occasion)) {
        accessories.push({ name: 'Classic Watch', price: 120.00, image: 'https://via.placeholder.com/100' });
    }
    if (['Party', 'Date'].includes(occasion)) {
        accessories.push({ name: 'Designer Perfume', price: 85.00, image: 'https://via.placeholder.com/100' });
    }
    return accessories;
};

const calculateTotalPrice = (items) =>
    items.reduce((sum, item) => sum + (item.price || 0), 0);

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Generate an AI-scored outfit recommendation.
 *
 * @param {Object} params
 * @param {string} params.mood
 * @param {string} params.occasion
 * @param {Object} params.weather   { condition, temperature }
 * @param {string} params.userId
 * @param {string} params.gender - 'Men', 'Women', 'Kids', or falsy for all
 */
const generateOutfit = async ({ mood, occasion, weather, userId, gender }) => {
    console.log('Generating outfit with params:', { mood, occasion, weather, userId, gender });     
    try {
        // 1. Build MongoDB query based on occasion (keep existing logic)
        let query = {};
        if (occasion) {
            switch (occasion.toLowerCase()) {
                case 'office':
                    query.$and = [
                        { type: { $nin: ['T-Shirt', 'Hoodie'] } },
                        { subCategory: { $ne: 'Shorts' } },
                    ];
                    break;
                case 'wedding':
                    query.category = { $in: ['Clothing', 'Formal'] };
                    break;
                default:
                    break;
            }
        }

        // 2. Fetch products
        const allProducts = await Product.find(query);

        // 3. Parse weather
        const { conditionStr, tempC } = parseWeather(weather);

        // 4. Weather pre-filter
        const weatherFiltered = filterByWeather(allProducts, conditionStr, tempC);

        // 4.5 Gender filter
        const genderFiltered = filterByGender(weatherFiltered, gender);

        // 5. Categorise
        const categorized = categorizeProducts(genderFiltered);

        // 6. ML-powered outfit assembly (with rule-based fallback built in)
        const outfitItems = await mlAssembleOutfit(
            categorized, occasion || 'Casual', conditionStr, tempC, mood || 'Happy', gender
        );

        // 7. Accessories
        const accessories = suggestAccessories(outfitItems, occasion);

        return {
            items: outfitItems,
            accessories,
            totalPrice: calculateTotalPrice(outfitItems),
            mood,
            occasion,
            weather,
            mlPowered: outfitMLService.isReady(),
        };
    } catch (error) {
        console.error('Outfit generation error:', error);
        throw error;
    }
};

const getRandomClosetItems = async (userId, occasion) => {
  try {
    const count = await ClosetItem.countDocuments({
      user: userId,
      ...(occasion && { occasion })
    });

    const sampleSize = count >= 3 ? 3 : count;

    const items = sampleSize > 0
      ? await ClosetItem.aggregate([
          {
            $match: {
              user: userId,
              ...(occasion && { occasion })
            }
          },
          {
            $sample: { size: sampleSize }
          }
        ])
      : [];

    // Normalize each item (fill missing fields with null)
    const normalizedItems = items.map(item => ({
      _id: item._id || null,
      name: item.name || null,
      price: item.price ?? null,
      description: item.description || null,
      image: item.image || null,
      category: item.category || null,
      subCategory: item.subCategory || null,
      type: item.type || null,
      gender: item.gender || null,
      colors: item.colors || null,
      reviewsCount: item.reviewsCount ?? null,
      sizes: item.sizes || null,
      isNewArrival: item.isNewArrival ?? null,
      rating: item.rating ?? null,
      featureVector: item.featureVector || [],
      occasion: item.occasion || null,
      quantity: item.quantity ?? null
    }));

    // Final payload
    const payload = {
      outfitId: `outfit_${Date.now()}`,
      outfit: {
        items: normalizedItems,
        accessories: [], // default
        totalPrice: normalizedItems.reduce((sum, i) => sum + (i.price || 0), 0),
        mood: null,
        occasion: occasion || null,
        weather: null,
        mlPowered: false
      }
    };

    return payload;

  } catch (error) {
    console.error('Error creating outfit payload:', error);
    throw error;
  }
};


module.exports = { generateOutfit, getRandomClosetItems };
