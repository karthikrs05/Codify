import UserProgress from '../models/UserProgress.js';
import Problem from '../models/Problem.js';
import { fixedProblems, topics as defaultTopics } from '../data/catalog.js';
import { generateAdaptiveQuestion } from './adaptiveQuestions.js';

function inferSkillLevel({ fixedCompletedCount }) {
  if (fixedCompletedCount >= 5) return 'Intermediate';
  if (fixedCompletedCount >= 3) return 'Beginner';
  return 'Beginner';
}

function buildRoadmap({ skillLevel }) {
  // MVP: static roadmap; later: derived from analysis & submissions.
  const base = defaultTopics.map((t) => ({ ...t }));
  if (skillLevel === 'Beginner') {
    return base.map((t) => ({ ...t, pct: t.name === 'Arrays' || t.name === 'Strings' ? 30 : 10 }));
  }
  if (skillLevel === 'Advanced') {
    return base.map((t) => ({ ...t, pct: t.name === 'Dynamic Programming' || t.name === 'Graphs' ? 60 : 30 }));
  }
  return base.map((t) => ({ ...t, pct: t.name === 'Trees' || t.name === 'Binary Search' ? 45 : 30 }));
}

export async function getOrCreateProgress(userId) {
  const doc = await UserProgress.findOne({ userId });
  if (doc) return doc;
  return UserProgress.create({
    userId,
    stage: 'fixed',
    fixedCompleted: [],
    adaptiveSolved: 0,
    batchSize: 5,
    bossAvailable: false,
    skillLevel: 'Beginner',
    roadmap: { topics: buildRoadmap({ skillLevel: 'Beginner' }) }
  });
}

export async function ensureFixedProblemsUpserted() {
  // Keep fixed catalog in DB for consistent lookups.
  await Promise.all(
    fixedProblems.map((p) =>
      Problem.updateOne(
        { problemId: p.id },
        { $setOnInsert: { problemId: p.id, kind: 'fixed', title: p.title, difficulty: p.difficulty, tags: p.tags, xp: p.xp } },
        { upsert: true }
      )
    )
  );
}

export async function getNextAssignedProblem({ user }) {
  await ensureFixedProblemsUpserted();
  const progress = await getOrCreateProgress(user._id);

  // Fixed set first
  if (progress.stage === 'fixed') {
    const remaining = fixedProblems.find((p) => !progress.fixedCompleted.includes(p.id));
    if (remaining) {
      const p = await Problem.findOne({ problemId: remaining.id });
      return { mode: 'fixed', problem: p };
    }
    // Transition to adaptive once fixed done
    progress.stage = 'adaptive';
    progress.skillLevel = inferSkillLevel({ fixedCompletedCount: progress.fixedCompleted.length });
    progress.roadmap = { topics: buildRoadmap({ skillLevel: progress.skillLevel }) };
    await progress.save();
  }

  // Boss gate
  if (progress.bossAvailable || progress.stage === 'boss') {
    const boss = await Problem.findOne({ kind: 'boss', generatedForUserId: user._id }).sort({ createdAt: -1 });
    if (boss) return { mode: 'boss', problem: boss };
    // If boss missing, create one
    const gen = await generateAdaptiveQuestion({ user, topic: 'Algorithms', difficulty: 'Hard' });
    const created = await Problem.create({
      problemId: `boss_${user._id}_${Date.now()}`,
      kind: 'boss',
      title: gen.title || 'Boss Task',
      difficulty: 'Hard',
      tags: gen.tags || ['Boss'],
      xp: gen.xp || 300,
      prompt: gen.prompt || '',
      generatedForUserId: user._id
    });
    return { mode: 'boss', problem: created };
  }

  // Adaptive assignment
  const gen = await generateAdaptiveQuestion({
    user,
    topic: progress.roadmap?.topics?.[0]?.name || 'Arrays',
    difficulty: progress.skillLevel === 'Advanced' ? 'Hard' : progress.skillLevel === 'Intermediate' ? 'Medium' : 'Easy'
  });

  const created = await Problem.create({
    problemId: gen.id || `gen_${user._id}_${Date.now()}`,
    kind: 'adaptive',
    title: gen.title,
    difficulty: gen.difficulty,
    tags: gen.tags || [],
    xp: gen.xp || 125,
    prompt: gen.prompt || '',
    generatedForUserId: user._id
  });

  return { mode: 'adaptive', problem: created };
}

export async function onProblemSolved({ user, problemId }) {
  const progress = await getOrCreateProgress(user._id);
  const problem = await Problem.findOne({ problemId });
  if (!problem) return progress;

  if (problem.kind === 'fixed') {
    if (!progress.fixedCompleted.includes(problemId)) progress.fixedCompleted.push(problemId);
    if (progress.fixedCompleted.length >= fixedProblems.length) {
      progress.stage = 'adaptive';
      progress.skillLevel = inferSkillLevel({ fixedCompletedCount: progress.fixedCompleted.length });
      progress.roadmap = { topics: buildRoadmap({ skillLevel: progress.skillLevel }) };
    }
  } else if (problem.kind === 'adaptive') {
    progress.adaptiveSolved += 1;
    if (progress.adaptiveSolved > 0 && progress.adaptiveSolved % progress.batchSize === 0) {
      progress.bossAvailable = true;
      progress.stage = 'boss';
    }
  } else if (problem.kind === 'boss') {
    progress.bossAvailable = false;
    progress.stage = 'adaptive';
  }

  await progress.save();
  return progress;
}

