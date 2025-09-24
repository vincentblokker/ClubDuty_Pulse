import { Router } from 'express';
import { Feedback, Player } from '../models.js';
import { requireAuth, requireCoach } from '../middleware/auth.js';

const router = Router();

router.post('/:id/summary', requireAuth, requireCoach, async (req, res) => {
  const roundId = req.params.id;
  const items = await Feedback.find({ roundId });
  const players = await Player.find({ teamId: req.auth!.teamId });
  const playerMap = new Map(players.map((p) => [String(p._id), p]));

  const teamBullets: string[] = [];
  const perPlayer: Array<{ playerId: string; firstName: string; bullets: string[] }> = [];

  for (const fb of items) {
    teamBullets.push(...fb.strengths, fb.improve);
    const player = playerMap.get(String(fb.rateeId));
    if (player) {
      let entry = perPlayer.find((p) => p.playerId === String(player._id));
      if (!entry) {
        entry = { playerId: String(player._id), firstName: player.firstName, bullets: [] };
        perPlayer.push(entry);
      }
      entry.bullets.push(...fb.strengths, fb.improve);
    }
  }

  return res.json({ teamBullets, players: perPlayer });
});

// Export team bullets as CSV (no names)
router.get('/:id/export.csv', requireAuth, requireCoach, async (req, res) => {
  const roundId = req.params.id;
  const items = await Feedback.find({ roundId });
  const bullets: string[] = [];
  for (const fb of items) {
    bullets.push(...fb.strengths, fb.improve);
  }
  const csvLines = ['bullet'];
  for (const b of bullets) {
    const escaped = '"' + String(b).replaceAll('"', '""') + '"';
    csvLines.push(escaped);
  }
  const csv = csvLines.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="round-summary.csv"');
  return res.send(csv);
});

export default router;


