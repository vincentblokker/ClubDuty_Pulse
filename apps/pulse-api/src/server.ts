import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './db.js';
import { Team } from './models.js';
import authRouter from './routes/auth.js';
import roundsRouter from './routes/rounds.js';
import feedbackRouter from './routes/feedback.js';
import summaryRouter from './routes/summary.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV ?? 'dev' });
});

app.get('/debug/teams', async (_req, res) => {
  try {
    const count = await Team.countDocuments();
    const sample = await Team.findOne();
    res.json({ count, sample });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// Routes
app.use('/auth', authRouter);
app.use('/rounds', roundsRouter);
app.use('/feedback', feedbackRouter);
app.use('/rounds', summaryRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 5011;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clubduty-pulse';

async function start() {
  await connectToDatabase(MONGODB_URI);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
