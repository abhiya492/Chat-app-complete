// E2E Encryption using Web Crypto API
const ALGORITHM = 'RSA-OAEP';
const HASH = 'SHA-256';
const KEY_SIZE = 2048;

// Generate RSA key pair
export const generateKeyPair = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: ALGORITHM,
        modulusLength: KEY_SIZE,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: HASH,
      },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: arrayBufferToBase64(publicKey),
      privateKey: arrayBufferToBase64(privateKey),
    };
  } catch (error) {
    console.error('Key generation error:', error);
    throw new Error('Failed to generate encryption keys');
  }
};

// Encrypt message with recipient's public key
export const encryptMessage = async (message, publicKeyBase64) => {
  if (!message || !publicKeyBase64) {
    console.warn('❌ Missing message or public key for encryption');
    return null;
  }

  try {
    console.log('🔐 Encrypting message:', { messageLength: message.length, keyLength: publicKeyBase64.length });
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      base64ToArrayBuffer(publicKeyBase64),
      { name: ALGORITHM, hash: HASH },
      false,
      ['encrypt']
    );

    const encoded = new TextEncoder().encode(message);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: ALGORITHM },
      publicKey,
      encoded
    );

    const result = arrayBufferToBase64(encrypted);
    console.log('✅ Encryption successful, encrypted length:', result.length);
    return result;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    return null;
  }
};

// Decrypt message with own private key
export const decryptMessage = async (encryptedMessage, privateKeyBase64) => {
  if (!encryptedMessage || !privateKeyBase64) {
    console.warn('❌ Missing encrypted message or private key for decryption');
    return null;
  }

  try {
    console.log('🔓 Decrypting message:', { encryptedLength: encryptedMessage.length, hasKey: !!privateKeyBase64 });
    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      base64ToArrayBuffer(privateKeyBase64),
      { name: ALGORITHM, hash: HASH },
      false,
      ['decrypt']
    );

    const encrypted = base64ToArrayBuffer(encryptedMessage);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: ALGORITHM },
      privateKey,
      encrypted
    );

    const decryptedText = new TextDecoder().decode(decrypted);
    console.log('✅ Decryption successful:', decryptedText.substring(0, 50));
    return decryptedText;
  } catch (error) {
    console.error('❌ Decryption error:', {
      error: error.message,
      errorName: error.name,
      hasMessage: !!encryptedMessage,
      messageLength: encryptedMessage?.length,
      hasKey: !!privateKeyBase64,
      encryptedPreview: encryptedMessage?.substring(0, 50)
    });
    return null;
  }
};

// Helper functions
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error('Base64 decode error:', error);
    throw new Error('Invalid base64 string');
  }
};

// Store keys in localStorage (in production, use more secure storage)
export const storeKeys = (publicKey, privateKey) => {
  try {
    localStorage.setItem('e2e_publicKey', publicKey);
    localStorage.setItem('e2e_privateKey', privateKey);
    return true;
  } catch (error) {
    console.error('Error storing keys:', error);
    return false;
  }
};

export const getStoredKeys = () => {
  try {
    const publicKey = localStorage.getItem('e2e_publicKey');
    const privateKey = localStorage.getItem('e2e_privateKey');
    
    return {
      publicKey,
      privateKey,
    };
  } catch (error) {
    console.error('Error retrieving keys:', error);
    return { publicKey: null, privateKey: null };
  }
};

export const hasKeys = () => {
  const keys = getStoredKeys();
  return !!(keys.publicKey && keys.privateKey);
};

export const clearKeys = () => {
  try {
    localStorage.removeItem('e2e_publicKey');
    localStorage.removeItem('e2e_privateKey');
    return true;
  } catch (error) {
    console.error('Error clearing keys:', error);
    return false;
  }
};

// Validate if a string is properly base64 encoded
export const isValidBase64 = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    return btoa(atob(str)) === str;
  } catch (error) {
    return false;
  }
};

// Test encryption/decryption with stored keys
export const testEncryption = async () => {
  const keys = getStoredKeys();
  if (!keys.publicKey || !keys.privateKey) {
    console.error('No keys found for testing');
    return false;
  }

  const testMessage = 'Test message for E2E encryption';
  
  try {
    const encrypted = await encryptMessage(testMessage, keys.publicKey);
    if (!encrypted) {
      console.error('Encryption test failed');
      return false;
    }

    const decrypted = await decryptMessage(encrypted, keys.privateKey);
    if (decrypted !== testMessage) {
      console.error('Decryption test failed');
      return false;
    }

    console.log('Encryption test passed successfully');
    return true;
  } catch (error) {
    console.error('Encryption test error:', error);
    return false;
  }
};