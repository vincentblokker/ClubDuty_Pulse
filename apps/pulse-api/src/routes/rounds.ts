import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { Round } from '../models/Round'
import { Player } from '../models/Player'
import { Assignment } from '../models/Assignment'
import { Feedback } from '../models/Feedback'
import { Types } from 'mongoose'

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

// Create assignments for a round (even distribution, 2 ratees per rater by default)
roundsRouter.post('/:id/assign', requireAuth, async (req, res) => {
  try {
    const roundId = req.params.id
    const { perRater } = req.body as { perRater?: number }
    const numPerRater = perRater && perRater > 0 ? Math.min(perRater, 3) : 2

    const round = await Round.findById(roundId).lean()
    if (!round) {
      res.status(404).json({ error: 'Round not found' })
      return
    }

    // Fetch players in team
    const players = await Player.find({ team: round.team }).lean()
    if (players.length < 2) {
      res.status(400).json({ error: 'Not enough players to create assignments' })
      return
    }

    // Clear existing assignments for idempotency
    await Assignment.deleteMany({ round: round._id })

    // Helper to pick distinct ratees for a rater
    const pickRatees = (raterId: any) => {
      const candidateIds = players.map((p) => String(p._id)).filter((id) => id !== String(raterId))
      // Simple shuffle
      for (let i = candidateIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[candidateIds[i], candidateIds[j]] = [candidateIds[j], candidateIds[i]]
      }
      return candidateIds.slice(0, Math.min(numPerRater, candidateIds.length))
    }

    const docs = [] as Array<{ round: Types.ObjectId; rater: Types.ObjectId; ratees: Types.ObjectId[] }>
    const roundObjId = new Types.ObjectId(String(round._id))
    for (const p of players) {
      const ratees = pickRatees(p._id).map((id) => new Types.ObjectId(id))
      docs.push({ round: roundObjId, rater: new Types.ObjectId(String(p._id)), ratees })
    }
    const created = await Assignment.insertMany(docs)

    // Link assignments to round
    await Round.updateOne({ _id: round._id }, { $set: { assignments: created.map((a) => a._id) } })

    res.json({ count: created.length })
  } catch (e) {
    res.status(500).json({ error: 'Failed to assign' })
  }
})

// Get assignments for a specific player (by query ?playerId=...)
roundsRouter.get('/:id/my-assign', requireAuth, async (req, res) => {
  try {
    const roundId = req.params.id
    const playerId = String((req.query.playerId as string) || '')
    if (!playerId) {
      res.status(400).json({ error: 'playerId is required' })
      return
    }
    const assign = await Assignment.findOne({ round: roundId, rater: playerId }).populate('ratees', 'name').lean()
    if (!assign) {
      res.status(404).json({ error: 'No assignment for player' })
      return
    }
    res.json({ ratees: (assign.ratees as any[]).map((r) => ({ id: String(r._id), name: (r as any).name })) })
  } catch {
    res.status(500).json({ error: 'Failed to get assignment' })
  }
})

// Progress for a round: completed feedback items vs total required
roundsRouter.get('/:id/progress', requireAuth, async (req, res) => {
  try {
    const roundId = req.params.id
    const assignments = await Assignment.find({ round: roundId }).lean()
    const totalNeeded = assignments.reduce((sum, a) => sum + (a.ratees?.length || 0), 0)
    const completed = await Feedback.countDocuments({ assignment: { $in: assignments.map((a) => a._id) } })
    const percent = totalNeeded > 0 ? Math.round((completed / totalNeeded) * 100) : 0
    res.json({ completed, totalNeeded, percent })
  } catch {
    res.status(500).json({ error: 'Failed to get progress' })
  }
})


