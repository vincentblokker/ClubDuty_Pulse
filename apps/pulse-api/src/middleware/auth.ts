import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthPayload {
  teamId: string
  teamCode: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' })
    return
  }
  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).json({ error: 'JWT secret not configured' })
    return
  }
  try {
    const payload = jwt.verify(token, secret) as AuthPayload
    req.auth = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}


