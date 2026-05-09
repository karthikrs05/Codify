import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
    handle: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 2, maxlength: 32 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
    ,
    location: { type: String, default: '' },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    solved: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
