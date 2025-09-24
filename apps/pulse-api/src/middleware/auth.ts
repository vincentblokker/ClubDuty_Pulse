import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  playerId: string;
  teamId: string;
  isCoach?: boolean;
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthenticatedUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT secret is not configured' });
  }
  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;
    req.auth = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireCoach(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.auth.isCoach) {
    return res.status(403).json({ error: 'Coach role required' });
  }
  return next();
}


