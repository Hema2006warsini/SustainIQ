import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { query } from '../config/database';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  _id: string; // compatibility alias
  toJSON: () => {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Extract token from HTTP-only cookie, Authorization header, or query param
    let token: string | undefined = req.cookies?.token;
    const isCookieAuth = Boolean(token);

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && typeof req.query?.token === 'string') {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required. Please log in to access this resource.',
      });
    }

    // 2. CSRF verification for state-changing requests when authenticated via cookie
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (isCookieAuth && stateChangingMethods.includes(req.method)) {
      const csrfHeader = (req.headers['x-csrf-token'] as string) || (req.headers['x-requested-with'] as string);
      const csrfCookie = req.cookies?.csrfToken;

      const isValidCsrf = (csrfCookie && csrfHeader === csrfCookie) || csrfHeader === 'XMLHttpRequest';
      if (!isValidCsrf && process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          error: 'Invalid or missing CSRF token for state-changing request.',
        });
      }
    }

    // 3. Verify JWT token
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return res.status(401).json({
        error: 'Invalid or expired session. Please log in again.',
      });
    }

    // 4. Retrieve user from PostgreSQL
    const result = await query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'User account no longer exists. Please register or log in again.',
      });
    }

    const row = result.rows[0];
    const createdAtStr = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
    const updatedAtStr = row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at);

    const authenticatedUser: AuthenticatedUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      created_at: createdAtStr,
      updated_at: updatedAtStr,
      createdAt: createdAtStr,
      updatedAt: updatedAtStr,
      _id: row.id,
      toJSON() {
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          createdAt: createdAtStr,
          updatedAt: updatedAtStr,
        };
      },
    };

    req.user = authenticatedUser;
    next();
  } catch (err) {
    next(err);
  }
}
