import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { Round } from '../models/Round'

export const roundsRouter = Router()

roundsRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { name } = req.body as { name?: string }
    if (!name) {
      res.status(400).json({ error: 'name is required' })
      return
    }
    const teamId = req.auth!.teamId
    const round = await Round.create({ name, team: teamId, status: 'OPEN' })
    res.status(201).json({ id: round._id })
  } catch {
    res.status(500).json({ error: 'Failed to create round' })
  }
})


