const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/RishStay";

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to Mongo");
    } catch (error) {
        console.error("Failed to connect to Mongo", error);
        process.exit(1);
    }
};

module.exports = connectToMongo;
