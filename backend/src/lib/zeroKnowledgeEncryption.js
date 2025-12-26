import crypto from 'crypto';

class ZeroKnowledgeEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
  }

  // Generate key pair for user
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return { publicKey, privateKey };
  }

  // Generate session key for conversation
  generateSessionKey() {
    return crypto.randomBytes(this.keyLength);
  }

  // Encrypt session key with public key
  encryptSessionKey(sessionKey, publicKey) {
    return crypto.publicEncrypt(publicKey, sessionKey);
  }

  // Decrypt session key with private key
  decryptSessionKey(encryptedSessionKey, privateKey) {
    return crypto.privateDecrypt(privateKey, encryptedSessionKey);
  }

  // Encrypt message with session key
  encryptMessage(message, sessionKey) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, sessionKey, { iv });
    
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  // Decrypt message with session key
  decryptMessage(encryptedData, sessionKey) {
    const { encrypted, iv, tag } = encryptedData;
    
    const decipher = crypto.createDecipher(this.algorithm, sessionKey, {
      iv: Buffer.from(iv, 'hex')
    });
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Generate message hash for verification
  generateMessageHash(message) {
    return crypto.createHash('sha256').update(message).digest('hex');
  }

  // Verify message integrity
  verifyMessageIntegrity(message, hash) {
    const computedHash = this.generateMessageHash(message);
    return computedHash === hash;
  }
}

export default new ZeroKnowledgeEncryption();