import { Router } from 'express';
import { Assignment, Feedback } from '../models.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const { roundId, rateeId, strengths, improve } = req.body ?? {};
  if (!roundId || !rateeId || !Array.isArray(strengths) || strengths.length !== 2 || !improve) {
    return res.status(400).json({ error: 'roundId, rateeId, strengths[2], improve are required' });
  }
  // Ensure assignment exists for this rater->ratee
  const existingAssign = await Assignment.findOne({ roundId, raterId: req.auth!.playerId, rateeId });
  if (!existingAssign) {
    return res.status(403).json({ error: 'No assignment for this pair' });
  }
  const doc = await Feedback.create({ roundId, raterId: req.auth!.playerId, rateeId, strengths, improve });
  return res.status(201).json({ id: doc._id });
});

export default router;


