import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true, index: true },
    stage: { type: String, enum: ['fixed', 'adaptive', 'boss'], default: 'fixed' },
    fixedCompleted: { type: [String], default: [] },
    adaptiveSolved: { type: Number, default: 0 },
    batchSize: { type: Number, default: 5 },
    bossAvailable: { type: Boolean, default: false },
    skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    roadmap: {
      topics: {
        type: [
          {
            name: { type: String, required: true },
            pct: { type: Number, required: true }
          }
        ],
        default: []
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model('UserProgress', userProgressSchema);

