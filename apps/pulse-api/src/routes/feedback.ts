import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { Feedback } from '../models/Feedback'

export const feedbackRouter = Router()

feedbackRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { assignmentId, rateeId, strengths, improvement } = req.body as {
      assignmentId?: string
      rateeId?: string
      strengths?: string[]
      improvement?: string
    }
    if (!assignmentId || !rateeId || !Array.isArray(strengths) || strengths.length !== 2 || !improvement) {
      res.status(400).json({ error: 'Invalid payload' })
      return
    }
    const doc = await Feedback.create({ assignment: assignmentId, ratee: rateeId, strengths, improvement })
    res.status(201).json({ id: doc._id })
  } catch (e: any) {
    if (e?.code === 11000) {
      res.status(409).json({ error: 'Already submitted for this ratee' })
      return
    }
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
})


