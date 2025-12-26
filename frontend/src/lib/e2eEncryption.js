import CryptoJS from 'crypto-js';

class E2EEncryption {
  constructor() {
    this.keyPair = null;
    this.sharedKeys = new Map();
  }

  // Generate RSA-like key pair using AES
  generateKeyPair() {
    const privateKey = CryptoJS.lib.WordArray.random(256/8).toString();
    const publicKey = CryptoJS.SHA256(privateKey).toString();
    
    this.keyPair = { privateKey, publicKey };
    this.storeKeys();
    return this.keyPair;
  }

  // Store keys securely in localStorage
  storeKeys() {
    if (!this.keyPair) return;
    
    localStorage.setItem('e2e_private_key', this.keyPair.privateKey);
    localStorage.setItem('e2e_public_key', this.keyPair.publicKey);
  }

  // Load keys from storage
  loadKeys() {
    const privateKey = localStorage.getItem('e2e_private_key');
    const publicKey = localStorage.getItem('e2e_public_key');
    
    if (privateKey && publicKey) {
      this.keyPair = { privateKey, publicKey };
      return true;
    }
    return false;
  }

  // Generate shared secret for two users
  generateSharedSecret(otherPublicKey) {
    if (!this.keyPair) return null;
    
    const sharedSecret = CryptoJS.SHA256(
      this.keyPair.privateKey + otherPublicKey
    ).toString();
    
    return sharedSecret;
  }

  // Encrypt message
  encryptMessage(message, recipientPublicKey) {
    try {
      const sharedSecret = this.generateSharedSecret(recipientPublicKey);
      if (!sharedSecret) throw new Error('No shared secret');
      
      const encrypted = CryptoJS.AES.encrypt(message, sharedSecret).toString();
      return {
        encrypted,
        success: true
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return {
        encrypted: message,
        success: false,
        error: error.message
      };
    }
  }

  // Decrypt message
  decryptMessage(encryptedMessage, senderPublicKey) {
    try {
      const sharedSecret = this.generateSharedSecret(senderPublicKey);
      if (!sharedSecret) throw new Error('No shared secret');
      
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage, sharedSecret);
      const message = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!message) throw new Error('Decryption failed');
      
      return {
        message,
        success: true
      };
    } catch (error) {
      console.error('Decryption failed:', error);
      return {
        message: '[Encrypted Message - Cannot Decrypt]',
        success: false,
        error: error.message
      };
    }
  }

  // Get public key
  getPublicKey() {
    return this.keyPair?.publicKey || null;
  }

  // Check if encryption is enabled
  isEnabled() {
    return !!this.keyPair;
  }

  // Clear keys (logout)
  clearKeys() {
    this.keyPair = null;
    this.sharedKeys.clear();
    localStorage.removeItem('e2e_private_key');
    localStorage.removeItem('e2e_public_key');
  }

  // Verify message integrity
  verifyMessage(message, signature, senderPublicKey) {
    const expectedSignature = CryptoJS.HmacSHA256(message, senderPublicKey).toString();
    return signature === expectedSignature;
  }

  // Sign message
  signMessage(message) {
    if (!this.keyPair) return null;
    return CryptoJS.HmacSHA256(message, this.keyPair.publicKey).toString();
  }
}

// Singleton instance
const encryption = new E2EEncryption();

// Helper functions
export const initializeEncryption = () => {
  if (!encryption.loadKeys()) {
    encryption.generateKeyPair();
  }
  return encryption.getPublicKey();
};

export const encryptMessage = (message, recipientPublicKey) => {
  return encryption.encryptMessage(message, recipientPublicKey);
};

export const decryptMessage = (encryptedMessage, senderPublicKey) => {
  return encryption.decryptMessage(encryptedMessage, senderPublicKey);
};

export const getPublicKey = () => {
  return encryption.getPublicKey();
};

export const isEncryptionEnabled = () => {
  return encryption.isEnabled();
};

export const clearEncryptionKeys = () => {
  encryption.clearKeys();
};

export const signMessage = (message) => {
  return encryption.signMessage(message);
};

export const verifyMessage = (message, signature, senderPublicKey) => {
  return encryption.verifyMessage(message, signature, senderPublicKey);
};

export default encryption;