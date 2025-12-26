import Message from '../models/message.model.js';
import Contact from '../models/contact.model.js';
import User from '../models/user.model.js';

class PrivacyScoreCalculator {
  
  // Calculate privacy score for a conversation
  async calculateConversationScore(userId, otherUserId) {
    try {
      const [messages, contact, users] = await Promise.all([
        this.getConversationMessages(userId, otherUserId),
        this.getContactRelation(userId, otherUserId),
        this.getUsers([userId, otherUserId])
      ]);

      const scores = {
        encryption: this.calculateEncryptionScore(messages),
        authentication: this.calculateAuthenticationScore(contact, users),
        dataRetention: this.calculateDataRetentionScore(messages),
        messageIntegrity: this.calculateMessageIntegrityScore(messages),
        anonymity: this.calculateAnonymityScore(users),
        selfDestruct: this.calculateSelfDestructScore(messages)
      };

      const overallScore = this.calculateOverallScore(scores);
      const recommendations = this.generateRecommendations(scores);
      const riskLevel = this.determineRiskLevel(overallScore);

      return {
        overallScore,
        riskLevel,
        scores,
        recommendations,
        lastUpdated: new Date(),
        messageCount: messages.length
      };
    } catch (error) {
      console.error('Privacy score calculation error:', error);
      throw error;
    }
  }

  // Get conversation messages
  async getConversationMessages(userId, otherUserId) {
    return await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).select('isEncrypted disappearAfter isDeleted createdAt reactions readBy deliveredTo').lean();
  }

  // Get contact relationship
  async getContactRelation(userId, otherUserId) {
    return await Contact.findOne({
      $or: [
        { requester: userId, recipient: otherUserId },
        { requester: otherUserId, recipient: userId }
      ]
    }).lean();
  }

  // Get user data
  async getUsers(userIds) {
    return await User.find({
      _id: { $in: userIds }
    }).select('authProvider isEmailVerified privacy publicKey').lean();
  }

  // Calculate encryption score (0-100)
  calculateEncryptionScore(messages) {
    if (messages.length === 0) return 0;
    
    const encryptedCount = messages.filter(msg => msg.isEncrypted).length;
    const encryptionRate = (encryptedCount / messages.length) * 100;
    
    let score = encryptionRate;
    
    // Bonus for consistent encryption
    if (encryptionRate === 100) score += 10;
    if (encryptionRate >= 90) score += 5;
    
    return Math.min(100, Math.round(score));
  }

  // Calculate authentication score (0-100)
  calculateAuthenticationScore(contact, users) {
    let score = 0;
    
    // Contact verification
    if (contact && contact.status === 'accepted') {
      score += 30; // Mutual contact adds trust
    }
    
    // User verification levels
    users.forEach(user => {
      if (user.isEmailVerified) score += 15;
      if (user.authProvider === 'google' || user.authProvider === 'github') score += 10;
      if (user.publicKey) score += 15; // Has encryption keys
    });
    
    return Math.min(100, score);
  }

  // Calculate data retention score (0-100)
  calculateDataRetentionScore(messages) {
    if (messages.length === 0) return 100;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    const recentMessages = messages.filter(msg => msg.createdAt > thirtyDaysAgo).length;
    const oldMessages = messages.filter(msg => msg.createdAt < ninetyDaysAgo).length;
    const deletedMessages = messages.filter(msg => msg.isDeleted).length;
    
    let score = 100;
    
    // Penalty for old messages
    if (oldMessages > 0) {
      score -= (oldMessages / messages.length) * 30;
    }
    
    // Bonus for message deletion
    if (deletedMessages > 0) {
      score += (deletedMessages / messages.length) * 20;
    }
    
    return Math.max(0, Math.round(score));
  }

  // Calculate message integrity score (0-100)
  calculateMessageIntegrityScore(messages) {
    if (messages.length === 0) return 100;
    
    let score = 100;
    
    // Check for message tampering indicators
    const messagesWithReactions = messages.filter(msg => msg.reactions && msg.reactions.length > 0);
    const messagesWithReadReceipts = messages.filter(msg => msg.readBy && msg.readBy.length > 0);
    
    // Bonus for read receipts (shows message delivery integrity)
    if (messagesWithReadReceipts.length > 0) {
      score += Math.min(10, (messagesWithReadReceipts.length / messages.length) * 10);
    }
    
    return Math.min(100, Math.round(score));
  }

  // Calculate anonymity score (0-100)
  calculateAnonymityScore(users) {
    let score = 50; // Base score
    
    users.forEach(user => {
      // Lower score for social login (less anonymous)
      if (user.authProvider === 'google' || user.authProvider === 'github') {
        score -= 15;
      }
      
      // Privacy settings bonus
      if (user.privacy) {
        if (!user.privacy.showLastSeen) score += 10;
        if (!user.privacy.showProfilePic) score += 5;
        if (!user.privacy.showStatus) score += 5;
      }
    });
    
    return Math.max(0, Math.min(100, score));
  }

  // Calculate self-destruct score (0-100)
  calculateSelfDestructScore(messages) {
    if (messages.length === 0) return 0;
    
    const selfDestructMessages = messages.filter(msg => msg.disappearAfter).length;
    const selfDestructRate = (selfDestructMessages / messages.length) * 100;
    
    let score = selfDestructRate;
    
    // Bonus for consistent use
    if (selfDestructRate === 100) score += 20;
    if (selfDestructRate >= 75) score += 10;
    
    return Math.min(100, Math.round(score));
  }

  // Calculate overall privacy score
  calculateOverallScore(scores) {
    const weights = {
      encryption: 0.25,      // 25% - Most important
      authentication: 0.20,  // 20%
      dataRetention: 0.15,   // 15%
      messageIntegrity: 0.15, // 15%
      anonymity: 0.15,       // 15%
      selfDestruct: 0.10     // 10%
    };
    
    let weightedSum = 0;
    Object.keys(weights).forEach(key => {
      weightedSum += scores[key] * weights[key];
    });
    
    return Math.round(weightedSum);
  }

  // Determine risk level based on score
  determineRiskLevel(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  // Generate privacy recommendations
  generateRecommendations(scores) {
    const recommendations = [];
    
    if (scores.encryption < 70) {
      recommendations.push({
        type: 'encryption',
        priority: 'high',
        title: 'Enable End-to-End Encryption',
        description: 'Turn on encryption for all messages to protect your conversations.',
        action: 'enable_encryption'
      });
    }
    
    if (scores.selfDestruct < 30) {
      recommendations.push({
        type: 'self_destruct',
        priority: 'medium',
        title: 'Use Disappearing Messages',
        description: 'Set messages to auto-delete for better privacy.',
        action: 'enable_disappearing_messages'
      });
    }
    
    if (scores.dataRetention < 60) {
      recommendations.push({
        type: 'data_retention',
        priority: 'medium',
        title: 'Clean Up Old Messages',
        description: 'Delete old conversations to reduce data exposure.',
        action: 'delete_old_messages'
      });
    }
    
    if (scores.authentication < 50) {
      recommendations.push({
        type: 'authentication',
        priority: 'high',
        title: 'Verify Contact Identity',
        description: 'Add this user as a verified contact for better security.',
        action: 'verify_contact'
      });
    }
    
    if (scores.anonymity < 40) {
      recommendations.push({
        type: 'anonymity',
        priority: 'low',
        title: 'Improve Privacy Settings',
        description: 'Hide your online status and profile information.',
        action: 'update_privacy_settings'
      });
    }
    
    return recommendations;
  }

  // Get privacy score for multiple conversations
  async getBulkPrivacyScores(userId, contactIds) {
    const scores = {};
    
    for (const contactId of contactIds) {
      try {
        scores[contactId] = await this.calculateConversationScore(userId, contactId);
      } catch (error) {
        scores[contactId] = { error: error.message };
      }
    }
    
    return scores;
  }

  // Get user's overall privacy health
  async getUserPrivacyHealth(userId) {
    try {
      // Get all user's contacts
      const contacts = await Contact.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      }).lean();

      const contactIds = contacts.map(contact => 
        contact.requester.toString() === userId.toString() 
          ? contact.recipient 
          : contact.requester
      );

      // Calculate scores for all conversations
      const conversationScores = await this.getBulkPrivacyScores(userId, contactIds);
      
      // Calculate overall health metrics
      const scores = Object.values(conversationScores).filter(score => !score.error);
      const avgScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score.overallScore, 0) / scores.length 
        : 0;

      const riskDistribution = {
        low: scores.filter(s => s.riskLevel === 'low').length,
        medium: scores.filter(s => s.riskLevel === 'medium').length,
        high: scores.filter(s => s.riskLevel === 'high').length,
        critical: scores.filter(s => s.riskLevel === 'critical').length
      };

      return {
        overallHealth: Math.round(avgScore),
        totalConversations: scores.length,
        riskDistribution,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Privacy health calculation error:', error);
      throw error;
    }
  }
}

export default new PrivacyScoreCalculator();