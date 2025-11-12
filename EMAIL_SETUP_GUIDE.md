# 📧 Email Setup Guide - Fix OTP Not Sending

## Problem
You're getting 200 OK but not receiving OTP emails.

## Solution: Update Gmail App Password

### Step 1: Generate New Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. Scroll down to **App passwords**
5. Click **App passwords**
6. Select:
   - App: **Mail**
   - Device: **Other (Custom name)**
   - Name it: **Chat App**
7. Click **Generate**
8. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update Backend .env

Open `backend/.env` and update:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password-without-spaces
```

**Example:**
```env
EMAIL_USER=singh.421.aspabhiya@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

### Step 3: Restart Backend

```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

## Alternative: Use Mailtrap (For Testing)

If Gmail doesn't work, use Mailtrap for testing:

1. Sign up at https://mailtrap.io (free)
2. Get SMTP credentials from inbox
3. Update `backend/src/lib/email.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'your-mailtrap-user',
    pass: 'your-mailtrap-pass'
  }
});
```

## Test Email Sending

Create a test file `backend/test-email.js`:

```javascript
import { sendOTPEmail } from './src/lib/email.js';
import dotenv from 'dotenv';

dotenv.config();

sendOTPEmail('your-email@gmail.com', '123456')
  .then(() => console.log('✅ Email sent!'))
  .catch(err => console.error('❌ Error:', err));
```

Run:
```bash
cd backend
node test-email.js
```

## Common Issues

### Issue 1: "Invalid login"
- **Fix**: Generate new app password
- Make sure 2FA is enabled on Gmail

### Issue 2: "Connection timeout"
- **Fix**: Check firewall/antivirus
- Try port 465 with `secure: true`

### Issue 3: "Less secure app access"
- **Fix**: Use App Password instead
- Don't use regular Gmail password

## Updated Email Configuration

For better reliability, update `backend/src/lib/email.js`:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Verify It Works

1. Go to forgot password page
2. Enter your email
3. Check:
   - Inbox
   - Spam folder
   - Backend console logs

Backend should show:
```
Email sent successfully: <message-id>
```

## Production Recommendations

For production, use:
- **SendGrid** (free tier: 100 emails/day)
- **AWS SES** (cheap, reliable)
- **Mailgun** (good free tier)
- **Postmark** (transactional emails)

## Quick Fix Right Now

1. Check backend console for errors
2. Verify EMAIL_USER and EMAIL_PASS in .env
3. Make sure no spaces in app password
4. Restart backend server
5. Try forgot password again
6. Check spam folder

## Still Not Working?

Check backend logs:
```bash
cd backend
npm run dev
```

Look for:
- "Email sent successfully" ✅
- "Error sending email" ❌

If you see errors, share them and I'll help fix!
