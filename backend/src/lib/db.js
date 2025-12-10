import mongoose from 'mongoose';

export const connectDB=async ()=>{
    try{
        const conn =await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`); 
    }   catch (error) {
        console.log("MongoDB Connection error:",error);
    }
};