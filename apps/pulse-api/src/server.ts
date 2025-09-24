import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5011;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
