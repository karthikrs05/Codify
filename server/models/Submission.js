import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: String, required: true, index: true },
    problemTitle: { type: String, required: true },
    verdict: { type: String, required: true, enum: ['AC', 'WA', 'TLE', 'RE'] },
    language: { type: String, required: true },
    time: { type: String, default: '' },
    xp: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);

