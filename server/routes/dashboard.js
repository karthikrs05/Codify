import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import User from '../models/User.js';
import { badges, fixedProblems, topics } from '../data/catalog.js';
import { getLevelFromXp, getNextLevelXp } from '../lib/levels.js';
import { getNextAssignedProblem, getOrCreateProgress } from '../services/progression.js';
import Contest from '../models/Contest.js';
import ContestEntry from '../models/ContestEntry.js';
import { toDateKey } from '../lib/dateKey.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const level = getLevelFromXp(req.user.xp);
  const nextXp = getNextLevelXp(level);
  const progressPct = Math.min(100, Math.round((req.user.xp / nextXp) * 100));

  const top = await User.find({})
    .sort({ xp: -1, solved: -1 })
    .limit(5)
    .select('username xp');

  const assigned = await getNextAssignedProblem({ user: req.user });
  const progress = await getOrCreateProgress(req.user._id);

  const dateKey = toDateKey(new Date());
  const contest = await Contest.findOne({ dateKey }).select('_id dateKey startsAt endsAt title');
  let myContest = null;
  if (contest) {
    const entry = await ContestEntry.findOne({ contestId: contest._id, userId: req.user._id }).select('score solved');
    myContest = {
      dateKey: contest.dateKey,
      title: contest.title,
      startsAt: contest.startsAt,
      endsAt: contest.endsAt,
      score: entry?.score || 0,
      solved: entry?.solved || 0
    };
  }

  return res.json({
    user: {
      id: req.user._id.toString(),
      name: req.user.username,
      handle: req.user.handle,
      xp: req.user.xp,
      solved: req.user.solved,
      streak: req.user.streak,
      level,
      nextLevelXp: nextXp,
      progressPct
    },
    continueLearning: fixedProblems.slice(0, 3),
    assignedProblem: assigned.problem
      ? {
          mode: assigned.mode,
          id: assigned.problem.problemId,
          title: assigned.problem.title,
          difficulty: assigned.problem.difficulty,
          tags: assigned.problem.tags,
          xp: assigned.problem.xp
        }
      : null,
    progression: {
      stage: progress.stage,
      skillLevel: progress.skillLevel,
      fixedCompleted: progress.fixedCompleted.length,
      adaptiveSolved: progress.adaptiveSolved,
      bossAvailable: progress.bossAvailable,
      batchSize: progress.batchSize
    },
    contest: myContest,
    dailyChallenge: {
      title: 'Maximum Subarray',
      difficulty: 'Medium',
      bonusXp: 200,
      endsInSeconds: 6 * 60 * 60 + 12 * 60
    },
    topics,
    leaderboardMini: top.map((u, idx) => ({ rank: idx + 1, name: u.username, xp: u.xp })),
    badges: badges.slice(0, 6).map((b) => ({ ...b, earned: false }))
  });
});

export default router;
