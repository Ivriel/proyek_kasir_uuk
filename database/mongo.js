const mongoose = require("mongoose")

const connectDB = async ()=> {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongo db connected")
    } catch (error) {
        console.log("Error connecting to mongo db")
        process.exit(1)
    }
}

module.exports = connectDB