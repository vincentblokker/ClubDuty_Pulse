import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { Assignment } from '../models/Assignment'

export const debugRouter = Router()

// List assignments for a round with basic ids (and optional names)
debugRouter.get('/round/:id/assignments', requireAuth, async (req, res) => {
  try {
    const roundId = req.params.id
    const items = await Assignment.find({ round: roundId })
      .populate('rater', 'name')
      .populate('ratees', 'name')
      .lean()
    const out = items.map((a: any) => ({
      assignmentId: String(a._id),
      rater: { id: String(a.rater?._id || ''), name: a.rater?.name },
      ratees: (a.ratees || []).map((r: any) => ({ id: String(r._id), name: r.name })),
    }))
    res.json({ count: out.length, assignments: out })
  } catch (e) {
    res.status(500).json({ error: 'Failed to list assignments' })
  }
})



