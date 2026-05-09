import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema(
  {
    dateKey: { type: String, unique: true, required: true, index: true }, // YYYY-MM-DD
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    title: { type: String, default: 'Daily Contest' }
  },
  { timestamps: true }
);

export default mongoose.model('Contest', contestSchema);

