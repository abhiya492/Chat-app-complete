import mongoose from 'mongoose';

export const connectDB=async ()=>{
    try{
        const conn =await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 5,
            minPoolSize: 1,
            socketTimeoutMS: 30000,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            retryReads: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`); 
    }   catch (error) {
        console.log("MongoDB Connection error:",error);
        process.exit(1);
    }
};