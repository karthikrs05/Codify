import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { fixedProblems } from '../data/catalog.js';
import { getNextAssignedProblem, getOrCreateProgress } from '../services/progression.js';

const router = Router();

router.get('/fixed', requireAuth, async (_req, res) => {
  return res.json({ problems: fixedProblems });
});

router.get('/next', requireAuth, async (req, res) => {
  const assigned = await getNextAssignedProblem({ user: req.user });
  const progress = await getOrCreateProgress(req.user._id);

  return res.json({
    mode: assigned.mode,
    problem: assigned.problem
      ? {
          id: assigned.problem.problemId,
          kind: assigned.problem.kind,
          title: assigned.problem.title,
          difficulty: assigned.problem.difficulty,
          tags: assigned.problem.tags,
          xp: assigned.problem.xp,
          prompt: assigned.problem.prompt || ''
        }
      : null,
    progression: {
      stage: progress.stage,
      skillLevel: progress.skillLevel,
      fixedCompleted: progress.fixedCompleted.length,
      adaptiveSolved: progress.adaptiveSolved,
      bossAvailable: progress.bossAvailable,
      batchSize: progress.batchSize,
      roadmap: progress.roadmap?.topics || []
    }
  });
});

export default router;
