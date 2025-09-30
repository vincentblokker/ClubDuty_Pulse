import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { Round, RoundStatus } from '../models/Round'
import { Player } from '../models/Player'
import { Assignment } from '../models/Assignment'
import { Feedback } from '../models/Feedback'
import { Types } from 'mongoose'

export const roundsRouter = Router()

// Get all rounds for the authenticated team
roundsRouter.get('/', requireAuth, async (req, res) => {
  try {
    const teamId = req.auth?.teamId
    if (!teamId) {
      res.status(401).json({ error: 'No team in auth context' })
      return
    }

    const rounds = await Round.find({ team: teamId })
      .sort({ createdAt: -1 })
      .lean()

    res.json({ rounds: rounds.map(r => ({
      id: String(r._id),
      name: r.name,
      status: r.status,
      startDate: r.startDate?.toISOString(),
      endDate: r.endDate?.toISOString(),
      assignmentsCount: r.assignments?.length || 0,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    })) })
  } catch {
    res.status(500).json({ error: 'Failed to fetch rounds' })
  }
})

// Get specific round details with shareable URL
roundsRouter.get('/:id', requireAuth, async (req, res) => {
  try {
    const roundId = req.params.id
    const teamId = req.auth?.teamId
    if (!teamId) {
      res.status(401).json({ error: 'No team in auth context' })
      return
    }

    const round = await Round.findOne({ _id: roundId, team: teamId })
      .populate('assignments')
      .lean()

    if (!round) {
      res.status(404).json({ error: 'Round not found' })
      return
    }

    res.json({
      id: String(round._id),
      name: round.name,
      status: round.status,
      startDate: round.startDate?.toISOString(),
      endDate: round.endDate?.toISOString(),
      assignmentsCount: round.assignments?.length || 0,
      createdAt: round.createdAt.toISOString(),
      updatedAt: round.updatedAt.toISOString()
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch round' })
  }
})

// Update round status (open/close) with lifecycle validation
roundsRouter.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const roundId = req.params.id
    const { status } = req.body as { status?: string }
    const teamId = req.auth?.teamId

    if (!teamId) {
      res.status(401).json({ error: 'No team in auth context' })
      return
    }

    if (!status || !['DRAFT', 'OPEN', 'CLOSED'].includes(status)) {
      res.status(400).json({ error: 'Valid status is required (DRAFT, OPEN, CLOSED)' })
      return
    }

    // Get current round to validate status transition
    const currentRound = await Round.findOne({ _id: roundId, team: teamId }).lean()
    if (!currentRound) {
      res.status(404).json({ error: 'Round not found' })
      return
    }

    // Validate status lifecycle
    const validTransitions: Record<RoundStatus, RoundStatus[]> = {
      'DRAFT': ['OPEN'], // Can only go from DRAFT to OPEN
      'OPEN': ['CLOSED'], // Can only go from OPEN to CLOSED
      'CLOSED': [] // Cannot transition from CLOSED
    }

    if (!validTransitions[currentRound!.status].includes(status as RoundStatus)) {
      res.status(400).json({
        error: `Invalid status transition from ${currentRound.status} to ${status}`
      })
      return
    }

    const round = await Round.findOneAndUpdate(
      { _id: roundId, team: teamId },
      { status },
      { new: true }
    ).lean()

    if (!round) {
      res.status(404).json({ error: 'Round not found' })
      return
    }

    res.json({
      id: String(round._id),
      name: round.name,
      status: round.status,
      previousStatus: currentRound.status,
      updatedAt: round.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Round status update error:', error)
    res.status(500).json({ error: 'Failed to update round status' })
  }
})

// Generate shareable URL for a round (for players to access)
roundsRouter.get('/:id/share', requireAuth, async (req, res) => {
  try {
    const roundId = req.params.id
    const teamId = req.auth?.teamId
    if (!teamId) {
      res.status(401).json({ error: 'No team in auth context' })
      return
    }

    const round = await Round.findOne({ _id: roundId, team: teamId }).lean()
    if (!round) {
      res.status(404).json({ error: 'Round not found' })
      return
    }

    // Generate shareable URL (frontend URL + round ID)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const shareableUrl = `${baseUrl}/rounds/${roundId}`

    res.json({
      shareableUrl,
      roundId: String(round._id),
      roundName: round.name,
      status: round.status
    })
  } catch {
    res.status(500).json({ error: 'Failed to generate shareable URL' })
  }
})

roundsRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body as {
      name?: string
      startDate?: string
      endDate?: string
    }

    // Validation
    if (!name || name.trim().length < 2) {
      res.status(400).json({ error: 'Round name must be at least 2 characters long' })
      return
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) {
        res.status(400).json({ error: 'End date must be after start date' })
        return
      }
    }

    const teamId = req.auth?.teamId
    if (!teamId) {
      res.status(401).json({ error: 'No team in auth context' })
      return
    }

    const teamObjId = new Types.ObjectId(String(teamId))

    // Create round in DRAFT status initially
    const roundData: any = {
      name: name.trim(),
      team: teamObjId,
      status: 'DRAFT'
    }

    if (startDate) roundData.startDate = new Date(startDate)
    if (endDate) roundData.endDate = new Date(endDate)

    const round = await Round.create(roundData)
    res.status(201).json({
      id: round._id,
      name: round.name,
      status: round.status,
      message: 'Round created successfully in DRAFT status. Use PUT /rounds/:id/status to open it.'
    })
  } catch (error) {
    console.error('Round creation error:', error)
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
      const base = players.map((p) => String(p._id)).filter((id) => id !== String(raterId))
      const arr: string[] = base.slice()
      // Fisher-Yates shuffle met expliciete non-null assertions ivm noUncheckedIndexedAccess
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = arr[i]!
        arr[i] = arr[j]!
        arr[j] = t
      }
      return arr.slice(0, Math.min(numPerRater, arr.length))
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
    const assignments = await Assignment.find({ round: roundId })
      .populate('rater', 'name')
      .lean()

    const totalNeeded = assignments.reduce((sum, a) => sum + (a.ratees?.length || 0), 0)
    const completed = await Feedback.countDocuments({ assignment: { $in: assignments.map((a) => a._id) } })
    const percent = totalNeeded > 0 ? Math.round((completed / totalNeeded) * 100) : 0

    // Calculate player-level progress
    const playerProgress = await Promise.all(
      assignments.map(async (assignment) => {
        const completedForPlayer = await Feedback.countDocuments({
          assignment: assignment._id
        })

        return {
          playerId: String(assignment.rater._id),
          playerName: (assignment.rater as any).name,
          totalAssigned: assignment.ratees?.length || 0,
          completed: completedForPlayer,
          percentComplete: assignment.ratees?.length ?
            Math.round((completedForPlayer / assignment.ratees.length) * 100) : 0
        }
      })
    )

    // Categorize players by completion status
    const completedAll = playerProgress.filter(p => p.percentComplete === 100).length
    const partial = playerProgress.filter(p => p.percentComplete > 0 && p.percentComplete < 100).length
    const notStarted = playerProgress.filter(p => p.percentComplete === 0).length

    res.json({
      completed,
      totalNeeded,
      percent,
      playerProgress,
      summary: {
        completedAll,
        partial,
        notStarted,
        totalPlayers: assignments.length
      }
    })
  } catch (error) {
    console.error('Progress calculation error:', error)
    res.status(500).json({ error: 'Failed to get progress' })
  }
})

// Get clustered themes for a round
roundsRouter.get('/:id/themes', requireAuth, async (req, res) => {
  try {
    const { id: roundId } = req.params

    // Get all feedback for this round
    const assignments = await Assignment.find({ round: roundId }).lean()
    if (assignments.length === 0) {
      res.json({
        themes: [],
        totalFeedback: 0,
        unrecognizedCount: 0,
        themeDistribution: {}
      })
      return
    }

    const feedback = await Feedback.find({
      assignment: { $in: assignments.map(a => a._id) }
    })
      .populate('ratee', 'name')
      .lean()

    if (feedback.length === 0) {
      res.json({
        themes: [],
        totalFeedback: 0,
        unrecognizedCount: 0,
        themeDistribution: {}
      })
      return
    }

    // Import clustering service
    const { clusterFeedback, convertDatabaseFeedbackToItems } = await import('../services/clustering')

    // Convert database feedback to clustering format
    const feedbackItems = convertDatabaseFeedbackToItems(feedback)

    // Run clustering algorithm
    const clusteringResult = clusterFeedback(feedbackItems)

    // Convert to API response format
    const themesResponse = clusteringResult.themes.map(clustered => ({
      id: clustered.theme.id,
      name: clustered.theme.name,
      nameNl: clustered.theme.nameNl,
      count: clustered.count,
      strengthCount: clustered.strengthCount,
      improvementCount: clustered.improvementCount,
      color: clustered.theme.color,
      examples: clustered.examples.map(example => ({
        id: example.id,
        content: example.content,
        type: example.type,
        createdAt: example.createdAt
      }))
    }))

    res.json({
      themes: themesResponse,
      totalFeedback: clusteringResult.totalFeedback,
      unrecognizedCount: clusteringResult.unrecognizedCount,
      themeDistribution: clusteringResult.themeDistribution
    })
  } catch (error) {
    console.error('Theme clustering error:', error)
    res.status(500).json({ error: 'Failed to cluster feedback into themes' })
  }
})


