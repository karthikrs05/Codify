import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import verifyToken from '../middleware/verifyToken.js';
import { sendVerificationEmail } from '../services/emailService.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function userPayload(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    solved: user.solved,
    rank: user.rank,
    assessmentCompleted: user.assessment?.completed || false,
    assessment: user.assessment,
    currentTopic: user.currentTopic,
    hasBossTask: !!user.currentBossTask,
    preferredLanguage: user.preferredLanguage,
    authenticated: user.authenticated,
  };
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 3600000); // 1 hour

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hash,
      verificationCode,
      verificationCodeExpires,
      authenticated: 0,
    });

    console.log(`[EMAIL SIMULATION] Verification code for ${user.email}: ${verificationCode}`);
    
    // Send real email in the background
    sendVerificationEmail(user.email, verificationCode).catch(err => {
      console.error('Background email sending failed:', err);
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: userPayload(user) });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'No account with that email' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const token = signToken(user);
    return res.json({ token, user: userPayload(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: userPayload(user) });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.authenticated === 1) {
      return res.status(400).json({ error: 'User already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    user.authenticated = 1;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return res.json({ message: 'Email verified successfully', user: userPayload(user) });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
