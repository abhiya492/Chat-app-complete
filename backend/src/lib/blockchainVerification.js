import crypto from 'crypto';
import mongoose from 'mongoose';

// Blockchain record schema
const blockchainRecordSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  blockHash: { type: String, required: true, unique: true },
  previousHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  messageHash: { type: String, required: true },
  senderSignature: { type: String, required: true },
  merkleRoot: { type: String, required: true },
  nonce: { type: Number, required: true },
  difficulty: { type: Number, default: 4 },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

blockchainRecordSchema.index({ messageId: 1 });
blockchainRecordSchema.index({ blockHash: 1 });
blockchainRecordSchema.index({ timestamp: -1 });

const BlockchainRecord = mongoose.model('BlockchainRecord', blockchainRecordSchema);

class BlockchainVerification {
  constructor() {
    this.difficulty = 4; // Mining difficulty
    this.genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
  }

  // Create message hash for blockchain
  createMessageHash(messageData) {
    const data = {
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      text: messageData.text || '',
      timestamp: messageData.createdAt,
      isEncrypted: messageData.isEncrypted || false
    };
    
    return crypto.createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // Sign message with private key
  signMessage(messageHash, privateKey) {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(messageHash);
    return sign.sign(privateKey, 'hex');
  }

  // Verify message signature
  verifySignature(messageHash, signature, publicKey) {
    try {
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(messageHash);
      return verify.verify(publicKey, signature, 'hex');
    } catch (error) {
      return false;
    }
  }

  // Create Merkle tree root
  createMerkleRoot(hashes) {
    if (hashes.length === 0) return '';
    if (hashes.length === 1) return hashes[0];
    
    const newLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || hashes[i]; // Duplicate if odd number
      const combined = crypto.createHash('sha256')
        .update(left + right)
        .digest('hex');
      newLevel.push(combined);
    }
    
    return this.createMerkleRoot(newLevel);
  }

  // Mine block (Proof of Work)
  mineBlock(blockData) {
    let nonce = 0;
    const target = '0'.repeat(this.difficulty);
    
    while (true) {
      const blockString = JSON.stringify({
        ...blockData,
        nonce
      });
      
      const hash = crypto.createHash('sha256')
        .update(blockString)
        .digest('hex');
      
      if (hash.substring(0, this.difficulty) === target) {
        return { hash, nonce };
      }
      
      nonce++;
      
      // Prevent infinite loops in development
      if (nonce > 1000000) {
        console.warn('Mining timeout, reducing difficulty');
        this.difficulty = Math.max(1, this.difficulty - 1);
        nonce = 0;
      }
    }
  }

  // Add message to blockchain
  async addMessageToBlockchain(messageData, senderPrivateKey) {
    try {
      // Create message hash
      const messageHash = this.createMessageHash(messageData);
      
      // Sign message
      const signature = this.signMessage(messageHash, senderPrivateKey);
      
      // Get previous block hash
      const previousBlock = await BlockchainRecord.findOne()
        .sort({ timestamp: -1 })
        .select('blockHash');
      
      const previousHash = previousBlock ? previousBlock.blockHash : this.genesisHash;
      
      // Create Merkle root (for now, just the message hash)
      const merkleRoot = this.createMerkleRoot([messageHash]);
      
      // Prepare block data
      const blockData = {
        messageId: messageData._id,
        previousHash,
        timestamp: new Date(),
        messageHash,
        senderSignature: signature,
        merkleRoot
      };
      
      // Mine the block
      const { hash: blockHash, nonce } = this.mineBlock(blockData);
      
      // Save to database
      const blockchainRecord = new BlockchainRecord({
        ...blockData,
        blockHash,
        nonce,
        difficulty: this.difficulty
      });
      
      await blockchainRecord.save();
      
      return {
        blockHash,
        messageHash,
        verified: true,
        timestamp: blockData.timestamp
      };
    } catch (error) {
      console.error('Blockchain verification error:', error);
      throw error;
    }
  }

  // Verify message integrity
  async verifyMessage(messageId, senderPublicKey) {
    try {
      const record = await BlockchainRecord.findOne({ messageId });
      if (!record) {
        return { verified: false, error: 'No blockchain record found' };
      }

      // Verify signature
      const signatureValid = this.verifySignature(
        record.messageHash,
        record.senderSignature,
        senderPublicKey
      );

      if (!signatureValid) {
        return { verified: false, error: 'Invalid signature' };
      }

      // Verify block hash
      const blockData = {
        messageId: record.messageId,
        previousHash: record.previousHash,
        timestamp: record.timestamp,
        messageHash: record.messageHash,
        senderSignature: record.senderSignature,
        merkleRoot: record.merkleRoot,
        nonce: record.nonce
      };

      const computedHash = crypto.createHash('sha256')
        .update(JSON.stringify(blockData))
        .digest('hex');

      if (computedHash !== record.blockHash) {
        return { verified: false, error: 'Block hash mismatch' };
      }

      // Verify proof of work
      const target = '0'.repeat(record.difficulty);
      if (record.blockHash.substring(0, record.difficulty) !== target) {
        return { verified: false, error: 'Invalid proof of work' };
      }

      return {
        verified: true,
        blockHash: record.blockHash,
        timestamp: record.timestamp,
        difficulty: record.difficulty
      };
    } catch (error) {
      return { verified: false, error: error.message };
    }
  }

  // Verify blockchain integrity
  async verifyBlockchainIntegrity(limit = 100) {
    try {
      const records = await BlockchainRecord.find()
        .sort({ timestamp: 1 })
        .limit(limit);

      if (records.length === 0) {
        return { valid: true, message: 'No records to verify' };
      }

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // Check previous hash linkage
        if (i > 0) {
          const previousRecord = records[i - 1];
          if (record.previousHash !== previousRecord.blockHash) {
            return {
              valid: false,
              error: `Hash chain broken at block ${i}`,
              blockHash: record.blockHash
            };
          }
        } else {
          // First block should reference genesis
          if (record.previousHash !== this.genesisHash) {
            return {
              valid: false,
              error: 'First block does not reference genesis hash',
              blockHash: record.blockHash
            };
          }
        }

        // Verify block hash
        const blockData = {
          messageId: record.messageId,
          previousHash: record.previousHash,
          timestamp: record.timestamp,
          messageHash: record.messageHash,
          senderSignature: record.senderSignature,
          merkleRoot: record.merkleRoot,
          nonce: record.nonce
        };

        const computedHash = crypto.createHash('sha256')
          .update(JSON.stringify(blockData))
          .digest('hex');

        if (computedHash !== record.blockHash) {
          return {
            valid: false,
            error: `Invalid block hash at block ${i}`,
            blockHash: record.blockHash
          };
        }
      }

      return {
        valid: true,
        blocksVerified: records.length,
        lastBlockHash: records[records.length - 1].blockHash
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Get blockchain statistics
  async getBlockchainStats() {
    try {
      const [totalBlocks, verifiedBlocks, latestBlock] = await Promise.all([
        BlockchainRecord.countDocuments(),
        BlockchainRecord.countDocuments({ verified: true }),
        BlockchainRecord.findOne().sort({ timestamp: -1 })
      ]);

      return {
        totalBlocks,
        verifiedBlocks,
        unverifiedBlocks: totalBlocks - verifiedBlocks,
        latestBlockHash: latestBlock?.blockHash,
        latestBlockTime: latestBlock?.timestamp,
        averageDifficulty: latestBlock?.difficulty || this.difficulty
      };
    } catch (error) {
      throw error;
    }
  }

  // Get message verification status
  async getMessageVerificationStatus(messageIds) {
    try {
      const records = await BlockchainRecord.find({
        messageId: { $in: messageIds }
      }).select('messageId blockHash verified timestamp');

      const statusMap = {};
      records.forEach(record => {
        statusMap[record.messageId] = {
          verified: record.verified,
          blockHash: record.blockHash,
          timestamp: record.timestamp
        };
      });

      // Add unverified status for messages not in blockchain
      messageIds.forEach(id => {
        if (!statusMap[id]) {
          statusMap[id] = { verified: false };
        }
      });

      return statusMap;
    } catch (error) {
      throw error;
    }
  }

  // Batch verify messages
  async batchVerifyMessages(messageIds, publicKeys) {
    const results = {};
    
    for (const messageId of messageIds) {
      const publicKey = publicKeys[messageId];
      if (publicKey) {
        results[messageId] = await this.verifyMessage(messageId, publicKey);
      } else {
        results[messageId] = { verified: false, error: 'No public key provided' };
      }
    }
    
    return results;
  }
}

export { BlockchainRecord };
export default new BlockchainVerification();