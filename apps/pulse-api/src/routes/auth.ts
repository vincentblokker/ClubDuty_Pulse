import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Player, Team } from '../models.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { teamCode, token } = req.body ?? {};
  if (!teamCode || !token) {
    return res.status(400).json({ error: 'teamCode and token are required' });
  }
  const team = await Team.findOne({ joinCode: teamCode });
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  const player = await Player.findOne({ teamId: team._id, token });
  if (!player) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT secret missing' });
  }
  const jwtPayload = {
    playerId: String(player._id),
    teamId: String(team._id),
    isCoach: !!player.isCoach,
  };
  const jwtToken = jwt.sign(jwtPayload, secret, { expiresIn: '7d' });
  return res.json({ token: jwtToken, player: { id: player._id, firstName: player.firstName, isCoach: !!player.isCoach }, team: { id: team._id, name: team.name } });
});

export default router;


