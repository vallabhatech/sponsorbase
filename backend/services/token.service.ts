import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// In production, these should be loaded from secure environment variables or files
// We provide a fallback keypair for development purposes so the app starts cleanly
const devPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBc44Tj9yKlh1W
5+jOsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbI
f3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98L
eNDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82y
H9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC
3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNs
h/c/fC3jQ8CAwEAAQKBgQC3/X5X8yL8q+D6/L/R4aL+Wz99+J6T+h8hL7E1t2h+
n/4+Tz+k+N8p+q8M+r8L+m8M+h8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L
+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H
+v8G+v8CgYEA8z9e4n9vJ6y6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6
M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+
Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D
+o5B2s+CgYEA0U5X8yL8q+D6/L/R4aL+Wz99+J6T+h8hL7E1t2h+n/4+Tz+k+N8p
+q8M+r8L+m8M+h8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L
+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H
+v8G+v8CgYEA6z9e4n9vJ6y6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6
M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+
Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D
+o5B2s+CgYEA0U5X8yL8q+D6/L/R4aL+Wz99+J6T+h8hL7E1t2h+n/4+Tz+k+N8p
+q8M+r8L+m8M+h8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L
+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H+v8G+v8L+r8H
+v8G+v8CgYEA6z9e4n9vJ6y6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6
M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+
Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D+o5B2s+4T9yL6M9l+Z7D
+o5B2s8=
-----END PRIVATE KEY-----`;

const devPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwXOUE4/cipYdVufozrIf
3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98Le
NDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82yH
9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3
jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh
/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt
40PNsh/c/fC3jQ82yH9z98LeNDzbIf3P3wt40PNsh/c/fC3jQ8CAwEAAQ==
-----END PUBLIC KEY-----`;

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY 
  ? process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n') 
  : devPrivateKey;

const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY 
  ? process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n') 
  : devPublicKey;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// In-memory mock database to track refresh tokens since Prisma schema is in a separate branch
// This allows testing the auth logic independently of the DB migrations
interface RefreshTokenStore {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  familyId: string; // Used for reuse detection/token rotation families
  isRevoked: boolean;
}

const mockDbRefreshTokens = new Map<string, RefreshTokenStore>();

export class TokenService {
  /**
   * Generates a short-lived access token (JWT) using RS256.
   */
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, PRIVATE_KEY, {
      algorithm: 'RS256',
      expiresIn: '15m'
    });
  }

  /**
   * Verifies an access token.
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Generates an opaque refresh token and stores it in the database.
   */
  static async generateRefreshToken(userId: string, familyId?: string): Promise<string> {
    const rawToken = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const newFamilyId = familyId || crypto.randomUUID();

    // Store in mock/actual database
    mockDbRefreshTokens.set(tokenHash, {
      tokenHash,
      userId,
      expiresAt,
      familyId: newFamilyId,
      isRevoked: false
    });

    return rawToken;
  }

  /**
   * Rotates a refresh token. Validates the old token, invalidates the family if reused, and returns a new token pair.
   */
  static async rotateRefreshToken(oldRefreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    const tokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
    const storedToken = mockDbRefreshTokens.get(tokenHash);

    if (!storedToken) {
      throw new Error('Refresh token not found');
    }

    // Reuse detection: if the token is already revoked or past expiry, revoke the whole family
    if (storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      // Invalidate all tokens in this family
      for (const [key, val] of mockDbRefreshTokens.entries()) {
        if (val.familyId === storedToken.familyId) {
          val.isRevoked = true;
        }
      }
      throw new Error('Refresh token reuse or expiry detected. Access revoked.');
    }

    // Revoke old token
    storedToken.isRevoked = true;

    // Generate new pair
    const newAccessToken = this.generateAccessToken({
      userId: storedToken.userId,
      email: '', // Fetch from actual user db in production
      role: 'user' // Fetch from actual user db in production
    });

    const newRefreshToken = await this.generateRefreshToken(storedToken.userId, storedToken.familyId);

    return {
      accessToken: newAccessToken,
      newRefreshToken
    };
  }

  /**
   * Revokes a refresh token (logout).
   */
  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = mockDbRefreshTokens.get(tokenHash);
    if (storedToken) {
      storedToken.isRevoked = true;
    }
  }
}
