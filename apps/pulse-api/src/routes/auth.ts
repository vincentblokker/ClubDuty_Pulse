import { Router } from 'express'
import jwt = require('jsonwebtoken')
import { Team } from '../models/Team'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  try {
    const { teamCode, token } = req.body as { teamCode?: string; token?: string }
    if (!teamCode || !token) {
      res.status(400).json({ error: 'teamCode and token are required' })
      return
    }
    const team = await Team.findOne({ code: teamCode.toUpperCase() }).lean()
    if (!team || team.token !== token) {
      res.status(401).json({ error: 'Invalid team code or token' })
      return
    }
    const secret = process.env.JWT_SECRET
    if (!secret) {
      res.status(500).json({ error: 'JWT secret not configured' })
      return
    }
    const jwtToken = jwt.sign({ teamId: String(team._id), teamCode: team.code }, secret, { expiresIn: '8h' })
    res.json({ jwt: jwtToken })
  } catch (e) {
    res.status(500).json({ error: 'Login failed' })
  }
})


