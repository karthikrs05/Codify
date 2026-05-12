import mongoose from 'mongoose';

const questionSlotSchema = new mongoose.Schema({
  slotNumber: { type: Number, required: true },
  type: { type: String, enum: ['normal', 'optional', 'boss'], default: 'normal' },
  status: { type: String, enum: ['locked', 'unlocked', 'completed', 'skipped'], default: 'locked' },
  questionId: { type: String },
  questionData: { type: mongoose.Schema.Types.Mixed },
  xpEarned: { type: Number, default: 0 },
  completedAt: { type: Date },
  attempts: { type: Number, default: 0 },
});

const topicProgressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  solvedCount: { type: Number, default: 0 },
  attemptedCount: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  masteryScore: { type: Number, default: 0 },
  isMastered: { type: Boolean, default: false },
  bossTaskCompleted: { type: Boolean, default: false },
  lastAttemptedAt: { type: Date },
  questions: [questionSlotSchema],
  currentQuestionSlot: { type: Number, default: 1 },
  bossUnlocked: { type: Boolean, default: false },
});

const solvedProblemSchema = new mongoose.Schema({
  problemId: { type: String, required: true },
  title: { type: String, required: true },
  topic: { type: String },
  difficulty: { type: String },
  solvedAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 1 },
  code: { type: String },
  feedback: { type: String },
  xpEarned: { type: Number, default: 0 },
});

const assessmentSchema = new mongoose.Schema({
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  estimatedLevel: { type: String },
  estimatedLevelNumeric: { type: Number, default: 1 },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  scores: {
    arrays: { type: Number, default: 0 },
    strings: { type: Number, default: 0 },
    hashMaps: { type: Number, default: 0 },
    twoPointers: { type: Number, default: 0 },
    slidingWindow: { type: Number, default: 0 },
    linkedLists: { type: Number, default: 0 },
    stacksQueues: { type: Number, default: 0 },
    trees: { type: Number, default: 0 },
    graphs: { type: Number, default: 0 },
    dynamicProgramming: { type: Number, default: 0 },
  },
});

const roadmapItemSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  priority: { type: Number, required: true },
  reason: { type: String },
  estimatedProblems: { type: Number, default: 5 },
  completed: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  xp:       { type: Number, default: 0 },
  level:    { type: Number, default: 1 },
  streak:   { type: Number, default: 0 },
  solved:   { type: Number, default: 0 },
  rank:     { type: Number, default: 9999 },
  createdAt:{ type: Date, default: Date.now },

  assessment: { type: assessmentSchema, default: () => ({}) },
  topicProgress: [topicProgressSchema],
  roadmap: [roadmapItemSchema],
  solvedProblems: [solvedProblemSchema],

  currentTopic: { type: String },
  currentBossTask: { type: mongoose.Schema.Types.Mixed },

  authenticated: { type: Number, default: 0 },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },

  preferredLanguage: { type: String, default: 'python' },
});

export default mongoose.model('User', userSchema);
