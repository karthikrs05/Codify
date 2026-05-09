import mongoose from 'mongoose';

const contestEntrySchema = new mongoose.Schema(
  {
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, default: 0 },
    solved: { type: Number, default: 0 },
    lastSubmissionAt: { type: Date, default: null }
  },
  { timestamps: true }
);

contestEntrySchema.index({ contestId: 1, userId: 1 }, { unique: true });

export default mongoose.model('ContestEntry', contestEntrySchema);

