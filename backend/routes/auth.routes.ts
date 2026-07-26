import { Router, Request, Response } from 'express';
import { TokenService } from '../services/token.service';

const router = Router();

// Mock login for verification/testing
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // In production, validate credentials against Database
  if (!email || !password) {
    return res.status(400).json({ error: 'Bad Request', message: 'Email and password required' });
  }

  // Mock successful authentication for organizer@hackathon.com or admin@sponsorbase.com
  const mockUser = {
    id: email === 'admin@sponsorbase.com' ? 'admin-uuid-123' : 'user-uuid-456',
    email,
    role: email === 'admin@sponsorbase.com' ? 'admin' : 'user'
  };

  try {
    const accessToken = TokenService.generateAccessToken({
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role
    });

    const refreshToken = await TokenService.generateRefreshToken(mockUser.id);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({ accessToken, user: mockUser });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Bad Request', message: 'Refresh token required' });
  }

  try {
    const { accessToken, newRefreshToken } = await TokenService.rotateRefreshToken(refreshToken);

    // Update refresh token in httpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({ accessToken });
  } catch (error: any) {
    return res.status(401).json({ error: 'Unauthorized', message: error.message });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    try {
      await TokenService.revokeRefreshToken(refreshToken);
    } catch (e) {
      // Ignore errors during token revocation on logout
    }
  }

  res.clearCookie('refreshToken');
  return res.json({ message: 'Logged out successfully' });
});

export default router;
