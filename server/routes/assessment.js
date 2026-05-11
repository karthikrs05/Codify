import { Router } from 'express';
import User from '../models/User.js';
import verifyToken from '../middleware/verifyToken.js';
import { generateAssessmentQuestions, evaluateAssessment, generateRoadmap } from '../services/learning.js';

const router = Router();

let cachedAssessmentQuestions = null;

router.get('/start', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.assessment?.completed) {
      return res.status(400).json({ error: 'Assessment already completed', completed: true });
    }

    if (!cachedAssessmentQuestions || cachedAssessmentQuestions.length === 0) {
      cachedAssessmentQuestions = await generateAssessmentQuestions();
    }

    res.json({
      questions: cachedAssessmentQuestions,
      message: 'Assessment started. Solve all questions and submit.'
    });
  } catch (err) {
    console.error('Start assessment error:', err);
    res.status(500).json({ error: 'Failed to start assessment', details: err.message });
  }
});

router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { submissions, isBeginnerSkip } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let evaluation;

    if (isBeginnerSkip || !submissions || submissions.length === 0) {
      evaluation = {
        estimatedLevel: 'Beginner',
        estimatedLevelNumeric: 1,
        strengths: [],
        weaknesses: ['Arrays', 'Strings', 'Hash Maps', 'Two Pointers', 'Trees', 'Dynamic Programming'],
        scores: {
          arrays: 10, strings: 10, hashMaps: 10, twoPointers: 5,
          slidingWindow: 5, linkedLists: 5, stacksQueues: 5,
          trees: 5, graphs: 5, dynamicProgramming: 5,
        },
        feedback: isBeginnerSkip
          ? 'Starting as a beginner. We\'ll build your fundamentals from scratch with a structured learning path.'
          : 'Starting fresh. Let\'s build your coding skills step by step.',
      };
    } else {
      const nonSkippedSubmissions = submissions.filter(s => !s.skipped && s.code && s.code.trim().length > 0);

      if (nonSkippedSubmissions.length === 0) {
        evaluation = {
          estimatedLevel: 'Beginner',
          estimatedLevelNumeric: 1,
          strengths: [],
          weaknesses: ['Arrays', 'Strings', 'Hash Maps', 'Two Pointers', 'Trees', 'Dynamic Programming'],
          scores: {
            arrays: 10, strings: 10, hashMaps: 10, twoPointers: 5,
            slidingWindow: 5, linkedLists: 5, stacksQueues: 5,
            trees: 5, graphs: 5, dynamicProgramming: 5,
          },
          feedback: 'All questions were skipped. Starting with beginner-level fundamentals.',
        };
      } else {
        evaluation = await evaluateAssessment(nonSkippedSubmissions);
      }
    }

    user.assessment = {
      completed: true,
      completedAt: new Date(),
      estimatedLevel: evaluation.estimatedLevel,
      estimatedLevelNumeric: evaluation.estimatedLevelNumeric,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      scores: evaluation.scores || user.assessment?.scores || {},
    };

    user.level = evaluation.estimatedLevelNumeric;

    const roadmapResult = await generateRoadmap({
      level: evaluation.estimatedLevelNumeric,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      scores: evaluation.scores,
    });

    if (roadmapResult.roadmap && Array.isArray(roadmapResult.roadmap)) {
      user.roadmap = roadmapResult.roadmap.sort((a, b) => a.priority - b.priority);
    }

    user.topicProgress = [
      { name: 'Arrays' },
      { name: 'Strings' },
      { name: 'Hash Maps' },
      { name: 'Two Pointers' },
      { name: 'Sliding Window' },
      { name: 'Linked Lists' },
      { name: 'Stacks & Queues' },
      { name: 'Trees' },
      { name: 'Graphs' },
      { name: 'Dynamic Programming' },
    ];

    if (user.roadmap && user.roadmap.length > 0) {
      user.currentTopic = user.roadmap[0].topic;
    }

    await user.save();

    res.json({
      message: 'Assessment completed!',
      evaluation: {
        level: evaluation.estimatedLevel,
        levelNumeric: evaluation.estimatedLevelNumeric,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        feedback: evaluation.feedback,
      },
      roadmap: user.roadmap,
      roadmapOverview: roadmapResult.overview,
      nextTopic: user.currentTopic,
    });
  } catch (err) {
    console.error('Submit assessment error:', err);
    res.status(500).json({ error: 'Failed to submit assessment', details: err.message });
  }
});

router.get('/status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('assessment roadmap currentTopic');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      completed: user.assessment?.completed || false,
      assessment: user.assessment,
      roadmap: user.roadmap,
      currentTopic: user.currentTopic,
    });
  } catch (err) {
    console.error('Status check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
