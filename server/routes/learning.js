import { Router } from 'express';
import User from '../models/User.js';
import verifyToken from '../middleware/verifyToken.js';
import { generateQuestion, evaluateCode, checkMastery, generateRoadmap } from '../services/learning.js';

const router = Router();

const AVAILABLE_TOPICS = [
  'Arrays', 'Strings', 'Hash Maps', 'Two Pointers', 'Sliding Window',
  'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Dynamic Programming'
];

const AVAILABLE_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function initTopicQuestionSlots(topicName) {
  return [
    { slotNumber: 1, type: 'normal', status: 'unlocked' },
    { slotNumber: 2, type: 'normal', status: 'locked' },
    { slotNumber: 3, type: 'normal', status: 'locked' },
    { slotNumber: 4, type: 'normal', status: 'locked' },
    { slotNumber: 5, type: 'optional', status: 'locked' },
    { slotNumber: 6, type: 'boss', status: 'locked' },
  ];
}

function getOrCreateTopicProgress(user, topicName) {
  let topicProgress = user.topicProgress?.find(t => t.name === topicName);

  if (!topicProgress) {
    topicProgress = {
      name: topicName,
      solvedCount: 0,
      attemptedCount: 0,
      accuracy: 0,
      masteryScore: 0,
      isMastered: false,
      bossTaskCompleted: false,
      questions: initTopicQuestionSlots(topicName),
      currentQuestionSlot: 1,
      bossUnlocked: false,
    };
    user.topicProgress = user.topicProgress || [];
    user.topicProgress.push(topicProgress);
  }

  if (!topicProgress.questions || topicProgress.questions.length === 0) {
    topicProgress.questions = initTopicQuestionSlots(topicName);
    topicProgress.currentQuestionSlot = 1;
    topicProgress.bossUnlocked = false;
  }

  return topicProgress;
}

function getDifficultyForSlot(slotNumber, userLevel, isBoss) {
  if (isBoss) {
    return 'Hard';
  }
  if (slotNumber <= 2) return 'Easy';
  if (slotNumber <= 4) return 'Medium';
  return 'Hard';
}

function getXpForSlot(slotNumber, isBoss) {
  if (isBoss) return 200;
  if (slotNumber === 5) return 100;
  return 75 + (slotNumber - 1) * 10;
}

router.get('/topics', (req, res) => {
  res.json({
    topics: AVAILABLE_TOPICS,
    difficulties: AVAILABLE_DIFFICULTIES,
  });
});

router.get('/roadmap', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.assessment?.completed) {
      return res.status(400).json({ error: 'Complete assessment first', needsAssessment: true });
    }

    const allTopics = user.roadmap?.length > 0
      ? user.roadmap.map(r => r.topic)
      : AVAILABLE_TOPICS;

    const roadmapWithProgress = allTopics.map(topicName => {
      const tp = user.topicProgress?.find(t => t.name === topicName);
      const roadmapItem = user.roadmap?.find(r => r.topic === topicName);

      const questions = tp?.questions || initTopicQuestionSlots(topicName);
      const completedCount = questions.filter(q => q.status === 'completed' || q.status === 'skipped').length;
      const isCompleted = tp?.bossTaskCompleted || roadmapItem?.completed || false;
      const isCurrent = user.currentTopic === topicName;

      return {
        topic: topicName,
        questions: questions.map(q => ({
          slotNumber: q.slotNumber,
          type: q.type,
          status: q.status,
        })),
        progress: {
          completed: completedCount,
          total: 6,
          percentage: Math.round((completedCount / 6) * 100),
        },
        isCompleted,
        isCurrent,
        isLocked: !isCurrent && !isCompleted,
        priority: roadmapItem?.priority || 99,
        reason: roadmapItem?.reason,
      };
    });

    res.json({
      roadmap: roadmapWithProgress,
      currentTopic: user.currentTopic || allTopics[0],
    });
  } catch (err) {
    console.error('Roadmap error:', err);
    res.status(500).json({ error: 'Failed to get roadmap', details: err.message });
  }
});

router.post('/select-topic', verifyToken, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || !AVAILABLE_TOPICS.includes(topic)) {
      return res.status(400).json({ error: 'Invalid topic' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    getOrCreateTopicProgress(user, topic);

    user.currentTopic = topic;
    await user.save();

    res.json({
      message: `Selected topic: ${topic}`,
      currentTopic: topic,
    });
  } catch (err) {
    console.error('Select topic error:', err);
    res.status(500).json({ error: 'Failed to select topic' });
  }
});

router.get('/next-question', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const explicitTopic = req.query.topic;
    const explicitDifficulty = req.query.difficulty;
    const slotNum = req.query.slot ? parseInt(req.query.slot) : null;
    const isFreePractice = explicitTopic && AVAILABLE_TOPICS.includes(explicitTopic);

    if (!isFreePractice && !user.assessment?.completed) {
      return res.status(400).json({ error: 'Complete assessment first', needsAssessment: true });
    }

    const userLevel = user.assessment?.estimatedLevelNumeric || user.level || 1;

    if (isFreePractice) {
      const topic = explicitTopic;
      const topicProgress = user.topicProgress?.find(t => t.name === topic);
      const solvedInTopic = topicProgress?.solvedCount || 0;

      const question = await generateQuestion(topic, userLevel, {
        isBossTask: false,
        solvedInTopic,
        explicitDifficulty: explicitDifficulty,
      });

      if (!question) {
        return res.status(500).json({ error: 'Failed to generate question' });
      }

      return res.json({
        question,
        topic,
        isBossTask: false,
        isFreePractice: true,
      });
    }

    const topic = user.currentTopic || (user.roadmap?.[0]?.topic) || 'Arrays';
    const topicProgress = getOrCreateTopicProgress(user, topic);

    if (slotNum) {
      const slot = topicProgress.questions.find(q => q.slotNumber === slotNum);
      if (!slot || slot.status === 'locked') {
        return res.status(400).json({ error: 'This question is locked' });
      }

      if (slot.status === 'completed' && slot.questionData) {
        return res.json({
          question: slot.questionData,
          topic,
          slotNumber: slotNum,
          isBossTask: slot.type === 'boss',
          status: slot.status,
        });
      }
    }

    const unlockedSlots = topicProgress.questions.filter(q =>
      q.status === 'unlocked' || q.status === 'skipped'
    );

    if (unlockedSlots.length === 0) {
      const next = topicProgress.questions.find(q => q.status === 'locked');
      if (!next) {
        return res.json({
          message: 'All questions completed for this topic!',
          topic,
          allCompleted: true,
        });
      }
      return res.status(400).json({ error: 'No unlocked questions' });
    }

    let targetSlot = unlockedSlots.find(q => q.status === 'unlocked' && q.type !== 'optional');
    if (!targetSlot) {
      targetSlot = unlockedSlots[0];
    }

    if (targetSlot.questionData && targetSlot.status === 'unlocked') {
      return res.json({
        question: targetSlot.questionData,
        topic,
        slotNumber: targetSlot.slotNumber,
        isBossTask: targetSlot.type === 'boss',
        isOptional: targetSlot.type === 'optional',
        slotStatus: targetSlot.status,
        questions: topicProgress.questions.map(q => ({
          slotNumber: q.slotNumber,
          type: q.type,
          status: q.status,
        })),
      });
    }

    const isBoss = targetSlot.type === 'boss';
    const difficulty = explicitDifficulty || getDifficultyForSlot(targetSlot.slotNumber, userLevel, isBoss);
    const xpReward = getXpForSlot(targetSlot.slotNumber, isBoss);

    const question = await generateQuestion(topic, userLevel, {
      isBossTask: isBoss,
      solvedInTopic: topicProgress.solvedCount || 0,
      explicitDifficulty: difficulty,
    });

    if (!question) {
      return res.status(500).json({ error: 'Failed to generate question' });
    }

    question.slotNumber = targetSlot.slotNumber;
    question.xpReward = xpReward;
    question.isBossTask = isBoss;

    targetSlot.questionData = question;
    targetSlot.questionId = question.id;
    await user.save();

    res.json({
      question,
      topic,
      slotNumber: targetSlot.slotNumber,
      isBossTask: isBoss,
      isOptional: targetSlot.type === 'optional',
      questions: topicProgress.questions.map(q => ({
        slotNumber: q.slotNumber,
        type: q.type,
        status: q.status,
      })),
    });
  } catch (err) {
    console.error('Next question error:', err);
    res.status(500).json({ error: 'Failed to get next question', details: err.message });
  }
});

router.post('/skip-question', verifyToken, async (req, res) => {
  try {
    const { slotNumber, topic } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetTopic = topic || user.currentTopic || 'Arrays';
    const topicProgress = getOrCreateTopicProgress(user, targetTopic);

    const slot = topicProgress.questions.find(q => q.slotNumber === slotNumber);
    if (!slot) {
      return res.status(400).json({ error: 'Invalid slot number' });
    }

    if (slot.type !== 'optional') {
      return res.status(400).json({ error: 'Only optional questions can be skipped' });
    }

    if (slot.status !== 'unlocked') {
      return res.status(400).json({ error: 'This question is not unlocked' });
    }

    slot.status = 'skipped';
    slot.completedAt = new Date();

    const currentIdx = topicProgress.questions.findIndex(q => q.slotNumber === slotNumber);

    if (currentIdx !== -1 && currentIdx + 1 < topicProgress.questions.length) {
      const nextSlot = topicProgress.questions[currentIdx + 1];
      if (nextSlot.status === 'locked') {
        nextSlot.status = 'unlocked';
      }
    }

    await user.save();

    res.json({
      message: 'Question skipped',
      slotNumber,
      questions: topicProgress.questions.map(q => ({
        slotNumber: q.slotNumber,
        type: q.type,
        status: q.status,
      })),
    });
  } catch (err) {
    console.error('Skip question error:', err);
    res.status(500).json({ error: 'Failed to skip question' });
  }
});

router.post('/submit-question', verifyToken, async (req, res) => {
  try {
    const { question, code, language, slotNumber, topic } = req.body;
    if (!question || !code) {
      return res.status(400).json({ error: 'Question and code are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetTopic = topic || user.currentTopic || question.topic || 'Arrays';
    const topicProgress = getOrCreateTopicProgress(user, targetTopic);

    const evaluation = await evaluateCode(
      question,
      code,
      language || user.preferredLanguage || 'python',
      question.testCases
    );

    topicProgress.attemptedCount = (topicProgress.attemptedCount || 0) + 1;
    topicProgress.lastAttemptedAt = new Date();

    let targetSlot = null;
    if (slotNumber) {
      targetSlot = topicProgress.questions.find(q => q.slotNumber === slotNumber);
    }

    if (evaluation.passed) {
      topicProgress.solvedCount = (topicProgress.solvedCount || 0) + 1;
      topicProgress.accuracy = Math.round((topicProgress.solvedCount / topicProgress.attemptedCount) * 100);

      const xpEarned = question.xpReward || (question.isBossTask ? 200 : 100);
      user.xp = (user.xp || 0) + xpEarned;
      user.solved = (user.solved || 0) + 1;

      user.solvedProblems = user.solvedProblems || [];
      user.solvedProblems.push({
        problemId: question.id,
        title: question.title,
        topic: targetTopic,
        difficulty: question.difficulty,
        solvedAt: new Date(),
        attempts: topicProgress.attemptedCount,
        code,
        feedback: evaluation.feedback,
        xpEarned,
        slotNumber: targetSlot?.slotNumber,
      });

      topicProgress.masteryScore = Math.min(100, (topicProgress.masteryScore || 0) + (question.isBossTask ? 20 : 10));
      if (topicProgress.masteryScore >= 70) {
        topicProgress.isMastered = true;
      }

      if (targetSlot) {
        targetSlot.status = 'completed';
        targetSlot.completedAt = new Date();
        targetSlot.xpEarned = xpEarned;
        targetSlot.attempts = (targetSlot.attempts || 0) + 1;

        const currentIdx = topicProgress.questions.findIndex(q => q.slotNumber === targetSlot.slotNumber);

        const requiredSlots = topicProgress.questions.filter(q => q.type === 'normal');
        const requiredCompleted = requiredSlots.filter(q => q.status === 'completed').length;

        if (requiredCompleted >= 4 && !topicProgress.bossUnlocked) {
          topicProgress.bossUnlocked = true;
          topicProgress.questions.forEach(q => {
            if (q.type === 'optional' || q.type === 'boss') {
              if (q.status === 'locked') {
                q.status = 'unlocked';
              }
            }
          });
        }

        if (currentIdx !== -1 && currentIdx + 1 < topicProgress.questions.length) {
          const nextSlot = topicProgress.questions[currentIdx + 1];
          if (nextSlot.status === 'locked') {
            nextSlot.status = 'unlocked';
          }
        }

        if (targetSlot.type === 'boss') {
          topicProgress.bossTaskCompleted = true;

          const currentRoadmapItem = user.roadmap?.find(r => r.topic === targetTopic);
          if (currentRoadmapItem) {
            currentRoadmapItem.completed = true;
          }

          const nextTopic = user.roadmap?.find(r => !r.completed && r.topic !== targetTopic);
          if (nextTopic) {
            user.currentTopic = nextTopic.topic;
            getOrCreateTopicProgress(user, nextTopic.topic);
          }
        }
      }

      user.level = Math.floor(user.xp / 1000) + 1;
      await user.save();

      res.json({
        passed: true,
        verdict: evaluation.verdict,
        passedTestCases: evaluation.passedTestCases,
        totalTestCases: evaluation.totalTestCases,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions,
        xpEarned,
        newXp: user.xp,
        newLevel: user.level,
        isBossTask: question.isBossTask,
        bossTaskCompleted: targetSlot?.type === 'boss',
        nextTopic: targetSlot?.type === 'boss' ? user.currentTopic : null,
        questions: topicProgress.questions.map(q => ({
          slotNumber: q.slotNumber,
          type: q.type,
          status: q.status,
        })),
        progress: {
          solvedInTopic: topicProgress.solvedCount,
          masteryScore: topicProgress.masteryScore,
          accuracy: topicProgress.accuracy,
          isMastered: topicProgress.isMastered,
        },
      });
    } else {
      if (targetSlot) {
        targetSlot.attempts = (targetSlot.attempts || 0) + 1;
      }
      await user.save();

      res.json({
        passed: false,
        verdict: evaluation.verdict,
        passedTestCases: evaluation.passedTestCases,
        totalTestCases: evaluation.totalTestCases,
        failedTestCase: evaluation.failedTestCase,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions,
        questions: topicProgress?.questions?.map(q => ({
          slotNumber: q.slotNumber,
          type: q.type,
          status: q.status,
        })),
      });
    }
  } catch (err) {
    console.error('Submit question error:', err);
    res.status(500).json({ error: 'Failed to submit question', details: err.message });
  }
});

router.post('/run-code', verifyToken, async (req, res) => {
  try {
    const { question, code, language } = req.body;
    if (!question || !code) {
      return res.status(400).json({ error: 'Question and code are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const evaluation = await evaluateCode(
      question,
      code,
      language || user.preferredLanguage || 'python',
      question.testCases
    );

    res.json({
      passed: evaluation.passed,
      verdict: evaluation.verdict,
      passedTestCases: evaluation.passedTestCases,
      totalTestCases: evaluation.totalTestCases,
      failedTestCase: evaluation.failedTestCase,
      feedback: evaluation.feedback,
      suggestions: evaluation.suggestions,
    });
  } catch (err) {
    console.error('Run code error:', err);
    res.status(500).json({ error: 'Failed to run code', details: err.message });
  }
});

router.get('/progress', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('assessment roadmap topicProgress solvedProblems currentTopic currentBossTask xp level solved');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      assessment: user.assessment,
      roadmap: user.roadmap,
      topicProgress: user.topicProgress,
      currentTopic: user.currentTopic,
      hasBossTask: !!user.currentBossTask,
      stats: {
        xp: user.xp,
        level: user.level,
        totalSolved: user.solved,
        topicsMastered: user.topicProgress?.filter(t => t.isMastered)?.length || 0,
        bossTasksCompleted: user.topicProgress?.filter(t => t.bossTaskCompleted)?.length || 0,
      },
      solvedProblemsForHeatmap: user.solvedProblems || [],
      recentProblems: user.solvedProblems?.slice(-5)?.reverse() || [],
    });
  } catch (err) {
    console.error('Progress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/refresh-roadmap', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const roadmapResult = await generateRoadmap({
      level: user.assessment?.estimatedLevelNumeric || user.level,
      strengths: user.assessment?.strengths || [],
      weaknesses: user.assessment?.weaknesses || [],
      scores: user.assessment?.scores || {},
      topicProgress: user.topicProgress,
    });

    if (roadmapResult.roadmap && Array.isArray(roadmapResult.roadmap)) {
      for (const item of roadmapResult.roadmap) {
        const existingProgress = user.topicProgress?.find(t => t.name === item.topic);
        if (existingProgress) {
          item.completed = existingProgress.bossTaskCompleted || false;
        }
      }
      user.roadmap = roadmapResult.roadmap.sort((a, b) => a.priority - b.priority);

      const nextTopic = user.roadmap.find(r => !r.completed);
      if (nextTopic) {
        user.currentTopic = nextTopic.topic;
        getOrCreateTopicProgress(user, nextTopic.topic);
      }

      await user.save();
    }

    res.json({
      roadmap: user.roadmap,
      overview: roadmapResult.overview,
      currentTopic: user.currentTopic,
    });
  } catch (err) {
    console.error('Refresh roadmap error:', err);
    res.status(500).json({ error: 'Failed to refresh roadmap', details: err.message });
  }
});

export default router;
