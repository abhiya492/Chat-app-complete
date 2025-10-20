import nodemailer from 'nodemailer';

// Verify environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('EMAIL_USER or EMAIL_PASS environment variables are not set!');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Chat App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your Chat App account.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h3 style="color: #007bff; font-size: 24px; margin: 0;">Your OTP Code</h3>
            <p style="font-size: 32px; font-weight: bold; color: #333; margin: 10px 0;">${otp}</p>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const sendInvitationEmail = async (email, inviterName, token) => {
  try {
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?invite=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${inviterName} invited you to join Chatty!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🎉 You're Invited to Chatty!</h2>
          <p style="font-size: 16px;"><strong>${inviterName}</strong> has invited you to join Chatty - a real-time chat application.</p>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0;">
            <p style="color: white; margin-bottom: 20px;">Click the button below to create your account</p>
            <a href="${inviteLink}" style="background-color: white; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Join Now</a>
          </div>
          <p style="color: #666;">This invitation will expire in 7 days.</p>
          <p style="color: #999; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invitation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw new Error(`Failed to send invitation: ${error.message}`);
  }
};