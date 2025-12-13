# 🎥 WebRTC Voice & Video Calling Features

## Overview
Real-time peer-to-peer voice and video calling using WebRTC technology with Socket.io signaling.

## Features Implemented

### 📞 Voice & Video Calls
- **One-to-One Calls**: Direct voice and video calls between users
- **WebRTC P2P**: Peer-to-peer connection for optimal quality and low latency
- **Call Controls**: Mute/unmute audio, toggle video on/off
- **Call Duration**: Real-time call timer display

### 🔔 Call Management
- **Incoming Call Modal**: Beautiful UI for accepting/rejecting calls
- **Call Status Tracking**: Initiated, ringing, accepted, rejected, missed, ended
- **Call History**: View past calls with duration and status
- **Online Status**: Only call users who are online

### 🎛️ Technical Features
- **STUN Servers**: Google STUN servers for NAT traversal
- **ICE Candidates**: Automatic ICE candidate exchange
- **Offer/Answer**: SDP negotiation via Socket.io
- **Stream Management**: Proper cleanup of media streams

## Architecture

### Backend
```
backend/
├── models/call.model.js          # Call history schema
├── controllers/call.controller.js # Call API endpoints
├── routes/call.route.js          # Call routes
└── lib/socket.js                 # WebRTC signaling events
```

### Frontend
```
frontend/
├── lib/webrtc.js                 # WebRTC service class
├── store/useCallStore.js         # Call state management
├── components/
│   ├── CallModal.jsx             # Active call UI
│   ├── IncomingCallModal.jsx    # Incoming call UI
│   └── CallHistory.jsx           # Call history list
```

## Usage

### Initiating a Call
1. Open a chat with an online user
2. Click the phone icon (voice) or video icon (video call) in the chat header
3. Wait for the other user to accept

### Receiving a Call
1. An incoming call modal will appear
2. Click the green phone icon to accept
3. Click the red phone icon to reject

### During a Call
- **Mute/Unmute**: Click the microphone icon
- **Toggle Video**: Click the video icon (video calls only)
- **End Call**: Click the red phone icon

### Call History
1. Click the "Calls" tab in the sidebar
2. View all past calls with status and duration
3. See incoming/outgoing/missed call indicators

## API Endpoints

### POST `/api/calls/initiate`
Initiate a new call
```json
{
  "receiverId": "userId",
  "type": "voice" | "video"
}
```

### GET `/api/calls/history`
Get call history for the authenticated user

### PUT `/api/calls/:callId/status`
Update call status
```json
{
  "status": "accepted" | "rejected" | "ended",
  "duration": 120
}
```

## Socket Events

### Client → Server
- `call:offer` - Send WebRTC offer
- `call:answer` - Send WebRTC answer
- `call:ice-candidate` - Send ICE candidate
- `call:end` - End the call

### Server → Client
- `incomingCall` - Notify incoming call
- `call:offer` - Receive WebRTC offer
- `call:answer` - Receive WebRTC answer
- `call:ice-candidate` - Receive ICE candidate
- `call:ended` - Call ended by other user

## Browser Permissions
The app requires:
- **Microphone** access for voice calls
- **Camera** access for video calls

Users will be prompted to grant permissions when initiating or accepting a call.

## Best Practices Implemented

1. **Minimal Code**: Clean, focused implementation without bloat
2. **Error Handling**: Graceful handling of connection failures
3. **Resource Cleanup**: Proper disposal of media streams and peer connections
4. **State Management**: Centralized call state with Zustand
5. **Responsive UI**: Works on desktop and mobile devices
6. **Security**: JWT authentication for all API calls

## Future Enhancements

- [ ] Group video calls (multi-party)
- [ ] Screen sharing capability
- [ ] Call recording
- [ ] TURN server for better connectivity
- [ ] Call quality indicators
- [ ] Background blur for video
- [ ] Noise cancellation

## Troubleshooting

### No Audio/Video
- Check browser permissions
- Ensure microphone/camera are not used by other apps
- Try refreshing the page

### Connection Issues
- Check internet connection
- Verify both users are online
- Check firewall settings

### Call Not Connecting
- Ensure Socket.io connection is active
- Check browser console for errors
- Verify STUN server accessibility

## Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 11+)
- Opera: ✅ Full support

## Dependencies
- `socket.io` - Real-time signaling
- Native WebRTC APIs - Peer connections
- Browser MediaDevices API - Media streams
