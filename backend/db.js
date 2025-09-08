const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URI;  // Use env variable from Vercel

const connectToMongo = async () => {
    try {
        if (!mongoURI) {
            throw new Error("MongoDB URI not found in environment variables");
        }

        await mongoose.connect(mongoURI);

        console.log("✅ Connected to MongoDB Atlas");
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB", error);
        process.exit(1);
    }
};

module.exports = connectToMongo;
