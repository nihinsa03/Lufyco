const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { extractFeatures } = require('../services/mlFeatureExtractor');
const axios = require('axios');
const buildImageUrl = require("../utils/buildImageUrl");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         image:
 *           type: string
 *         categoryId:
 *           type: string
 *         category:
 *           type: string
 *         subCategory:
 *           type: string
 *         type:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *         isNewArrival:
 *           type: boolean
 *         isPopular:
 *           type: boolean
 *         rating:
 *           type: number
 *         reviews:
 *           type: number
 *         oldPrice:
 *           type: number
 *         featureVector:
 *           type: array
 *           items:
 *             type: number
 *         occasion:
 *           type: array
 *           items:
 *             type: string
 *         quantity:
 *           type: number
 */

const normalizeOccasions = (occasionValue) => {
  if (Array.isArray(occasionValue)) {
    return occasionValue.filter(Boolean);
  }
  if (typeof occasionValue === 'string' && occasionValue.trim()) {
    return [occasionValue.trim()];
  }
  return ['General'];
};

const mapProduct = (p) => {
  const builtImages = buildImageUrl(p.image);

  return {
    id: p._id,
    title: p.name,
    name: p.name,
    price: p.price,
    description: p.description,
    images: builtImages,
    image: Array.isArray(builtImages) ? builtImages[0] : builtImages,
    categoryId: p.category,
    category: p.category,
    subCategory: p.subCategory,
    type: p.type,
    tags: [
      p.category ? p.category.toLowerCase() : 'fashion',
      p.type ? p.type.toLowerCase() : 'fashion'
    ],
    colors: p.colors && p.colors.length > 0 ? p.colors : ['#000000', '#FFFFFF'],
    sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
    isNewArrival: typeof p.isNewArrival === 'boolean' ? p.isNewArrival : true,
    isPopular: p.reviewsCount > 5 || p.price > 2000,
    rating: p.rating || 4.5,
    reviews: p.reviewsCount || Math.floor(Math.random() * 50) + 10,
    oldPrice: p.compareAtPrice,
    featureVector: p.featureVector,
    occasion: normalizeOccasions(p.occasion),
    quantity: p.quantity || 0
  };
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get products with filtering, search, sorting, and pagination
 *     tags: [Products]
 */
// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const {
      gender,
      category,
      subCategory,
      type,
      search,
      isSale,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    let query = { isActive: { $ne: false } };

    if (gender) query.gender = gender;
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (isSale === 'true') {
      query.compareAtPrice = { $gt: 0 };
      query.$expr = { $gt: ["$compareAtPrice", "$price"] };
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    let productsQuery = Product.find(query);

    if (sort) {
      if (sort === 'price_low_to_high') {
        productsQuery = productsQuery.sort({ price: 1 });
      } else if (sort === 'price_high_to_low') {
        productsQuery = productsQuery.sort({ price: -1 });
      } else if (sort === 'whats_new') {
        productsQuery = productsQuery.sort({ createdAt: -1 });
      } else if (sort === 'popularity') {
        productsQuery = productsQuery.sort({ reviewsCount: -1, createdAt: -1 });
      } else {
        productsQuery = productsQuery.sort({ createdAt: -1 });
      }
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const totalProducts = await Product.countDocuments(query);

    const products = await productsQuery
      .skip(skip)
      .limit(limitNumber);

    const mappedProducts = products.map(mapProduct);

    res.json({
      products: mappedProducts,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limitNumber),
        hasNextPage: skip + products.length < totalProducts,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error('❌ Error in GET /api/products:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch products' });
  }
});

/**
 * @swagger
 * /api/products/getAllProducts:
 *   get:
 *     summary: Get all products without filters
 *     tags: [Products]
 */
// @route   GET /api/products/getAllProducts
router.get('/getAllProducts', async (req, res) => {
  try {
    const products = await Product.find({ isActive: { $ne: false } }).sort({ createdAt: -1 });
    const mappedProducts = products.map(mapProduct);

    res.json({ products: mappedProducts });
  } catch (error) {
    console.error('❌ Error in /getAllProducts:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/byCategory:
 *   get:
 *     summary: Get products for a category grouped by occasion
 *     tags: [Products]
 */
// @route   GET /api/products/byCategory
router.get('/byCategory', async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: 'Missing category parameter' });
    }

    const products = await Product.find({
      category,
      isActive: { $ne: false }
    }).sort({ createdAt: -1 });

    const mappedProducts = products.map(mapProduct);

    const groupedByOccasion = mappedProducts.reduce((acc, product) => {
      const occasions = normalizeOccasions(product.occasion);

      occasions.forEach((occasion) => {
        if (!acc[occasion]) acc[occasion] = [];
        acc[occasion].push(product);
      });

      return acc;
    }, {});

    const grouped = Object.entries(groupedByOccasion).map(([occasion, items]) => ({
      occasion,
      products: items,
    }));

    res.json({ category, groups: grouped });
  } catch (error) {
    console.error('❌ Error in /byCategory:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/getCategories:
 *   get:
 *     summary: Get all distinct product categories
 *     tags: [Products]
 */
// @route   GET /api/products/getCategories
router.get('/getCategories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: { $ne: false } });
    res.json({ categories: categories.filter(cat => cat !== null && cat !== undefined) });
  } catch (error) {
    console.error('❌ Error in /getCategories:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get dynamically aggregated categories from products
 *     tags: [Products]
 */
// @route   GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $match: {
          isActive: { $ne: false },
          category: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$category",
          image: { $first: "$image" },
          gender: { $first: "$gender" }
        }
      }
    ]);

    const mappedCategories = categories.map((cat, index) => ({
      id: `cat_dyn_${index}`,
      name: cat._id || 'Uncategorized',
      image: buildImageUrl(cat.image),
      gender: cat.gender ? String(cat.gender).toLowerCase() : 'unisex'
    }));

    res.json({
      categories: mappedCategories.filter(c => c.name !== 'Uncategorized')
    });
  } catch (error) {
    console.error('❌ Error in /categories:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/types:
 *   get:
 *     summary: Get product types for a selected main category
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 */
// @route   GET /api/products/types?category=Men
router.get('/types', async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: 'Missing category parameter' });
    }

    const products = await Product.find({
      category,
      isActive: { $ne: false },
      type: { $ne: null }
    }).sort({ createdAt: -1 });

    const typeMap = new Map();

    products.forEach((product) => {
      const typeName = product.type && String(product.type).trim();
      if (!typeName) return;

      if (!typeMap.has(typeName)) {
        typeMap.set(typeName, {
          type: typeName,
          image: buildImageUrl(product.image)
        });
      }
    });

    const result = Array.from(typeMap.values());

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /types:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/byCategoryType:
 *   get:
 *     summary: Get products filtered by category and type, grouped by occasion
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 */
// @route   GET /api/products/byCategoryType?category=Men&type=T-Shirt
router.get('/byCategoryType', async (req, res) => {
  try {
    const { category, type } = req.query;

    if (!category || !type) {
      return res.status(400).json({ message: 'Missing category or type parameter' });
    }

    const products = await Product.find({
      category,
      type,
      isActive: { $ne: false }
    }).sort({ createdAt: -1 });

    const mappedProducts = products.map(mapProduct);

    const groupedByOccasion = mappedProducts.reduce((acc, product) => {
      const occasions = normalizeOccasions(product.occasion);

      occasions.forEach((occasionName) => {
        if (!acc[occasionName]) {
          acc[occasionName] = [];
        }
        acc[occasionName].push(product);
      });

      return acc;
    }, {});

    const OCCASION_ORDER = ['Casual', 'Formal', 'Party', 'Gym', 'Sports', 'Work'];

    let groups = Object.entries(groupedByOccasion).map(([occasion, items]) => ({
      occasion,
      products: items
    }));

    groups.sort((a, b) => {
      const iA = OCCASION_ORDER.indexOf(a.occasion);
      const iB = OCCASION_ORDER.indexOf(b.occasion);
      return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB);
    });

    res.json({
      category,
      type,
      totalProducts: mappedProducts.length,
      groups
    });
  } catch (error) {
    console.error('❌ Error in /byCategoryType:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/byCategoryUpdate:
 *   get:
 *     summary: Get products for a category grouped by occasion and subCategory
 *     tags: [Products]
 */
// @route   GET /api/products/byCategoryUpdate
router.get('/byCategoryUpdate', async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: 'Missing category parameter' });
    }

    const products = await Product.find({
      category,
      isActive: { $ne: false }
    }).sort({ createdAt: -1 });

    const mappedProducts = products.map(mapProduct);

    const groupedByOccasion = mappedProducts.reduce((acc, product) => {
      const occasions = normalizeOccasions(product.occasion);
      const subCategoryKey = product.subCategory || 'Others';

      occasions.forEach((occasionKey) => {
        if (!acc[occasionKey]) {
          acc[occasionKey] = {};
        }

        if (!acc[occasionKey][subCategoryKey]) {
          acc[occasionKey][subCategoryKey] = [];
        }

        acc[occasionKey][subCategoryKey].push(product);
      });

      return acc;
    }, {});

    let grouped = Object.entries(groupedByOccasion).map(([occasion, subCategories]) => ({
      occasion,
      subCategories: Object.entries(subCategories).map(([subCategory, items]) => ({
        subCategory,
        products: items
      }))
    }));

    const OCCASION_ORDER = ['Casual', 'Formal', 'Party', 'Gym', 'Sports', 'Work'];

    grouped.sort((a, b) => {
      const iA = OCCASION_ORDER.indexOf(a.occasion);
      const iB = OCCASION_ORDER.indexOf(b.occasion);
      return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB);
    });

    grouped.forEach(group => {
      group.subCategories.sort((a, b) => a.subCategory.localeCompare(b.subCategory));
    });

    res.json({
      category,
      totalProducts: mappedProducts.length,
      groups: grouped
    });
  } catch (error) {
    console.error('❌ Error in /byCategoryUpdate:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 */
// @route   POST /api/products
router.post('/', async (req, res) => {
  const { name, price, description, image, category } = req.body;

  try {
    const product = new Product({
      name,
      price,
      description,
      image,
      category,
    });

    if (image && image.startsWith('http')) {
      try {
        const response = await axios.get(image, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const features = await extractFeatures(buffer);
        product.featureVector = features;
        console.log(`🤖 Auto-indexed new product: ${name}`);
      } catch (err) {
        console.warn(`⚠️ Failed to auto-index new product ${name}:`, err.message);
      }
    }

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('❌ Error in POST /api/products:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;