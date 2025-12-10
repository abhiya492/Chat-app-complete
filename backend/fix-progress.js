import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Delete all GameProgress documents
    const result = await mongoose.connection.db.collection('gameprogresses').deleteMany({});
    console.log(`Deleted ${result.deletedCount} GameProgress documents`);
    
    console.log('Done! Restart your app and new documents will be created with correct schema.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
