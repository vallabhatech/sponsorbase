import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const roleGuard = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }

    next();
  };
};
