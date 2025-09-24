import { Router } from 'express';
import { Assignment, Player, Round, Feedback } from '../models.js';
import { requireAuth, requireCoach } from '../middleware/auth.js';

const router = Router();

// Create a round (coach only)
router.post('/', requireAuth, requireCoach, async (req, res) => {
  const { title } = req.body ?? {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const round = await Round.create({ teamId: req.auth!.teamId, title, status: 'open' });
  return res.status(201).json({ id: round._id, title: round.title, status: round.status });
});

// Assign raters to ratees evenly
router.post('/:id/assign', requireAuth, requireCoach, async (req, res) => {
  const roundId = req.params.id;
  const players = await Player.find({ teamId: req.auth!.teamId });
  if (players.length < 2) return res.status(400).json({ error: 'Not enough players' });
  const nonCoachPlayers = players.filter((p) => !p.isCoach);
  const assignments: Array<{ roundId: string; raterId: string; rateeId: string }> = [];
  for (let i = 0; i < nonCoachPlayers.length; i++) {
    const rater = nonCoachPlayers[i];
    const ratee = nonCoachPlayers[(i + 1) % nonCoachPlayers.length];
    assignments.push({ roundId, raterId: String(rater._id), rateeId: String(ratee._id) });
  }
  await Assignment.deleteMany({ roundId });
  await Assignment.insertMany(assignments);
  return res.json({ count: assignments.length });
});

// Progress for a round (simple count)
router.get('/:id/progress', requireAuth, async (req, res) => {
  const roundId = req.params.id;
  const totalAssignments = await Assignment.countDocuments({ roundId });
  const completed = await Feedback.countDocuments({ roundId });
  const percent = totalAssignments === 0 ? 0 : Math.round((completed / totalAssignments) * 100);
  return res.json({ totalAssignments, completed, percent });
});

// My assignments for the logged-in player
router.get('/:id/my-assign', requireAuth, async (req, res) => {
  const roundId = req.params.id;
  const list = await Assignment.find({ roundId, raterId: req.auth!.playerId });
  return res.json({ assignments: list });
});

export default router;


