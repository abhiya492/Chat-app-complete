# 🚀 Quick Start Guide

## Installation

```bash
# Clone and install
git clone https://github.com/abhiya492/Chat-app-complete
cd Chat-app-complete

# Install all dependencies
npm install
```

## Running the App

### Option 1: Quick Start Script
```bash
./start.sh
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## Access the App
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## Quick Feature Guide

### 📤 Sending Messages
- **Text**: Type and press Enter
- **Image**: Click 📷 icon
- **Video**: Click 🎥 icon
- **File**: Click 📎 icon
- **Voice**: Click 🎤 icon
- **Drag & Drop**: Drag any file into chat

### 💬 Message Actions (Hover over message)
- **😊 React**: Add emoji reaction
- **💬 Reply**: Quote and reply
- **📌 Pin**: Pin message
- **➡️ Forward**: Forward to others
- **✏️ Edit**: Edit message (your messages only)
- **🗑️ Delete**: Delete message (your messages only)

### 🔍 Search & Navigation
- **Search**: Click 🔍 in header
- **Pinned**: Click 📌 in header
- **Close**: Click ❌ in header

### ✅ Message Status
- **✓** = Sent
- **✓✓** = Read

### ⌨️ Typing
- See real-time typing indicators
- Auto-stops after 1 second

## File Limits
- Images: No limit
- Videos: 50MB max
- Documents: 10MB max
- Voice: No limit

## Keyboard Shortcuts
- **Enter**: Send message
- **Esc**: Cancel reply/edit

## Tips & Tricks

1. **Quick Reply**: Click reply icon on any message
2. **Multi-Forward**: Select multiple users when forwarding
3. **Search**: Search works across all conversations
4. **Pin Important**: Pin messages you need to reference
5. **Voice Messages**: Great for quick responses
6. **Drag & Drop**: Fastest way to share files

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:5001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Messages Not Sending
- Check backend is running
- Verify MongoDB connection
- Check Cloudinary credentials

### Voice Recording Not Working
- Allow microphone access in browser
- Check browser permissions

### Files Not Uploading
- Verify file size limits
- Check Cloudinary configuration
- Ensure proper file types

## Environment Setup

### Backend .env
```env
MONGODB_URI=your_mongodb_uri
PORT=5001
JWT_SECRET=your_secret
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend .env
```env
VITE_API_URL=http://localhost:5001
```

## Feature Checklist

- [x] Send text messages
- [x] Share images
- [x] Share videos
- [x] Share files
- [x] Record voice messages
- [x] React to messages
- [x] Reply to messages
- [x] Edit messages
- [x] Delete messages
- [x] Pin messages
- [x] Forward messages
- [x] Search messages
- [x] Read receipts
- [x] Typing indicators
- [x] Drag & drop files

## Next Steps

1. ✅ Test all features
2. ✅ Customize themes
3. ✅ Add more users
4. ✅ Deploy to production
5. 🚀 Build group chats
6. 🚀 Add video calls
7. 🚀 Implement E2E encryption

## Support

- 📖 See [MESSAGING_FEATURES.md](./MESSAGING_FEATURES.md) for detailed docs
- 🎯 See [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md) for full feature list
- 💬 Check GitHub issues for help

## Happy Chatting! 🎉
