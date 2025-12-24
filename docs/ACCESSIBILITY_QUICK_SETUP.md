# 🚀 Accessibility Quick Setup Guide

## 1. Enable Accessibility Panel

The accessibility panel is automatically available in the bottom-left corner of the app.

```jsx
// Already integrated in App.jsx
<AccessibilityPanel />
```

## 2. Test Voice Features

### Voice-to-Text Setup
1. Click the settings icon (bottom-left)
2. Go to "Voice" tab
3. Enable "Voice to Text"
4. Grant microphone permissions when prompted
5. Test with the microphone button in message input

### Text-to-Speech Setup
1. In the same "Voice" tab
2. Enable "Text to Speech"
3. Select preferred voice from dropdown
4. Adjust rate, pitch, and volume
5. Test with the "Speak" button

## 3. Configure Visual Accessibility

### For Dyslexia Support
1. Go to "Visual" tab in accessibility panel
2. Enable "Dyslexia-Friendly Font"
3. Adjust font size to "Large" or "Extra Large"
4. Enable "High Contrast Mode" if needed

### For Color Blindness
1. In "Visual" tab
2. Select your type from "Color Blind Support" dropdown:
   - Protanopia (Red-blind)
   - Deuteranopia (Green-blind)
   - Tritanopia (Blue-blind)
3. Enable "High Contrast Mode" for better visibility

## 4. Motor Accessibility Setup

### One-Handed Mode
1. Go to "Motor" tab
2. Enable "One-Handed Mode" - moves controls to right side
3. Enable "Larger Click Targets" - makes buttons bigger
4. Enable "Sticky Keys" if you need modifier key assistance

## 5. Sign Language Features

1. Go to "Sign Language" tab
2. Enable "Sign Language Video"
3. Grant camera permissions
4. Test recording or upload a video file

## 6. Keyboard Shortcuts

Essential shortcuts to remember:
- `Alt + A` - Open accessibility panel
- `Alt + V` - Toggle voice input
- `Alt + R` - Read current message
- `Tab` - Navigate between elements
- `Escape` - Close panels

## 7. Browser Permissions

Make sure to allow these permissions for full functionality:

### Chrome/Edge
1. Click the lock icon in address bar
2. Allow "Microphone" for voice features
3. Allow "Camera" for sign language video

### Firefox
1. Click the shield icon
2. Allow microphone and camera access
3. Reload the page if needed

### Safari
1. Go to Safari > Preferences > Websites
2. Allow microphone and camera for your domain

## 8. Testing Your Setup

### Voice Features Test
1. Enable voice-to-text
2. Click microphone button
3. Say "Hello, this is a test"
4. Verify text appears in input

### TTS Test
1. Enable text-to-speech
2. Type a message
3. Click the speaker icon
4. Verify audio playback

### Visual Test
1. Enable dyslexia font
2. Verify font changes throughout app
3. Test high contrast mode
4. Check color blind filters

## 9. Mobile Setup

### iOS
1. Enable accessibility features in iOS Settings
2. Grant microphone/camera permissions
3. Test with VoiceOver if needed

### Android
1. Enable TalkBack if using screen reader
2. Grant app permissions for mic/camera
3. Test voice features

## 10. Troubleshooting

### Voice Not Working
- Check browser permissions
- Ensure microphone is not muted
- Try refreshing the page
- Test in Chrome/Edge for best support

### Video Not Recording
- Check camera permissions
- Ensure camera is not used by other apps
- Try different browser
- Check if WebRTC is supported

### Fonts Not Changing
- Clear browser cache
- Refresh the page
- Check if custom fonts are blocked

## 11. Performance Tips

### For Better Voice Recognition
- Use in quiet environment
- Speak clearly and at normal pace
- Use supported languages (English works best)
- Keep microphone close but not too close

### For Better TTS
- Use shorter sentences for better pronunciation
- Adjust speech rate if too fast/slow
- Select different voices to find preferred one

## 12. Advanced Configuration

### Custom Voice Settings
```javascript
// These settings are automatically saved
{
  rate: 1.0,        // 0.5 to 2.0
  pitch: 1.0,       // 0 to 2
  volume: 1.0,      // 0 to 1
  voice: "Google US English"
}
```

### Visual Customization
```javascript
{
  fontSize: "large",           // small, medium, large, xlarge
  colorBlindMode: "deuteranopia", // none, protanopia, deuteranopia, tritanopia
  highContrast: true,
  dyslexiaFont: true,
  reducedMotion: true
}
```

## 13. Getting Help

If you encounter issues:
1. Check browser console for errors
2. Try different browser (Chrome recommended)
3. Verify all permissions are granted
4. Clear cache and cookies
5. Contact support with specific error details

## 14. Best Practices

### For Voice Users
- Speak naturally, don't over-enunciate
- Use punctuation commands ("comma", "period")
- Pause briefly between sentences
- Use "new line" for line breaks

### For Screen Reader Users
- Use Tab to navigate between elements
- All buttons have proper labels
- Form fields have clear descriptions
- Error messages are announced

### For Motor Impaired Users
- Enable larger click targets
- Use keyboard shortcuts
- Enable sticky keys if needed
- One-handed mode for easier reach

---

**🎉 You're all set! Enjoy accessible communication!**

Need more help? Check the full [Accessibility Features Documentation](./ACCESSIBILITY_FEATURES.md)