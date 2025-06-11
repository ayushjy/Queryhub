import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);  // Exit process if DB fails
    }
};

export default connectDB;
