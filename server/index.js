import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import emailRouter from './routes/email.js';
import profileRouter from './routes/profile.js';
import leaderboardRouter from './routes/leaderboard.js';
import dashboardRouter from './routes/dashboard.js';
import problemsRouter from './routes/problems.js';
import submissionsRouter from './routes/submissions.js';
import roadmapRouter from './routes/roadmap.js';

async function connectMongo(mongoUri) {
  const opts = { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 };
  const uris = [mongoUri];
  if (
    typeof mongoUri === 'string' &&
    (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) &&
    mongoUri.includes(':27017')
  ) {
    uris.push('mongodb://%2Ftmp%2Fmongodb-27017.sock/codify_arena');
  }

  let lastErr = null;
  for (const uri of uris) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await mongoose.connect(uri, opts);
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function main() {
  dotenv.config();

  const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI in environment.');

  if (mongoose.connection.readyState !== 1) {
    try {
      await connectMongo(MONGODB_URI);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to connect to MongoDB.');
      // eslint-disable-next-line no-console
      console.error(`MONGODB_URI=${MONGODB_URI}`);
      // eslint-disable-next-line no-console
      console.error(err?.message || err);
      process.exit(1);
    }
  }

  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
      credentials: true
    })
  );

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter);
  app.use('/api/email', emailRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/problems', problemsRouter);
  app.use('/api/submissions', submissionsRouter);
  app.use('/api/roadmap', roadmapRouter);

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err?.code === 'EADDRINUSE') {
      // eslint-disable-next-line no-console
      console.error(`Port ${PORT} is already in use. Set PORT in .env to a free port (e.g. 8788).`);
      process.exit(1);
    }
    throw err;
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err?.message || err);
  process.exit(1);
});
