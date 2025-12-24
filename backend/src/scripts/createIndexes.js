import mongoose from 'mongoose';
import { connectDB } from '../lib/db.js';

const createIndexes = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    
    console.log('🔍 Creating database indexes...');
    
    // User Collection Indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ googleId: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ githubId: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ fullName: 'text', email: 'text' });
    await db.collection('users').createIndex({ createdAt: 1 });
    await db.collection('users').createIndex({ blockedUsers: 1 });
    
    // Message Collection Indexes
    await db.collection('messages').createIndex({ senderId: 1, receiverId: 1, createdAt: -1 });
    await db.collection('messages').createIndex({ receiverId: 1, createdAt: -1 });
    await db.collection('messages').createIndex({ senderId: 1, createdAt: -1 });
    await db.collection('messages').createIndex({ createdAt: -1 });
    await db.collection('messages').createIndex({ text: 'text' });
    await db.collection('messages').createIndex({ isPinned: 1 });
    await db.collection('messages').createIndex({ isDeleted: 1 });
    await db.collection('messages').createIndex({ scheduledFor: 1 }, { sparse: true });
    await db.collection('messages').createIndex({ 'readBy.userId': 1 });
    await db.collection('messages').createIndex({ 'deliveredTo.userId': 1 });
    
    // Contact Collection Indexes
    await db.collection('contacts').createIndex({ requester: 1, recipient: 1 }, { unique: true });
    await db.collection('contacts').createIndex({ requester: 1, status: 1 });
    await db.collection('contacts').createIndex({ recipient: 1, status: 1 });
    await db.collection('contacts').createIndex({ group: 1 });
    await db.collection('contacts').createIndex({ isFavorite: 1 });
    
    // Call Collection Indexes
    await db.collection('calls').createIndex({ callerId: 1, createdAt: -1 });
    await db.collection('calls').createIndex({ receiverId: 1, createdAt: -1 });
    await db.collection('calls').createIndex({ status: 1 });
    await db.collection('calls').createIndex({ createdAt: -1 });
    
    // Room Collection Indexes
    await db.collection('rooms').createIndex({ createdBy: 1 });
    await db.collection('rooms').createIndex({ isPublic: 1 });
    await db.collection('rooms').createIndex({ createdAt: -1 });
    
    // Challenge Collection Indexes
    await db.collection('challenges').createIndex({ challenger: 1, opponent: 1 });
    await db.collection('challenges').createIndex({ challenger: 1, status: 1 });
    await db.collection('challenges').createIndex({ opponent: 1, status: 1 });
    await db.collection('challenges').createIndex({ createdAt: -1 });
    
    // Game Progress Indexes
    await db.collection('gameprogresses').createIndex({ userId: 1 });
    await db.collection('gameprogresses').createIndex({ level: 1 });
    await db.collection('gameprogresses').createIndex({ xp: -1 });
    
    // Story Collection Indexes
    await db.collection('stories').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('stories').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    // Streak Collection Indexes
    await db.collection('streaks').createIndex({ user1: 1, user2: 1 }, { unique: true });
    await db.collection('streaks').createIndex({ lastMessageDate: -1 });
    
    // Wellness Collection Indexes
    await db.collection('wellnessdata').createIndex({ userId: 1, date: -1 });
    await db.collection('wellnessdata').createIndex({ userId: 1, createdAt: -1 });
    
    // Compound indexes for common queries
    await db.collection('messages').createIndex({ 
      senderId: 1, 
      receiverId: 1, 
      isDeleted: 1, 
      createdAt: -1 
    });
    
    await db.collection('contacts').createIndex({ 
      requester: 1, 
      status: 1, 
      group: 1 
    });
    
    console.log('✅ All indexes created successfully');
    
    // List all indexes
    const collections = ['users', 'messages', 'contacts', 'calls', 'rooms', 'challenges'];
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).listIndexes().toArray();
      console.log(`📋 ${collectionName} indexes:`, indexes.map(i => i.name));
    }
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    mongoose.connection.close();
  }
};

export default createIndexes;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createIndexes();
}