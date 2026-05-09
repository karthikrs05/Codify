import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { toDateKey } from '../lib/dateKey.js';
import Contest from '../models/Contest.js';
import ContestEntry from '../models/ContestEntry.js';
import { onProblemSolved } from '../services/progression.js';
import Problem from '../models/Problem.js';

const router = Router();

async function getOrCreateTodayContest() {
  const dateKey = toDateKey(new Date());
  let contest = await Contest.findOne({ dateKey });
  if (contest) return contest;
  const now = new Date();
  const startsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const endsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
  contest = await Contest.create({ dateKey, startsAt, endsAt, title: 'Daily Contest' });
  return contest;
}

router.post('/', requireAuth, async (req, res) => {
  const { problemId, verdict, language } = req.body || {};
  if (!problemId || !verdict || !language) return res.status(400).json({ error: 'missing_fields' });
  if (!['AC', 'WA', 'TLE', 'RE'].includes(verdict)) return res.status(400).json({ error: 'invalid_verdict' });

  const problem = await Problem.findOne({ problemId });
  if (!problem) return res.status(404).json({ error: 'problem_not_found' });

  const earnedXp = verdict === 'AC' ? problem.xp : verdict === 'TLE' ? Math.round(problem.xp * 0.15) : 0;

  const submission = await Submission.create({
    userId: req.user._id,
    problemId,
    problemTitle: problem.title,
    verdict,
    language,
    time: '',
    xp: earnedXp
  });

  // Update user stats
  const user = await User.findById(req.user._id);
  if (earnedXp > 0) user.xp += earnedXp;
  if (verdict === 'AC') user.solved += 1;
  await user.save();

  // Progression update only on AC
  if (verdict === 'AC') await onProblemSolved({ user, problemId });

  // Contest scoring (daily)
  const contest = await getOrCreateTodayContest();
  const entry = await ContestEntry.findOneAndUpdate(
    { contestId: contest._id, userId: req.user._id },
    { $setOnInsert: { contestId: contest._id, userId: req.user._id, score: 0, solved: 0 } },
    { upsert: true, new: true }
  );

  if (verdict === 'AC') {
    entry.score += earnedXp;
    entry.solved += 1;
    entry.lastSubmissionAt = new Date();
    await entry.save();
  }

  return res.json({
    submission: {
      id: submission._id.toString(),
      problemId: submission.problemId,
      verdict: submission.verdict,
      xp: submission.xp,
      createdAt: submission.createdAt
    }
  });
});

export default router;

