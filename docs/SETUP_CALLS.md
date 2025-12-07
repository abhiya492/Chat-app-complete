# 🚀 Quick Setup Guide for Voice & Video Calls

## Prerequisites
- Node.js 18+ installed
- MongoDB running
- Two browser windows/tabs for testing

## Installation Steps

### 1. Install Dependencies
```bash
# Root directory
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup
Ensure your `.env` files are configured:

**Backend `.env`:**
```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=development
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5001
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Testing Voice & Video Calls

### Setup Test Users
1. Open two browser windows (or use incognito mode)
2. Register/login as User A in window 1
3. Register/login as User B in window 2

### Test Voice Call
1. In User A's window, select User B from contacts
2. Click the phone icon (📞) in the chat header
3. In User B's window, accept the incoming call
4. Test mute/unmute functionality
5. End the call from either side

### Test Video Call
1. In User A's window, select User B from contacts
2. Click the video icon (🎥) in the chat header
3. Grant camera and microphone permissions when prompted
4. In User B's window, accept the incoming call
5. Test video on/off and mute/unmute
6. End the call

### Test Call History
1. After making calls, click the "Calls" tab in the sidebar
2. View call history with duration and status
3. See incoming/outgoing/missed call indicators

## Browser Permissions

### Chrome/Edge
1. Click the camera icon in the address bar
2. Allow microphone and camera access
3. Reload if needed

### Firefox
1. Click the permissions icon in the address bar
2. Allow microphone and camera
3. Reload if needed

### Safari
1. Safari → Preferences → Websites
2. Allow camera and microphone for localhost
3. Reload the page

## Troubleshooting

### Call Not Connecting
- **Check Socket.io**: Ensure both users show as "Online"
- **Browser Console**: Check for WebRTC errors
- **Permissions**: Verify camera/mic permissions granted

### No Audio/Video
- **Device Check**: Ensure mic/camera not in use by other apps
- **Browser Settings**: Check browser has access to devices
- **HTTPS**: Some browsers require HTTPS for WebRTC (use localhost for dev)

### ICE Connection Failed
- **Firewall**: Check firewall isn't blocking WebRTC
- **Network**: Ensure stable internet connection
- **STUN Server**: Verify STUN servers are accessible

## Development Tips

### Debug WebRTC
```javascript
// In browser console
const pc = useCallStore.getState().webrtcService.peerConnection;
console.log('Connection State:', pc.connectionState);
console.log('ICE State:', pc.iceConnectionState);
console.log('Signaling State:', pc.signalingState);
```

### Monitor Socket Events
```javascript
// In browser console
const socket = useAuthStore.getState().socket;
socket.onAny((event, ...args) => {
  console.log('Socket Event:', event, args);
});
```

### Check Media Devices
```javascript
// In browser console
navigator.mediaDevices.enumerateDevices()
  .then(devices => console.log('Available devices:', devices));
```

## Production Considerations

### TURN Server
For production, add TURN servers for better connectivity:

```javascript
// frontend/src/lib/webrtc.js
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:your-turn-server.com:3478",
      username: "username",
      credential: "password"
    }
  ],
};
```

### HTTPS Required
- WebRTC requires HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Configure your deployment platform for HTTPS

### Scalability
- Consider using a media server (Janus, Mediasoup) for group calls
- Implement connection quality monitoring
- Add bandwidth adaptation

## Next Steps

1. ✅ Test basic voice calls
2. ✅ Test video calls with controls
3. ✅ Verify call history tracking
4. 🔄 Add screen sharing (future)
5. 🔄 Implement group calls (future)
6. 🔄 Add call recording (future)

## Support

For issues or questions:
- Check browser console for errors
- Review Socket.io connection status
- Verify WebRTC peer connection state
- Test with different browsers

Happy calling! 🎉
