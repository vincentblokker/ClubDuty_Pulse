import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { Feedback } from '../models/Feedback'
import { Assignment } from '../models/Assignment'
import { Player } from '../models/Player'

export const feedbackRouter = Router()

// Public endpoint to get assignment details for feedback form
feedbackRouter.get('/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params

    const assignment = await Assignment.findById(assignmentId)
      .populate('ratees', 'name')
      .populate('round', 'name')
      .lean()

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' })
      return
    }

    // Check if feedback already submitted for this assignment
    const existingFeedback = await Feedback.findOne({
      assignment: assignmentId
    }).lean()

    if (existingFeedback) {
      res.status(409).json({ error: 'Feedback already submitted for this assignment' })
      return
    }

    res.json({
      assignmentId: String(assignment._id),
      roundName: (assignment.round as any)?.name || 'Feedback Round',
      ratees: (assignment.ratees as any[]).map((ratee: any) => ({
        id: String(ratee._id),
        name: ratee.name
      }))
    })
  } catch (error) {
    console.error('Feedback assignment lookup error:', error)
    res.status(500).json({ error: 'Failed to load assignment details' })
  }
})

// Submit feedback (public endpoint - no auth required)
feedbackRouter.post('/', async (req, res) => {
  try {
    const { assignmentId, rateeId, strengths, improvement } = req.body as {
      assignmentId?: string
      rateeId?: string
      strengths?: string[]
      improvement?: string
    }

    // Validation
    if (!assignmentId || !rateeId || !Array.isArray(strengths) || strengths.length !== 2 || !improvement) {
      res.status(400).json({
        error: 'Invalid payload. Required: assignmentId, rateeId, strengths (array of 2), improvement'
      })
      return
    }

    // Verify assignment exists and ratee is valid for this assignment
    const assignment = await Assignment.findById(assignmentId).lean()
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' })
      return
    }

    const rateeIds = assignment.ratees.map(id => String(id))
    if (!rateeIds.includes(rateeId)) {
      res.status(400).json({ error: 'Invalid ratee for this assignment' })
      return
    }

    // Check if feedback already submitted for this assignment and ratee
    const existingFeedback = await Feedback.findOne({
      assignment: assignmentId,
      ratee: rateeId
    }).lean()

    if (existingFeedback) {
      res.status(409).json({ error: 'Feedback already submitted for this ratee' })
      return
    }

    // Validate strengths array
    if (strengths.some(s => !s || s.trim().length < 3)) {
      res.status(400).json({ error: 'Each strength must be at least 3 characters long' })
      return
    }

    if (improvement.trim().length < 3) {
      res.status(400).json({ error: 'Improvement area must be at least 3 characters long' })
      return
    }

    const doc = await Feedback.create({
      assignment: assignmentId,
      ratee: rateeId,
      strengths: strengths.map(s => s.trim()),
      improvement: improvement.trim()
    })

    res.status(201).json({
      id: doc._id,
      message: 'Feedback submitted successfully!'
    })
  } catch (error: any) {
    console.error('Feedback submission error:', error)
    if (error?.code === 11000) {
      res.status(409).json({ error: 'Feedback already submitted for this assignment and ratee' })
      return
    }
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
})

// Legacy authenticated feedback endpoint (for coaches)
feedbackRouter.post('/auth', requireAuth, async (req, res) => {
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

// Get all feedback for a round (for coaches) - anonymized
feedbackRouter.get('/round/:roundId', requireAuth, async (req, res) => {
  try {
    const { roundId } = req.params
    const { type, playerId } = req.query as { type?: 'strengths' | 'improvement'; playerId?: string }

    // Build filter query
    const filter: any = { assignment: { $in: [] } }

    // First get all assignments for this round
    const assignments = await Assignment.find({ round: roundId }).lean()
    if (assignments.length === 0) {
      res.json({ feedback: [], players: [] })
      return
    }

    filter.assignment.$in = assignments.map(a => a._id)

    // Filter by type if specified
    if (type) {
      if (type === 'strengths') {
        filter.strengths = { $exists: true, $ne: [] }
      } else if (type === 'improvement') {
        filter.improvement = { $exists: true, $ne: '' }
      }
    }

    // Filter by specific player if specified
    if (playerId) {
      filter.ratee = playerId
    }

    // Get all feedback matching the filter
    const feedback = await Feedback.find(filter)
      .populate('ratee', 'name')
      .populate('assignment', 'rater')
      .sort({ createdAt: -1 })
      .lean()

    // Group feedback by player (ratee) and anonymize
    const feedbackByPlayer = new Map()

    for (const item of feedback) {
      const playerId = String(item.ratee._id)
      const playerName = (item.ratee as any).name

      if (!feedbackByPlayer.has(playerId)) {
        feedbackByPlayer.set(playerId, {
          playerId,
          playerName,
          strengths: [],
          improvements: []
        })
      }

      const playerData = feedbackByPlayer.get(playerId)

      // Add to appropriate category
      if (item.strengths && item.strengths.length > 0) {
        playerData.strengths.push({
          id: String(item._id),
          content: item.strengths,
          createdAt: item.createdAt
        })
      }

      if (item.improvement) {
        playerData.improvements.push({
          id: String(item._id),
          content: item.improvement,
          createdAt: item.createdAt
        })
      }
    }

    // Get all players who received feedback in this round
    const playersWithFeedback = Array.from(feedbackByPlayer.values())

    res.json({
      feedback: playersWithFeedback,
      totalPlayers: playersWithFeedback.length,
      totalFeedback: feedback.length,
      filter: { type, playerId }
    })
  } catch (error) {
    console.error('Feedback retrieval error:', error)
    res.status(500).json({ error: 'Failed to retrieve feedback' })
  }
})