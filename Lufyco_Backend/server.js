const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to Database
const connectDB = require('./config/db');
console.log('Attempting to connect to MongoDB...');
connectDB();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
    next();
});

/**
 * Serve uploaded user files as static files
 * Example:
 * DB path: userFiles\\69c246...\\closets\\1.jpg
 * Public URL: http://YOUR_IP:5001/uploads/69c246.../closets/1.jpg
 */


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const closetRoutes = require('./routes/closetRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const aiRoutes = require('./routes/aiRoutes');
const registerExtractDetailsRoute = require("./ai_extract_details/node/registerExtractDetailsRoute");
const extractDetailsRoute = require("./ai_extract_details/node/extractDetails.route");

registerExtractDetailsRoute(app);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/closet', closetRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/ai-new", extractDetailsRoute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.send('Lufyco Clothing Backend is running!');
});

// Final Error Handler
app.use((err, req, res, next) => {
    // Catch JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Invalid JSON received:', err.message);
        return res.status(400).json({ message: 'Invalid JSON', error: err.message });
    }

    console.error('Global Server Error:', err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});