import mongoose from 'mongoose';

const testMongoDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';
    
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test basic operations
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    await TestModel.create({ test: 'MongoDB is working!' });
    const result = await TestModel.findOne({ test: 'MongoDB is working!' });
    
    console.log('✅ Database operations working:', result);
    
    await TestModel.deleteOne({ test: 'MongoDB is working!' });
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Connection closed');
  }
};

testMongoDB();