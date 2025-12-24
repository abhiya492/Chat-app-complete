import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import Contact from '../models/contact.model.js';
import cache from './cache.js';

class QueryOptimizer {
  
  // Optimized user queries
  async getUsersForSidebar(userId, useCache = true) {
    const cacheKey = `sidebar:${userId}`;
    
    if (useCache) {
      const cached = await cache.getCachedSidebarUsers(userId);
      if (cached) return cached;
    }

    try {
      // Get user's blocked list and contacts in parallel
      const [currentUser, contacts] = await Promise.all([
        User.findById(userId).select('blockedUsers').lean(),
        Contact.find({
          $or: [
            { requester: userId, status: "accepted" },
            { recipient: userId, status: "accepted" }
          ]
        }).populate('requester recipient', 'fullName profilePic status bio').lean()
      ]);

      const blockedUsers = currentUser?.blockedUsers || [];
      
      // Process contacts efficiently
      const contactUserIds = [];
      const contactUsers = contacts.map(contact => {
        const isRequester = contact.requester._id.toString() === userId.toString();
        const user = isRequester ? contact.recipient : contact.requester;
        contactUserIds.push(user._id);
        
        return {
          ...user,
          isContact: true,
          contactInfo: {
            nickname: contact.nickname,
            group: contact.group,
            isFavorite: contact.isFavorite
          }
        };
      });

      // Get recent chat users (users with recent messages)
      const recentChatUsers = await Message.aggregate([
        {
          $match: {
            $or: [
              { senderId: userId },
              { receiverId: userId }
            ],
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
          }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$senderId', userId] },
                '$receiverId',
                '$senderId'
              ]
            },
            lastMessage: { $max: '$createdAt' }
          }
        },
        { $sort: { lastMessage: -1 } },
        { $limit: 20 }
      ]);

      const recentUserIds = recentChatUsers.map(chat => chat._id);
      
      // Get other users (excluding contacts, blocked, and self)
      const otherUsers = await User.find({
        _id: { 
          $in: recentUserIds,
          $ne: userId, 
          $nin: [...blockedUsers, ...contactUserIds] 
        }
      }).select('-password').lean();

      const result = [
        ...contactUsers,
        ...otherUsers.map(user => ({ ...user, isContact: false }))
      ];

      // Cache the result
      if (useCache) {
        await cache.cacheSidebarUsers(userId, result);
      }

      return result;
    } catch (error) {
      console.error('Error in getUsersForSidebar optimization:', error);
      throw error;
    }
  }

  // Optimized message queries with pagination
  async getMessages(senderId, receiverId, page = 1, limit = 50, useCache = true) {
    const chatId = [senderId, receiverId].sort().join(':');
    const cacheKey = `messages:${chatId}:${page}:${limit}`;
    
    if (useCache && page === 1) {
      const cached = await cache.getCachedMessages(cacheKey);
      if (cached) return cached;
    }

    try {
      const skip = (page - 1) * limit;

      // Use aggregation for better performance
      const [messages, totalCount] = await Promise.all([
        Message.aggregate([
          {
            $match: {
              $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
              ]
            }
          },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $lookup: {
              from: 'messages',
              localField: 'replyTo',
              foreignField: '_id',
              as: 'replyToMessage'
            }
          }
        ]),
        Message.countDocuments({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        })
      ]);

      const result = {
        messages: messages.reverse(),
        hasMore: skip + messages.length < totalCount,
        total: totalCount
      };

      // Cache first page only
      if (useCache && page === 1) {
        await cache.cacheMessages(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('Error in getMessages optimization:', error);
      throw error;
    }
  }

  // Optimized contact queries
  async getContacts(userId, group = 'all', useCache = true) {
    const cacheKey = `contacts:${userId}:${group}`;
    
    if (useCache) {
      const cached = await cache.getCachedContacts(cacheKey);
      if (cached) return cached;
    }

    try {
      const query = {
        $or: [
          { requester: userId, status: "accepted" },
          { recipient: userId, status: "accepted" }
        ]
      };

      if (group && group !== 'all') {
        query.group = group;
      }

      const contacts = await Contact.find(query)
        .populate('requester recipient', 'fullName profilePic status bio')
        .sort({ updatedAt: -1 })
        .lean();

      const result = contacts.map(contact => {
        const isRequester = contact.requester._id.toString() === userId.toString();
        const otherUser = isRequester ? contact.recipient : contact.requester;
        
        return {
          _id: contact._id,
          user: otherUser,
          group: contact.group,
          isFavorite: contact.isFavorite,
          nickname: contact.nickname,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
        };
      });

      if (useCache) {
        await cache.cacheContacts(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('Error in getContacts optimization:', error);
      throw error;
    }
  }

  // Optimized search with caching
  async searchUsers(query, userId, useCache = true) {
    if (!query || query.trim().length < 2) return [];
    
    const cacheKey = `search:users:${userId}:${query}`;
    
    if (useCache) {
      const cached = await cache.getCachedSearchResults(cacheKey);
      if (cached) return cached;
    }

    try {
      // Get user's existing contacts and blocked users
      const [currentUser, existingContacts] = await Promise.all([
        User.findById(userId).select('blockedUsers').lean(),
        Contact.find({
          $or: [
            { requester: userId },
            { recipient: userId }
          ]
        }).select('requester recipient').lean()
      ]);

      const blockedUsers = currentUser?.blockedUsers || [];
      const contactUserIds = existingContacts.map(contact => 
        contact.requester.toString() === userId.toString() 
          ? contact.recipient.toString() 
          : contact.requester.toString()
      );

      // Use text search for better performance
      const users = await User.find({
        $and: [
          { _id: { $ne: userId } },
          { _id: { $nin: blockedUsers } },
          { _id: { $nin: contactUserIds } },
          {
            $or: [
              { fullName: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } }
            ]
          }
        ]
      })
      .select("fullName email profilePic status bio")
      .limit(20)
      .lean();

      if (useCache) {
        await cache.cacheSearchResults(cacheKey, users);
      }

      return users;
    } catch (error) {
      console.error('Error in searchUsers optimization:', error);
      throw error;
    }
  }

  // Batch user lookup
  async getUsersBatch(userIds, useCache = true) {
    if (!userIds || userIds.length === 0) return [];

    const cacheKeys = userIds.map(id => `user:${id}`);
    let users = [];
    let uncachedIds = [];

    if (useCache) {
      const cachedUsers = await cache.mget(cacheKeys);
      
      cachedUsers.forEach((user, index) => {
        if (user) {
          users[index] = user;
        } else {
          uncachedIds.push(userIds[index]);
        }
      });
    } else {
      uncachedIds = userIds;
    }

    // Fetch uncached users
    if (uncachedIds.length > 0) {
      const dbUsers = await User.find({
        _id: { $in: uncachedIds }
      }).select('-password').lean();

      // Cache the fetched users
      if (useCache) {
        const cacheData = dbUsers.map(user => [`user:${user._id}`, user]);
        await cache.mset(cacheData, 1800);
      }

      // Merge with cached results
      uncachedIds.forEach(id => {
        const user = dbUsers.find(u => u._id.toString() === id.toString());
        const originalIndex = userIds.indexOf(id);
        if (user && originalIndex !== -1) {
          users[originalIndex] = user;
        }
      });
    }

    return users.filter(Boolean);
  }

  // Clear related caches
  async invalidateUserCaches(userId) {
    await Promise.all([
      cache.invalidateUser(userId),
      cache.invalidateContacts(userId),
      cache.deletePattern(`sidebar:${userId}*`),
      cache.deletePattern(`messages:*${userId}*`),
      cache.deletePattern(`search:*${userId}*`)
    ]);
  }

  // Get message statistics
  async getMessageStats(userId) {
    const cacheKey = `stats:messages:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    try {
      const stats = await Message.aggregate([
        {
          $match: {
            $or: [{ senderId: userId }, { receiverId: userId }]
          }
        },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            sentMessages: {
              $sum: { $cond: [{ $eq: ['$senderId', userId] }, 1, 0] }
            },
            receivedMessages: {
              $sum: { $cond: [{ $eq: ['$receiverId', userId] }, 1, 0] }
            },
            totalImages: {
              $sum: { $cond: [{ $ne: ['$image', null] }, 1, 0] }
            },
            totalFiles: {
              $sum: { $cond: [{ $ne: ['$file', null] }, 1, 0] }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalMessages: 0,
        sentMessages: 0,
        receivedMessages: 0,
        totalImages: 0,
        totalFiles: 0
      };

      await cache.set(cacheKey, result, 3600); // Cache for 1 hour
      return result;
    } catch (error) {
      console.error('Error getting message stats:', error);
      return null;
    }
  }
}

export default new QueryOptimizer();