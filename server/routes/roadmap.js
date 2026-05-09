import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getOrCreateProgress } from '../services/progression.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const progress = await getOrCreateProgress(req.user._id);
  return res.json({
    stage: progress.stage,
    skillLevel: progress.skillLevel,
    batchSize: progress.batchSize,
    bossAvailable: progress.bossAvailable,
    roadmap: progress.roadmap?.topics || []
  });
});

export default router;

