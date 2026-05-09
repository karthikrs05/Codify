import { Router } from 'express';
import User from '../models/User.js';
import { getLevelFromXp } from '../lib/levels.js';
import Contest from '../models/Contest.js';
import ContestEntry from '../models/ContestEntry.js';
import { toDateKey } from '../lib/dateKey.js';

const router = Router();

router.get('/daily', async (_req, res) => {
  const dateKey = toDateKey(new Date());
  const contest = await Contest.findOne({ dateKey }).select('_id dateKey');

  if (contest) {
    const entries = await ContestEntry.find({ contestId: contest._id })
      .sort({ score: -1, solved: -1, lastSubmissionAt: 1 })
      .limit(50)
      .select('userId score solved');

    const userIds = entries.map((e) => e.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('username handle streak xp');
    const byId = new Map(users.map((u) => [u._id.toString(), u]));

    const rows = entries.map((e, idx) => {
      const u = byId.get(e.userId.toString());
      return {
        rank: idx + 1,
        name: u?.username || 'User',
        handle: u?.handle || 'user',
        xp: e.score, // contest score
        solved: e.solved,
        streak: u?.streak || 0,
        level: getLevelFromXp(u?.xp || 0)
      };
    });

    return res.json({ scope: 'daily_contest', dateKey, rows });
  }

  // Fallback: rank by total XP
  const users = await User.find({})
    .sort({ xp: -1, solved: -1, maxStreak: -1, createdAt: 1 })
    .limit(50)
    .select('username handle xp solved streak');

  const rows = users.map((u, idx) => ({
    rank: idx + 1,
    name: u.username,
    handle: u.handle,
    xp: u.xp,
    solved: u.solved,
    streak: u.streak,
    level: getLevelFromXp(u.xp)
  }));

  return res.json({ scope: 'total_xp', dateKey, rows });
});

export default router;
