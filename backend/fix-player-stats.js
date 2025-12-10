import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Update all PlayerStats documents to include battle_royale
    const result = await mongoose.connection.db.collection('playerstats').updateMany(
      {},
      {
        $set: {
          'gameModeStats.battle_royale': { played: 0, wins: 0 }
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} PlayerStats documents`);
    console.log('Battle Royale game mode added to all player stats!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });