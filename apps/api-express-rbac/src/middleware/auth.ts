import type { NextFunction, Request, Response } from 'express';
import { nulvless } from '../lib/nulvless.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: 'Sign in first.' });

  const { data, error } = await nulvless.auth.verify(undefined, { headers: { Authorization: authorization } });
  if (error) return res.status(401).json({ error: 'Your session is not valid.' });

  req.userId = data.user.id;
  next();
}

export function requireRole(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: 'Sign in first.' });

    const { data, error } = await nulvless.auth.verify(
      { resource: String(req.params.org), roles },
      { headers: { Authorization: authorization } },
    );
    if (error) return res.status(403).json({ error: `Only ${roles.join(' or ')} can do this.` });

    req.userId = data.user.id;
    next();
  };
}
