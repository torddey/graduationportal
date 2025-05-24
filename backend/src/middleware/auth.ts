import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  studentId: string;
  name?: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded; // No more need for @ts-ignore
    next();
  } catch (err) {
    console.error('JWT Verification failed:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}