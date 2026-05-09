import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateEmailDomain } from '../lib/validateEmailDomain.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ error: 'missing_fields' });
  if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'weak_password' });

  const domainCheck = await validateEmailDomain(String(email));
  if (!domainCheck.ok) return res.status(400).json({ error: 'invalid_email_domain', details: domainCheck });

  const existing = await User.findOne({ email: String(email).toLowerCase() }).select('_id');
  if (existing) return res.status(409).json({ error: 'email_in_use' });

  const baseHandle = String(username).trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  let handle = baseHandle || `user${Math.floor(Math.random() * 100000)}`;
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const handleExists = await User.findOne({ handle }).select('_id');
    if (!handleExists) break;
    handle = `${baseHandle || 'user'}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    username: String(username).trim(),
    handle,
    email: String(email).toLowerCase().trim(),
    passwordHash,
    xp: 0,
    streak: 0,
    maxStreak: 0,
    solved: 0,
    location: ''
  });

  const token = signToken({ sub: user._id.toString() });
  return res.json({
    token,
    user: { id: user._id.toString(), username: user.username, handle: user.handle, email: user.email }
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  const token = signToken({ sub: user._id.toString() });
  return res.json({
    token,
    user: { id: user._id.toString(), username: user.username, handle: user.handle, email: user.email }
  });
});

router.get('/me', requireAuth, async (req, res) => {
  return res.json({
    user: {
      id: req.user._id.toString(),
      username: req.user.username,
      handle: req.user.handle,
      email: req.user.email
    }
  });
});

export default router;
