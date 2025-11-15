import express from 'express';
import passport from '../lib/passport.js';
import { googleCallback, googleAuthFailure } from '../controllers/oauth.controller.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure', session: false }),
  googleCallback
);

router.get('/google/failure', googleAuthFailure);

router.get('/github', (req, res, next) => {
  passport.authenticate('github', { 
    scope: ['user:email'],
    prompt: 'select_account' // Force account selection
  })(req, res, next);
});

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/api/auth/github/failure', session: false }),
  googleCallback
);

router.get('/github/failure', googleAuthFailure);

export default router;
