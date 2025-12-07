# Message Scheduling Feature

## Overview
Users can now schedule messages to be sent at a future date and time. Scheduled messages are stored in the database and automatically sent when their scheduled time arrives.

## Features
- ⏰ Schedule messages for any future date/time
- 📋 View all scheduled messages
- ❌ Cancel scheduled messages before they're sent
- 🔔 Automatic sending via background scheduler
- 📱 Works with text, images, videos, files, and voice messages

## How to Use

### Schedule a Message
1. Type your message in the chat input
2. Click the "Schedule" button (clock icon) below the input
3. Select date and time using the datetime picker
4. Click Send - message will be scheduled instead of sent immediately
5. You'll see a confirmation toast with the scheduled time

### View Scheduled Messages
1. Click "Scheduled" button in the navbar (clock icon)
2. See all your scheduled messages with:
   - Recipient name and avatar
   - Message preview
   - Scheduled date/time
3. Click the trash icon to cancel any scheduled message

### Cancel a Scheduled Message
1. Open the Scheduled Messages modal
2. Find the message you want to cancel
3. Click the trash icon next to it
4. Message will be deleted and won't be sent

## Technical Implementation

### Backend
- **Model**: Added `scheduledFor` (Date) and `isSent` (Boolean) fields to Message model
- **Scheduler**: Background job runs every 30 seconds checking for messages to send
- **Controller**: `scheduledMessage.controller.js` handles viewing and cancelling
- **Routes**: 
  - `GET /api/messages/scheduled` - Get user's scheduled messages
  - `DELETE /api/messages/scheduled/:messageId` - Cancel scheduled message

### Frontend
- **MessageInput**: Added schedule button and datetime picker
- **ScheduledMessages**: Modal component to view/cancel scheduled messages
- **Navbar**: Added "Scheduled" button to access scheduled messages
- **Store**: Added methods for getting and cancelling scheduled messages

## Files Modified/Created

### Backend
- ✅ `backend/src/models/message.model.js` - Added scheduledFor and isSent fields
- ✅ `backend/src/controllers/message.controller.js` - Updated sendMessage to handle scheduling
- ✅ `backend/src/controllers/scheduledMessage.controller.js` - NEW: Get and cancel scheduled messages
- ✅ `backend/src/lib/scheduler.js` - NEW: Background scheduler service
- ✅ `backend/src/routes/message.route.js` - Added scheduled message routes
- ✅ `backend/src/index.js` - Start scheduler on server startup

### Frontend
- ✅ `frontend/src/components/MessageInput.jsx` - Added schedule UI
- ✅ `frontend/src/components/ScheduledMessages.jsx` - NEW: Scheduled messages modal
- ✅ `frontend/src/components/Navbar.jsx` - Added scheduled messages button
- ✅ `frontend/src/store/useChatStore.js` - Added scheduled message methods

## Notes
- Scheduler checks every 30 seconds for messages to send
- Scheduled messages don't show in chat until they're sent
- Scheduled time must be in the future
- Works with all message types (text, media, files, voice)
- Scheduled messages are stored in database with `isSent: false`
- Once sent, `isSent` becomes `true` and `scheduledFor` is cleared
