# End-to-End Encryption (E2E)

## Overview
Messages are now encrypted end-to-end using RSA-OAEP encryption with 2048-bit keys. Only the sender and recipient can read the messages - not even the server can decrypt them.

## Features
- 🔐 RSA-OAEP encryption with 2048-bit keys
- 🔑 Automatic key generation on first login
- 🛡️ Client-side encryption/decryption
- 🔒 Private keys never leave the device
- ✅ Visual encryption indicator on messages
- 📱 Works seamlessly with existing features

## How It Works

### Key Generation
1. On first login, RSA key pair is automatically generated
2. Public key is sent to server and stored in user profile
3. Private key stays on device (localStorage)
4. Keys are generated using Web Crypto API

### Sending Messages
1. Message text is encrypted with recipient's public key
2. Encrypted message is sent to server
3. Server stores encrypted message with `isEncrypted: true` flag
4. Recipient receives encrypted message via socket

### Receiving Messages
1. Encrypted message is received
2. Client decrypts using own private key
3. Decrypted message is displayed to user
4. Green shield icon indicates encryption

## Security Features

### Encryption Algorithm
- **Algorithm**: RSA-OAEP
- **Key Size**: 2048 bits
- **Hash**: SHA-256
- **Standard**: Web Crypto API

### Key Storage
- **Public Key**: Stored in MongoDB (user profile)
- **Private Key**: Stored in localStorage (never sent to server)
- **Key Format**: Base64-encoded SPKI/PKCS8

### What's Encrypted
- ✅ Text messages
- ❌ Images (stored on Cloudinary)
- ❌ Videos (stored on Cloudinary)
- ❌ Files (stored on Cloudinary)
- ❌ Voice messages (stored on Cloudinary)

## User Experience

### Visual Indicators
- Green shield icon next to encrypted messages
- Encryption status in Settings page
- Public key preview in Settings

### Automatic Setup
- Keys generated automatically on first login
- No user action required
- Seamless integration with existing chat

### Compatibility
- Works with all existing features
- Backward compatible (unencrypted messages still work)
- Graceful fallback if decryption fails

## Technical Implementation

### Frontend Files
- **`lib/encryption.js`** - Encryption utilities (generate, encrypt, decrypt)
- **`components/EncryptionSetup.jsx`** - Auto-setup component
- **`components/Message.jsx`** - Shield icon for encrypted messages
- **`pages/Setting.jsx`** - Encryption status display
- **`store/useChatStore.js`** - Encrypt on send, decrypt on receive

### Backend Files
- **`models/user.model.js`** - Added `publicKey` field
- **`models/message.model.js`** - Added `isEncrypted` field
- **`controllers/auth.controller.js`** - `updatePublicKey` endpoint
- **`routes/auth.route.js`** - Route for updating public key

## API Endpoints

### Update Public Key
```
PUT /api/auth/update-public-key
Body: { publicKey: "base64_encoded_key" }
```

## Limitations

### Current Limitations
1. **Media not encrypted** - Images, videos, files stored on Cloudinary
2. **localStorage storage** - Private keys in localStorage (not most secure)
3. **No key rotation** - Keys generated once, never rotated
4. **No forward secrecy** - Same keys used for all messages
5. **No group chat support** - Only 1-to-1 encryption

### Future Improvements
- Encrypt media files before upload
- Use IndexedDB for key storage
- Implement key rotation
- Add forward secrecy (Signal Protocol)
- Support group chat encryption
- Add key backup/recovery
- Implement key verification

## Security Considerations

### What's Protected
✅ Message content from server access
✅ Message content from database breaches
✅ Message content in transit (with HTTPS)

### What's NOT Protected
❌ Metadata (who, when, message exists)
❌ Media files (images, videos, files)
❌ Client-side attacks (XSS, malware)
❌ Compromised devices

### Best Practices
1. Always use HTTPS
2. Keep devices secure
3. Don't share private keys
4. Log out on shared devices
5. Clear browser data when needed

## Testing

### Test Encryption
1. Login with two different accounts
2. Send a message from Account A to Account B
3. Check database - message text should be encrypted
4. Account B should see decrypted message
5. Green shield icon should appear

### Verify Keys
1. Go to Settings page
2. Check "Encryption" section
3. Should show "Active" status
4. Public key preview should be visible

## Troubleshooting

### Decryption Failed
- Message shows "[Decryption failed]"
- Possible causes:
  - Private key lost (cleared localStorage)
  - Wrong private key
  - Corrupted encrypted data
- Solution: Keys are device-specific, can't recover

### No Encryption
- Messages sent without encryption
- Possible causes:
  - Recipient has no public key
  - Encryption setup failed
- Solution: Recipient needs to login to generate keys

## Performance

### Impact
- Minimal performance impact
- Encryption/decryption happens client-side
- No server overhead
- Slight delay on first message (key import)

### Optimization
- Keys cached in memory after first use
- Batch decryption for message history
- Async operations don't block UI

## Compliance

### Standards
- Uses Web Crypto API (W3C standard)
- RSA-OAEP (PKCS#1 v2.2)
- SHA-256 hashing

### Privacy
- Server cannot read message content
- End-to-end encryption
- Client-side key generation

## Notes
- This is a basic E2E implementation
- For production, consider Signal Protocol
- Media encryption requires additional work
- Key management needs improvement
- Consider professional security audit
