const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("ACTUAL MONGO_URI:", process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`); // 👈 meka aluth line eka

        return conn;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;