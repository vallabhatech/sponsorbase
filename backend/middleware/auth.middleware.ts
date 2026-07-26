import { Request, Response, NextFunction } from 'express';
import { TokenService, TokenPayload } from '../services/token.service';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = TokenService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({ error: 'Unauthorized', message: error.message || 'Invalid or expired token' });
  }
};
