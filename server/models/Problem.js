import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    problemId: { type: String, unique: true, required: true, index: true },
    kind: { type: String, enum: ['fixed', 'adaptive', 'boss'], required: true, index: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    tags: { type: [String], default: [] },
    xp: { type: Number, default: 0 },
    prompt: { type: String, default: '' },
    generatedForUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true }
  },
  { timestamps: true }
);

export default mongoose.model('Problem', problemSchema);

