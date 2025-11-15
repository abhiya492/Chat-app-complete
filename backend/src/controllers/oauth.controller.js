import { generateToken } from '../lib/utils.js';

export const googleCallback = async (req, res) => {
  try {
    console.log('OAuth callback - User:', req.user?._id);
    console.log('OAuth callback - CLIENT_URL:', process.env.CLIENT_URL);
    
    if (!req.user) {
      console.error('OAuth callback - No user found');
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    const token = generateToken(req.user._id, res);
    console.log('OAuth callback - Token generated:', !!token);

    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
};

export const googleAuthFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
};
