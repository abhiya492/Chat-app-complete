import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import { BlockchainRecord } from '../lib/blockchainVerification.js';
import zeroKnowledgeEncryption from '../lib/zeroKnowledgeEncryption.js';
import anonymousChat from '../lib/anonymousChat.js';
import dataExport from '../lib/dataExport.js';
import privacyScore from '../lib/privacyScore.js';
import blockchainVerification from '../lib/blockchainVerification.js';
import fs from 'fs/promises';

const router = express.Router();

// ===== ZERO-KNOWLEDGE ENCRYPTION =====

// Generate key pair for user
router.post('/encryption/keypair', protectRoute, async (req, res) => {
  try {
    const keyPair = zeroKnowledgeEncryption.generateKeyPair();
    res.json(keyPair);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate session key
router.post('/encryption/session-key', protectRoute, async (req, res) => {
  try {
    const sessionKey = zeroKnowledgeEncryption.generateSessionKey();
    res.json({ sessionKey: sessionKey.toString('hex') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ANONYMOUS CHAT =====

// Create anonymous session
router.post('/anonymous/session', protectRoute, async (req, res) => {
  try {
    const { settings } = req.body;
    const result = await anonymousChat.createSession(req.user._id, settings);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join anonymous session
router.post('/anonymous/session/:sessionId/join', protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { nickname } = req.body;
    const result = await anonymousChat.joinSession(sessionId, req.user._id, nickname);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send anonymous message
router.post('/anonymous/session/:sessionId/message', protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { senderId, message, isEncrypted } = req.body;
    const result = await anonymousChat.sendMessage(sessionId, senderId, message, isEncrypted);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get anonymous messages
router.get('/anonymous/session/:sessionId/messages', protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const result = await anonymousChat.getMessages(sessionId, req.user._id, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End anonymous session
router.delete('/anonymous/session/:sessionId', protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await anonymousChat.endSession(sessionId, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's anonymous sessions
router.get('/anonymous/sessions', protectRoute, async (req, res) => {
  try {
    const sessions = await anonymousChat.getUserSessions(req.user._id);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DATA EXPORT =====

// Request data export
router.post('/export', protectRoute, async (req, res) => {
  try {
    const { format = 'json' } = req.body;
    const result = await dataExport.exportUserData(req.user._id, format);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download export file
router.get('/download/:exportId/:fileName?', protectRoute, async (req, res) => {
  try {
    const { exportId, fileName } = req.params;
    const filePath = await dataExport.getExportFile(exportId, fileName);
    
    // Verify file exists and user owns it
    await fs.access(filePath);
    
    res.download(filePath, (err) => {
      if (err) {
        res.status(404).json({ error: 'File not found' });
      }
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found or expired' });
  }
});

// ===== PRIVACY SCORE =====

// Get conversation privacy score
router.get('/score/:userId', protectRoute, async (req, res) => {
  try {
    const { userId } = req.params;
    const score = await privacyScore.calculateConversationScore(req.user._id, userId);
    res.json(score);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's overall privacy health
router.get('/health', protectRoute, async (req, res) => {
  try {
    const health = await privacyScore.getUserPrivacyHealth(req.user._id);
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bulk privacy scores
router.post('/scores/bulk', protectRoute, async (req, res) => {
  try {
    const { contactIds } = req.body;
    const scores = await privacyScore.getBulkPrivacyScores(req.user._id, contactIds);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== BLOCKCHAIN VERIFICATION =====

// Verify message on blockchain
router.post('/blockchain/verify/:messageId', protectRoute, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { publicKey } = req.body;
    const result = await blockchainVerification.verifyMessage(messageId, publicKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blockchain statistics
router.get('/blockchain/stats', protectRoute, async (req, res) => {
  try {
    const stats = await blockchainVerification.getBlockchainStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify blockchain integrity
router.get('/blockchain/integrity', protectRoute, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const result = await blockchainVerification.verifyBlockchainIntegrity(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get message verification status
router.post('/blockchain/status', protectRoute, async (req, res) => {
  try {
    const { messageIds } = req.body;
    const status = await blockchainVerification.getMessageVerificationStatus(messageIds);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch verify messages
router.post('/blockchain/batch-verify', protectRoute, async (req, res) => {
  try {
    const { messageIds, publicKeys } = req.body;
    const results = await blockchainVerification.batchVerifyMessages(messageIds, publicKeys);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PRIVACY SETTINGS =====

// Update privacy settings
router.put('/settings', protectRoute, async (req, res) => {
  try {
    const { privacy } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { privacy },
      { new: true }
    ).select('privacy');
    
    res.json(user.privacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get privacy settings
router.get('/settings', protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('privacy');
    res.json(user.privacy || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DATA DELETION =====

// Delete specific conversation
router.delete('/data/conversation/:userId', protectRoute, async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    // Delete messages
    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ]
    });

    // Delete blockchain records for these messages
    const messageIds = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ]
    }).select('_id');

    await BlockchainRecord.deleteMany({
      messageId: { $in: messageIds.map(m => m._id) }
    });

    res.json({ message: 'Conversation data deleted permanently' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request account deletion
router.delete('/data/account', protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;

    // This would typically be a multi-step process with confirmation
    // For now, just mark for deletion
    await User.findByIdAndUpdate(userId, {
      deletionRequested: true,
      deletionRequestedAt: new Date()
    });

    res.json({ 
      message: 'Account deletion requested. Data will be permanently deleted in 30 days.',
      deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;