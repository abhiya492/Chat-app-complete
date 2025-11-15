import { generateToken } from '../lib/utils.js';

export const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    generateToken(req.user._id, res);

    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  } catch (error) {
    console.error('Error in Google callback:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
};

export const googleAuthFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
};
