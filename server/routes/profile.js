import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import Submission from '../models/Submission.js';
import { getLevelFromXp } from '../lib/levels.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const recent = await Submission.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('problemTitle verdict language time xp createdAt');

  const level = getLevelFromXp(req.user.xp);
  return res.json({
    user: {
      id: req.user._id.toString(),
      name: req.user.username,
      handle: req.user.handle,
      email: req.user.email,
      location: req.user.location || '',
      joinedAt: req.user.createdAt,
      xp: req.user.xp,
      level,
      streak: req.user.streak,
      maxStreak: req.user.maxStreak,
      solved: req.user.solved
    },
    languageBreakdown: [
      { name: 'Python', pct: 0 },
      { name: 'JavaScript', pct: 0 },
      { name: 'C++', pct: 0 }
    ],
    topicMastery: [
      { name: 'Arrays', pct: 0 },
      { name: 'Dynamic Programming', pct: 0 },
      { name: 'Graphs', pct: 0 },
      { name: 'Trees', pct: 0 },
      { name: 'Strings', pct: 0 },
      { name: 'Binary Search', pct: 0 }
    ],
    recentSubmissions: recent.map((s) => ({
      problemTitle: s.problemTitle,
      verdict: s.verdict,
      language: s.language,
      time: s.time || '',
      xp: s.xp || 0,
      createdAt: s.createdAt
    }))
  });
});

router.patch('/me', requireAuth, async (req, res) => {
  const { handle, location } = req.body || {};

  if (typeof handle === 'string') {
    const next = handle.toLowerCase().trim();
    if (!/^[a-z0-9_]{2,32}$/.test(next)) return res.status(400).json({ error: 'invalid_handle' });
    req.user.handle = next;
  }
  if (typeof location === 'string') {
    req.user.location = location.trim().slice(0, 80);
  }

  try {
    await req.user.save();
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'handle_in_use' });
    return res.status(500).json({ error: 'profile_update_failed' });
  }
  return res.json({
    user: {
      id: req.user._id.toString(),
      name: req.user.username,
      handle: req.user.handle,
      email: req.user.email,
      location: req.user.location || '',
      joinedAt: req.user.createdAt
    }
  });
});

export default router;
