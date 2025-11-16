// E2E Encryption using Web Crypto API
const ALGORITHM = 'RSA-OAEP';
const HASH = 'SHA-256';
const KEY_SIZE = 2048;

// Generate RSA key pair
export const generateKeyPair = async () => {
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
};

// Encrypt message with recipient's public key
export const encryptMessage = async (message, publicKeyBase64) => {
  try {
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

    return arrayBufferToBase64(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

// Decrypt message with own private key
export const decryptMessage = async (encryptedMessage, privateKeyBase64) => {
  try {
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

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Decryption failed]';
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
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Store keys in localStorage (in production, use more secure storage)
export const storeKeys = (publicKey, privateKey) => {
  localStorage.setItem('e2e_publicKey', publicKey);
  localStorage.setItem('e2e_privateKey', privateKey);
};

export const getStoredKeys = () => {
  return {
    publicKey: localStorage.getItem('e2e_publicKey'),
    privateKey: localStorage.getItem('e2e_privateKey'),
  };
};

export const hasKeys = () => {
  const keys = getStoredKeys();
  return !!(keys.publicKey && keys.privateKey);
};
