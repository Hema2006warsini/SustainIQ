import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { hashPassword, comparePassword, generateToken, setAuthCookie, clearAuthCookie } from '../utils/auth';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists in PostgreSQL
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // 2. Hash password securely
    const passwordHash = await hashPassword(password);

    // 3. Create user in PostgreSQL
    const insertRes = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, updated_at`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    const newUser = insertRes.rows[0];
    const createdAtStr = newUser.created_at instanceof Date ? newUser.created_at.toISOString() : String(newUser.created_at);
    const updatedAtStr = newUser.updated_at instanceof Date ? newUser.updated_at.toISOString() : String(newUser.updated_at);

    // 4. Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // 5. Set secure HTTP-only cookie
    setAuthCookie(res, token);

    // 6. Return response with sanitized user info
    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: createdAtStr,
        updatedAt: updatedAtStr,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user by email in PostgreSQL
    const result = await query(
      'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    // 2. Compare password securely
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password.',
      });
    }

    const createdAtStr = user.created_at instanceof Date ? user.created_at.toISOString() : String(user.created_at);
    const updatedAtStr = user.updated_at instanceof Date ? user.updated_at.toISOString() : String(user.updated_at);

    // 3. Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // 4. Set secure HTTP-only cookie
    setAuthCookie(res, token);

    // 5. Return response
    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: createdAtStr,
        updatedAt: updatedAtStr,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response) {
  clearAuthCookie(res);
  res.status(200).json({
    message: 'Logged out successfully',
  });
}

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.status(200).json({
    user: req.user.toJSON(),
  });
}
