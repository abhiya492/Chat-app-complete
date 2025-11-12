import { sendOTPEmail } from './src/lib/email.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');

const testEmail = process.env.EMAIL_USER; // Send to yourself
const testOTP = '123456';

console.log(`\nSending test OTP to: ${testEmail}`);

sendOTPEmail(testEmail, testOTP)
  .then((info) => {
    console.log('\n✅ SUCCESS! Email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox (and spam folder) for the OTP email');
  })
  .catch((error) => {
    console.error('\n❌ FAILED! Error sending email');
    console.error('Error:', error.message);
    console.error('\nPossible fixes:');
    console.error('1. Generate new Gmail App Password');
    console.error('2. Enable 2-Factor Authentication on Gmail');
    console.error('3. Update EMAIL_PASS in backend/.env');
    console.error('4. Check if EMAIL_USER is correct');
    process.exit(1);
  });
