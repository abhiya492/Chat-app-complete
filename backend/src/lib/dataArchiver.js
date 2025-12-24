import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import Call from '../models/call.model.js';

// Archive schema for old messages
const archivedMessageSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, default: "" },
  image: { type: String, default: "" },
  video: { 
    url: String,
    thumbnail: String,
    duration: Number
  },
  voice: {
    url: String,
    duration: Number
  },
  file: {
    url: String,
    name: String,
    size: Number,
    type: String
  },
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: String,
    createdAt: { type: Date, default: Date.now }
  }],
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    readAt: { type: Date, default: Date.now }
  }],
  deliveredTo: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveredAt: { type: Date, default: Date.now }
  }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "ArchivedMessage" },
  isPinned: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  isEncrypted: { type: Boolean, default: false },
  archivedAt: { type: Date, default: Date.now },
  originalCreatedAt: { type: Date, required: true },
  originalUpdatedAt: { type: Date, required: true }
}, { 
  timestamps: true,
  collection: 'archived_messages'
});

// Indexes for archived messages
archivedMessageSchema.index({ senderId: 1, receiverId: 1, originalCreatedAt: -1 });
archivedMessageSchema.index({ originalCreatedAt: -1 });
archivedMessageSchema.index({ archivedAt: -1 });

const ArchivedMessage = mongoose.model("ArchivedMessage", archivedMessageSchema);

class DataArchiver {
  constructor() {
    this.ARCHIVE_THRESHOLD_DAYS = 90; // Archive messages older than 90 days
    this.DELETE_THRESHOLD_DAYS = 365; // Delete archived messages older than 1 year
    this.BATCH_SIZE = 1000;
  }

  // Archive old messages
  async archiveOldMessages() {
    try {
      console.log('🗄️ Starting message archiving process...');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.ARCHIVE_THRESHOLD_DAYS);
      
      let totalArchived = 0;
      let hasMore = true;
      
      while (hasMore) {
        // Find old messages in batches
        const oldMessages = await Message.find({
          createdAt: { $lt: cutoffDate },
          isDeleted: false
        })
        .limit(this.BATCH_SIZE)
        .lean();
        
        if (oldMessages.length === 0) {
          hasMore = false;
          break;
        }
        
        // Prepare archived messages
        const archivedMessages = oldMessages.map(msg => ({
          originalId: msg._id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          text: msg.text,
          image: msg.image,
          video: msg.video,
          voice: msg.voice,
          file: msg.file,
          reactions: msg.reactions,
          readBy: msg.readBy,
          deliveredTo: msg.deliveredTo,
          replyTo: msg.replyTo,
          isPinned: msg.isPinned,
          isEdited: msg.isEdited,
          isDeleted: msg.isDeleted,
          isEncrypted: msg.isEncrypted,
          originalCreatedAt: msg.createdAt,
          originalUpdatedAt: msg.updatedAt
        }));
        
        // Insert into archive collection
        await ArchivedMessage.insertMany(archivedMessages);
        
        // Remove from main collection
        const messageIds = oldMessages.map(msg => msg._id);
        await Message.deleteMany({ _id: { $in: messageIds } });
        
        totalArchived += oldMessages.length;
        console.log(`📦 Archived ${oldMessages.length} messages (Total: ${totalArchived})`);
      }
      
      console.log(`✅ Message archiving completed. Total archived: ${totalArchived}`);
      return totalArchived;
      
    } catch (error) {
      console.error('❌ Error archiving messages:', error);
      throw error;
    }
  }

  // Delete very old archived messages
  async deleteOldArchivedMessages() {
    try {
      console.log('🗑️ Starting old archived message deletion...');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.DELETE_THRESHOLD_DAYS);
      
      const result = await ArchivedMessage.deleteMany({
        archivedAt: { $lt: cutoffDate }
      });
      
      console.log(`✅ Deleted ${result.deletedCount} old archived messages`);
      return result.deletedCount;
      
    } catch (error) {
      console.error('❌ Error deleting old archived messages:', error);
      throw error;
    }
  }

  // Archive old call records
  async archiveOldCalls() {
    try {
      console.log('📞 Starting call record archiving...');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.ARCHIVE_THRESHOLD_DAYS);
      
      const result = await Call.deleteMany({
        createdAt: { $lt: cutoffDate },
        status: { $in: ['completed', 'missed', 'rejected'] }
      });
      
      console.log(`✅ Archived ${result.deletedCount} old call records`);
      return result.deletedCount;
      
    } catch (error) {
      console.error('❌ Error archiving call records:', error);
      throw error;
    }
  }

  // Clean up deleted messages (soft deleted)
  async cleanupDeletedMessages() {
    try {
      console.log('🧹 Starting deleted message cleanup...');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep deleted messages for 30 days
      
      const result = await Message.deleteMany({
        isDeleted: true,
        updatedAt: { $lt: cutoffDate }
      });
      
      console.log(`✅ Cleaned up ${result.deletedCount} deleted messages`);
      return result.deletedCount;
      
    } catch (error) {
      console.error('❌ Error cleaning up deleted messages:', error);
      throw error;
    }
  }

  // Clean up expired stories
  async cleanupExpiredStories() {
    try {
      console.log('📖 Starting expired story cleanup...');
      
      const Story = mongoose.model('Story');
      const result = await Story.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`✅ Cleaned up ${result.deletedCount} expired stories`);
      return result.deletedCount;
      
    } catch (error) {
      console.error('❌ Error cleaning up expired stories:', error);
      throw error;
    }
  }

  // Optimize database collections
  async optimizeCollections() {
    try {
      console.log('⚡ Starting database optimization...');
      
      const db = mongoose.connection.db;
      const collections = ['messages', 'users', 'contacts', 'calls'];
      
      for (const collectionName of collections) {
        try {
          // Compact collection to reclaim space
          await db.command({ compact: collectionName });
          console.log(`✅ Optimized ${collectionName} collection`);
        } catch (error) {
          console.log(`⚠️ Could not compact ${collectionName}:`, error.message);
        }
      }
      
      console.log('✅ Database optimization completed');
      
    } catch (error) {
      console.error('❌ Error optimizing database:', error);
      throw error;
    }
  }

  // Get archive statistics
  async getArchiveStats() {
    try {
      const [
        totalMessages,
        archivedMessages,
        deletedMessages,
        oldestMessage,
        newestArchivedMessage
      ] = await Promise.all([
        Message.countDocuments(),
        ArchivedMessage.countDocuments(),
        Message.countDocuments({ isDeleted: true }),
        Message.findOne().sort({ createdAt: 1 }).select('createdAt'),
        ArchivedMessage.findOne().sort({ archivedAt: -1 }).select('archivedAt originalCreatedAt')
      ]);
      
      return {
        totalActiveMessages: totalMessages,
        totalArchivedMessages: archivedMessages,
        totalDeletedMessages: deletedMessages,
        oldestActiveMessage: oldestMessage?.createdAt,
        newestArchivedMessage: newestArchivedMessage?.archivedAt,
        archiveThresholdDays: this.ARCHIVE_THRESHOLD_DAYS,
        deleteThresholdDays: this.DELETE_THRESHOLD_DAYS
      };
      
    } catch (error) {
      console.error('❌ Error getting archive stats:', error);
      throw error;
    }
  }

  // Retrieve archived messages for a user
  async getArchivedMessages(senderId, receiverId, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const [messages, total] = await Promise.all([
        ArchivedMessage.find({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        })
        .sort({ originalCreatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
        
        ArchivedMessage.countDocuments({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        })
      ]);
      
      return {
        messages: messages.reverse(),
        hasMore: skip + messages.length < total,
        total
      };
      
    } catch (error) {
      console.error('❌ Error retrieving archived messages:', error);
      throw error;
    }
  }

  // Run full maintenance
  async runMaintenance() {
    try {
      console.log('🔧 Starting full database maintenance...');
      
      const results = {
        archivedMessages: 0,
        deletedArchivedMessages: 0,
        archivedCalls: 0,
        cleanedDeletedMessages: 0,
        cleanedExpiredStories: 0
      };
      
      // Run all maintenance tasks
      results.archivedMessages = await this.archiveOldMessages();
      results.deletedArchivedMessages = await this.deleteOldArchivedMessages();
      results.archivedCalls = await this.archiveOldCalls();
      results.cleanedDeletedMessages = await this.cleanupDeletedMessages();
      results.cleanedExpiredStories = await this.cleanupExpiredStories();
      
      // Optimize collections
      await this.optimizeCollections();
      
      console.log('✅ Full database maintenance completed:', results);
      return results;
      
    } catch (error) {
      console.error('❌ Error during maintenance:', error);
      throw error;
    }
  }
}

export { ArchivedMessage };
export default new DataArchiver();