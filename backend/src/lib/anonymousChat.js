import mongoose from 'mongoose';
import crypto from 'crypto';

// Anonymous session schema
const anonymousSessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    anonymousId: { type: String, required: true },
    nickname: { type: String, default: 'Anonymous' }
  }],
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
  settings: {
    allowNicknames: { type: Boolean, default: true },
    autoDestruct: { type: Boolean, default: true },
    destructAfter: { type: Number, default: 3600000 } // 1 hour in ms
  }
}, { timestamps: true });

// TTL index for auto-cleanup
anonymousSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AnonymousSession = mongoose.model('AnonymousSession', anonymousSessionSchema);

// Anonymous message schema
const anonymousMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  senderId: { type: String, required: true }, // Anonymous ID
  message: { type: String, required: true },
  isEncrypted: { type: Boolean, default: true },
  messageHash: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

anonymousMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
anonymousMessageSchema.index({ sessionId: 1, createdAt: -1 });

const AnonymousMessage = mongoose.model('AnonymousMessage', anonymousMessageSchema);

class AnonymousChatService {
  
  // Create anonymous session
  async createSession(userId, settings = {}) {
    const sessionId = crypto.randomUUID();
    const anonymousId = this.generateAnonymousId();
    
    const session = new AnonymousSession({
      sessionId,
      participants: [{
        userId,
        anonymousId,
        nickname: settings.nickname || 'Anonymous'
      }],
      settings: {
        allowNicknames: settings.allowNicknames ?? true,
        autoDestruct: settings.autoDestruct ?? true,
        destructAfter: settings.destructAfter || 3600000
      }
    });
    
    await session.save();
    return { sessionId, anonymousId };
  }

  // Join anonymous session
  async joinSession(sessionId, userId, nickname = 'Anonymous') {
    const session = await AnonymousSession.findOne({ sessionId, isActive: true });
    if (!session) {
      throw new Error('Session not found or expired');
    }

    // Check if user already in session
    const existingParticipant = session.participants.find(
      p => p.userId.toString() === userId.toString()
    );
    
    if (existingParticipant) {
      return { sessionId, anonymousId: existingParticipant.anonymousId };
    }

    // Add new participant
    const anonymousId = this.generateAnonymousId();
    session.participants.push({
      userId,
      anonymousId,
      nickname: session.settings.allowNicknames ? nickname : 'Anonymous'
    });
    
    await session.save();
    return { sessionId, anonymousId };
  }

  // Send anonymous message
  async sendMessage(sessionId, senderId, message, isEncrypted = true) {
    const session = await AnonymousSession.findOne({ sessionId, isActive: true });
    if (!session) {
      throw new Error('Session not found or expired');
    }

    // Verify sender is participant
    const participant = session.participants.find(p => p.anonymousId === senderId);
    if (!participant) {
      throw new Error('Unauthorized');
    }

    // Calculate expiry based on session settings
    const expiresAt = new Date(Date.now() + session.settings.destructAfter);
    
    // Generate message hash for integrity
    const messageHash = crypto.createHash('sha256').update(message).digest('hex');

    const anonymousMessage = new AnonymousMessage({
      sessionId,
      senderId,
      message,
      isEncrypted,
      messageHash,
      expiresAt
    });

    await anonymousMessage.save();
    return anonymousMessage;
  }

  // Get session messages
  async getMessages(sessionId, userId, page = 1, limit = 50) {
    const session = await AnonymousSession.findOne({ sessionId, isActive: true });
    if (!session) {
      throw new Error('Session not found or expired');
    }

    // Verify user is participant
    const isParticipant = session.participants.some(
      p => p.userId.toString() === userId.toString()
    );
    
    if (!isParticipant) {
      throw new Error('Unauthorized');
    }

    const skip = (page - 1) * limit;
    const messages = await AnonymousMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      messages: messages.reverse(),
      session: {
        sessionId: session.sessionId,
        participants: session.participants.map(p => ({
          anonymousId: p.anonymousId,
          nickname: p.nickname
        })),
        settings: session.settings
      }
    };
  }

  // End anonymous session
  async endSession(sessionId, userId) {
    const session = await AnonymousSession.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify user is participant
    const isParticipant = session.participants.some(
      p => p.userId.toString() === userId.toString()
    );
    
    if (!isParticipant) {
      throw new Error('Unauthorized');
    }

    session.isActive = false;
    session.expiresAt = new Date(); // Expire immediately
    await session.save();

    // Delete all messages immediately
    await AnonymousMessage.deleteMany({ sessionId });
    
    return { message: 'Session ended and messages destroyed' };
  }

  // Generate anonymous ID
  generateAnonymousId() {
    return 'anon_' + crypto.randomBytes(8).toString('hex');
  }

  // Get active sessions for user
  async getUserSessions(userId) {
    const sessions = await AnonymousSession.find({
      'participants.userId': userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).select('sessionId participants.anonymousId participants.nickname createdAt settings');

    return sessions.map(session => {
      const userParticipant = session.participants.find(
        p => p.userId.toString() === userId.toString()
      );
      
      return {
        sessionId: session.sessionId,
        anonymousId: userParticipant?.anonymousId,
        nickname: userParticipant?.nickname,
        participantCount: session.participants.length,
        createdAt: session.createdAt,
        settings: session.settings
      };
    });
  }

  // Clean up expired sessions (called by scheduler)
  async cleanupExpiredSessions() {
    const result = await AnonymousSession.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ]
    });

    // Also clean up orphaned messages
    const messageResult = await AnonymousMessage.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    return {
      sessionsDeleted: result.deletedCount,
      messagesDeleted: messageResult.deletedCount
    };
  }
}

export { AnonymousSession, AnonymousMessage };
export default new AnonymousChatService();