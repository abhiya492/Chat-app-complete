# 👤 User Profile & Customization Features

## Overview
Comprehensive user profile management with customization options, privacy settings, and user blocking capabilities.

## Features Implemented

### 📝 Profile Management
- **Bio** - Personal description (up to 200 characters)
- **Status** - Current status message (up to 100 characters)
- **Profile Picture** - Upload and update profile photo
- **User Info Modal** - View other users' profiles

### 🎨 Theme Customization
- **Multiple Themes** - Choose from 30+ DaisyUI themes
- **Live Preview** - See theme changes in real-time
- **Persistent Settings** - Theme saved in localStorage
- **Dark/Light Modes** - Various color schemes available

### 🔒 Privacy Settings
- **Show Last Seen** - Control visibility of online status
- **Show Profile Picture** - Hide/show profile photo
- **Show Status** - Control status message visibility
- **Toggle Controls** - Easy on/off switches

### 🚫 User Management
- **Block Users** - Block unwanted users
- **Unblock Users** - Manage blocked users list
- **Filtered Sidebar** - Blocked users hidden from contacts
- **Block from Chat** - Quick block option in chat header

## User Interface

### Profile Settings Page
Organized in tabs:
1. **Profile** - Bio, status, privacy settings
2. **Theme** - Theme selection with preview
3. **Blocked** - Manage blocked users

### Chat Header Menu
- User info button
- Block/unblock option
- Quick access dropdown

## API Endpoints

### Update Profile
```
PUT /api/auth/update-profile
Body: {
  profilePic?: string,
  bio?: string,
  status?: string,
  privacy?: {
    showLastSeen: boolean,
    showProfilePic: boolean,
    showStatus: boolean
  }
}
```

### Block User
```
POST /api/auth/block/:userId
```

### Unblock User
```
POST /api/auth/unblock/:userId
```

## Database Schema

### User Model Extensions
```javascript
{
  bio: String (max 200 chars),
  status: String (max 100 chars),
  privacy: {
    showLastSeen: Boolean,
    showProfilePic: Boolean,
    showStatus: Boolean
  },
  blockedUsers: [ObjectId]
}
```

## Usage Guide

### Update Your Profile
1. Navigate to Profile page
2. Click "Profile" tab
3. Edit bio and status
4. Click "Save Changes"

### Change Privacy Settings
1. Go to Profile → Profile tab
2. Scroll to Privacy Settings
3. Toggle switches for each option
4. Changes save automatically

### Change Theme
1. Go to Profile → Theme tab
2. Click on any theme preview
3. Theme applies immediately

### Block a User
**Method 1 - From Chat:**
1. Open chat with user
2. Click three dots menu
3. Select "Block User"

**Method 2 - From Profile:**
1. Go to Profile → Blocked tab
2. View blocked users list
3. Click "Unblock" to remove

### View User Info
1. Open chat with user
2. Click three dots menu
3. Select "User Info"
4. View bio, status, email, join date

## Components

### ProfileSettings.jsx
- Profile picture upload
- Bio and status editing
- Privacy toggles
- Account information

### BlockedUsers.jsx
- List of blocked users
- Unblock functionality
- User avatars and details

### UserInfoModal.jsx
- User profile display
- Bio and status view
- Contact information
- Member since date

## Best Practices

### Privacy
- ✅ Privacy settings respected across app
- ✅ Blocked users can't see your messages
- ✅ Blocked users hidden from sidebar
- ✅ Profile visibility controls

### User Experience
- ✅ Intuitive tab navigation
- ✅ Real-time updates
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Toast notifications

### Performance
- ✅ Optimized image uploads
- ✅ Efficient state management
- ✅ Minimal re-renders
- ✅ LocalStorage for themes

## Security Considerations

1. **Input Validation**
   - Bio limited to 200 characters
   - Status limited to 100 characters
   - Image size optimization

2. **Authorization**
   - Protected routes
   - JWT authentication
   - User-specific data access

3. **Privacy**
   - Blocked users filtered server-side
   - Privacy settings enforced
   - No data leakage

## Future Enhancements

### Phase 2
- [ ] Custom chat backgrounds
- [ ] Notification sound preferences
- [ ] Read receipts toggle
- [ ] Typing indicator toggle

### Phase 3
- [ ] Profile verification badges
- [ ] Custom status emojis
- [ ] Profile themes
- [ ] Activity status (Away, Busy, etc.)

### Phase 4
- [ ] Two-factor authentication
- [ ] Account deletion
- [ ] Data export
- [ ] Privacy audit log

## Troubleshooting

### Profile Picture Not Updating
- Check file size (should be < 5MB)
- Ensure valid image format (JPG, PNG)
- Check internet connection
- Try refreshing the page

### Theme Not Saving
- Check browser localStorage
- Clear cache and try again
- Ensure JavaScript enabled

### Can't Block User
- Verify you're logged in
- Check internet connection
- Refresh and try again

## Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive

## Dependencies
- Existing: Zustand, React, DaisyUI
- New: None (uses existing stack)

## Code Statistics
- Backend: ~100 lines added
- Frontend: ~400 lines added
- Total: ~500 lines
- Components: 3 new
- API endpoints: 3 new
