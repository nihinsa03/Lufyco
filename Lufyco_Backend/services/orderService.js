const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ClosetItem = require('../models/ClosetItem');
const SavedMyLook = require('../models/SavedMyLooks');
const { normalizeImagePath } = require('../utils/imagePath');
const buildImageUrl = require('../utils/buildImageUrl');

/**
 * Generate next closetID for a user inside transaction
 */
async function getNextClosetId(userId, session) {
    const lastItem = await ClosetItem.findOne({ user: userId })
        .sort({ closetID: -1 })
        .session(session);

    return lastItem ? Number(lastItem.closetID || 0) + 1 : 1;
}

/**
 * Convert product document to closet item payload
 */
function mapProductToClosetItem(productDoc, userId, qty, orderId, closetID) {
    const p = productDoc.toObject ? productDoc.toObject() : productDoc;

    return {
        closetID,
        user: userId,

        source: 'product',
        sourceProduct: p._id,
        sourceProductId: p.productId || null,
        sourceOrder: orderId,

        name: p.name || '',
        category: p.category || '',
        image: normalizeImagePath(p.image || ''),
        notes: `Added from order ${orderId}`,

        color: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors[0] : '',
        colors: Array.isArray(p.colors) ? p.colors : [],

        subCategory: p.subCategory || '',
        type: p.type || '',

        style_tags: Array.isArray(p.style_tags) ? p.style_tags : [],
        season_tags: Array.isArray(p.season_tags) ? p.season_tags : [],

        material: p.material || '',
        fit: p.fit || '',
        weather_tag: p.weather_tag || '',
        pattern: p.pattern || '',

        occasion: Array.isArray(p.occasion) ? p.occasion.join(', ') : (p.occasion || ''),
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        featureVector: Array.isArray(p.featureVector) ? p.featureVector : [],

        price: 0,
        quantity: qty,
        rating: 0,
        reviewsCount: 0,
        isNewArrival: false,
        isActive: true,
    };
}

/**
 * Find existing closet item from same product for same user
 */
async function findExistingClosetItem(userId, productDoc, session) {
    return ClosetItem.findOne({
        user: userId,
        sourceProduct: productDoc._id,
    }).session(session);
}

/**
 * Update SavedMyLook items: source product -> closet
 */
async function updateSavedLooksForPurchasedProduct({
    userId,
    productDoc,
    closetItemId,
    session,
}) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const looks = await SavedMyLook.find({
        user: userObjectId,
    }).session(session);

    for (const look of looks) {
        let changed = false;

        look.items = look.items.map((item) => {
            const sameMongoId =
                item.product &&
                item.product.toString() === productDoc._id.toString();

            const sameItemId =
                item._id &&
                item._id.toString() === productDoc._id.toString();

            const sameProductId =
                productDoc.productId != null &&
                item.productId != null &&
                Number(item.productId) === Number(productDoc.productId);

            const shouldConvert =
                item.source === 'product' &&
                (sameMongoId || sameItemId || sameProductId);

            if (!shouldConvert) return item;

            changed = true;

            return {
                ...(item.toObject ? item.toObject() : item),
                source: 'closet',
                closetItemId,
            };
        });

        if (changed) {
            await look.save({ session });
        }
    }
}

/**
 * Validate order payload
 */
function validateCreateOrderPayload(body) {
    const {
        user,
        orderItems,
        shippingAddress,
        paymentMethod,
    } = body;

    if (!user) {
        const err = new Error('User ID is required');
        err.statusCode = 400;
        throw err;
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        const err = new Error('No order items');
        err.statusCode = 400;
        throw err;
    }

    if (!shippingAddress) {
        const err = new Error('Shipping address is required');
        err.statusCode = 400;
        throw err;
    }

    if (!paymentMethod) {
        const err = new Error('Payment method is required');
        err.statusCode = 400;
        throw err;
    }
}

/**
 * Transform order images for GET responses
 */
function formatOrderImages(orderDoc) {
    const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;

    if (Array.isArray(order.orderItems)) {
        order.orderItems = order.orderItems.map((item) => {
            const formattedItem = { ...item };

            if (formattedItem.image) {
                formattedItem.image = buildImageUrl(formattedItem.image);
            }

            if (formattedItem.product && typeof formattedItem.product === 'object') {
                formattedItem.product = {
                    ...formattedItem.product,
                    image: buildImageUrl(formattedItem.product.image),
                };
            }

            return formattedItem;
        });
    }

    return order;
}

/**
 * Create order + update stock + add closet items + update saved looks
 */
async function createOrder(body) {
    validateCreateOrderPayload(body);

    const {
        user,
        orderItems,
        shippingAddress,
        paymentMethod,
        taxPrice = 0,
        shippingPrice = 0,
        totalPrice = 0,
    } = body;

    const session = await mongoose.startSession();

    try {
        let responseData = null;

        await session.withTransaction(async () => {
            const normalizedOrderItems = orderItems.map((item) => ({
                ...item,
                image: normalizeImagePath(item.image || ''),
            }));

            // 1. create order
            const order = new Order({
                user,
                orderItems: normalizedOrderItems,
                shippingAddress: {
                    address: shippingAddress.address || shippingAddress.addressLine || '',
                    city: shippingAddress.city || '',
                    postalCode: shippingAddress.postalCode || '',
                    country: shippingAddress.country || '',
                },
                paymentMethod:
                    typeof paymentMethod === 'object'
                        ? (paymentMethod.method || 'cash')
                        : paymentMethod,
                taxPrice,
                shippingPrice,
                totalPrice,
                OrderStatus: 'Pending',
            });

            const createdOrder = await order.save({ session });

            const updatedProducts = [];
            const createdOrUpdatedClosetItems = [];

            // 2. process order items
            for (const item of normalizedOrderItems) {
                const productRef = item.product || item._id;
                const qty = Number(item.qty || 1);

                if (!productRef) {
                    throw new Error(`Product reference missing for item ${item.name || ''}`);
                }

                const productDoc = await Product.findById(productRef).session(session);

                if (!productDoc) {
                    const err = new Error(`Product not found: ${productRef}`);
                    err.statusCode = 404;
                    throw err;
                }

                // 3. stock check
                const currentStock = Number(productDoc.quantity || 0);
                if (currentStock < qty) {
                    const err = new Error(
                        `Not enough stock for ${productDoc.name}. Available: ${currentStock}, Requested: ${qty}`
                    );
                    err.statusCode = 400;
                    throw err;
                }

                // 4. reduce product quantity
                productDoc.quantity = currentStock - qty;
                await productDoc.save({ session });

                updatedProducts.push({
                    _id: productDoc._id,
                    name: productDoc.name,
                    remainingQuantity: productDoc.quantity,
                });

                // 5. add/update closet item
                let closetItem = await findExistingClosetItem(user, productDoc, session);

                if (closetItem) {
                    closetItem.quantity = Number(closetItem.quantity || 0) + qty;
                    closetItem.image = closetItem.image || normalizeImagePath(productDoc.image || '');
                    await closetItem.save({ session });
                } else {
                    const nextClosetId = await getNextClosetId(user, session);

                    const closetItemPayload = mapProductToClosetItem(
                        productDoc,
                        user,
                        qty,
                        createdOrder._id,
                        nextClosetId
                    );

                    closetItem = await ClosetItem.create([closetItemPayload], { session });
                    closetItem = closetItem[0];
                }

                createdOrUpdatedClosetItems.push(closetItem);
                
                // 6. update saved looks
                await updateSavedLooksForPurchasedProduct({
                    userId: user,
                    productDoc,
                    closetItemId: closetItem._id,
                    session,
                });
            }

            responseData = {
                message: 'Order created successfully',
                order: formatOrderImages(createdOrder),
                updatedProducts,
                closetItems: createdOrUpdatedClosetItems.map((item) => {
                    const closet = item.toObject ? item.toObject() : item;
                    closet.image = buildImageUrl(closet.image);
                    return closet;
                }),
            };
        });

        return responseData;
    } finally {
        await session.endSession();
    }
}

async function getMyOrders(userId, status) {
    if (!userId) {
        const err = new Error('User ID is required');
        err.statusCode = 400;
        throw err;
    }

    const query = { user: userId };

    if (status) {
        if (status.toLowerCase() === 'ongoing') {
            query.OrderStatus = { $in: ['Pending', 'Processing'] };
        } else {
            query.OrderStatus = status;
        }
    }

    const orders = await Order.find(query)
        .populate('user', 'name email')
        .populate({
            path: 'orderItems.product',
            model: 'products',
            select: 'name image price productId description'
        })
        .sort({ createdAt: -1 });

    return orders.map(formatOrderImages);
}

async function getOrderById(orderId) {
    const order = await Order.findById(orderId)
        .populate('user', 'name email')
        .populate({
            path: 'orderItems.product',
            model: 'products',
            select: 'name image price productId description'
        });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    return formatOrderImages(order);
}

async function getAllOrders() {
    const orders = await Order.find({})
        .populate('user', 'name email')
        .populate({
            path: 'orderItems.product',
            model: 'products',
            select: 'name image price productId description'
        })
        .sort({ createdAt: -1 });

    return orders.map(formatOrderImages);
}

async function getOrderDetails(orderId) {
    const order = await Order.findById(orderId)
        .populate('user', 'name email')
        .populate({
            path: 'orderItems.product',
            model: 'products',
            select: 'name image price productId description'
        });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    return formatOrderImages(order);
}

async function getOrdersByStatus(orderStatus) {
    if (!orderStatus) {
        const err = new Error('OrderStatus is required');
        err.statusCode = 400;
        throw err;
    }

    const orders = await Order.find({ orderStatus: orderStatus })
        .populate('user', 'name email')
        .populate({
            path: 'orderItems.product',
            model: 'products',
            select: 'name image price productId description'
        })
        .sort({ createdAt: -1 });

    return orders.map(formatOrderImages);
}

async function getUserOrdersByStatus(userId, orderStatus) {
    if (!userId) {
        const err = new Error('User ID is required');
        err.statusCode = 400;
        throw err;
    }

    if (!orderStatus) {
        const err = new Error('OrderStatus is required');
        err.statusCode = 400;
        throw err;
    }

    const orders = await Order.find({
        user: userId,
        OrderStatus: orderStatus
    })
        .populate('user', 'name email')
        .populate({
            path: 'orderItems.product',
            model: 'products', // 🔥 important (oya case ekata)
            select: 'name image price productId description'
        })
        .sort({ createdAt: -1 });

    return orders.map(formatOrderImages);
}

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    getOrderDetails,
    getOrdersByStatus,
};