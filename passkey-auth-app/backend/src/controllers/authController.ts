import { Request, Response } from 'express';
import * as UserModel from '../models/User';

/**
 * Register a user.
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      res.status(400).json({ 
        success: false,
        message: 'Username and password are required.' 
      });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ 
        success: false,
        message: 'Username must be at least 3 characters long.' 
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long.' 
      });
      return;
    }

    // Duplicate check
    if (UserModel.isUsernameExists(username)) {
      res.status(409).json({ 
        success: false,
        message: 'That username is already taken.' 
      });
      return;
    }

    // Create user
    const user = UserModel.createUser({ username, password });

    // Store in session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.status(201).json({
      success: true,
      message: 'Registration completed.',
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'A server error occurred.' 
    });
  }
}

/**
 * Password login.
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      res.status(400).json({ 
        success: false,
        message: 'Username and password are required.' 
      });
      return;
    }

    // Fetch user
    const user = UserModel.getUserByUsername(username);
    if (!user) {
      res.status(401).json({ 
        success: false,
        message: 'Incorrect username or password.' 
      });
      return;
    }

    // Verify password
    if (!UserModel.verifyPassword(user, password)) {
      res.status(401).json({ 
        success: false,
        message: 'Incorrect username or password.' 
      });
      return;
    }

    // Store in session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.authMethod = 'password';

    res.json({
      success: true,
      message: 'Login succeeded.',
      user: {
        id: user.id,
        username: user.username
      },
      authMethod: 'password'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'A server error occurred.' 
    });
  }
}

/**
 * Logout.
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        res.status(500).json({ 
          error: 'Failed to log out.' 
        });
        return;
      }
      res.json({ 
        message: 'Logged out.' 
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'A server error occurred.' 
    });
  }
}

/**
 * Check session.
 * GET /api/auth/session
 */
export async function getSession(req: Request, res: Response): Promise<void> {
  try {
    if (!req.session.userId) {
      res.status(401).json({ 
        authenticated: false 
      });
      return;
    }

    const user = UserModel.getUserById(req.session.userId);
    if (!user) {
      res.status(401).json({ 
        authenticated: false 
      });
      return;
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username
      },
      authMethod: req.session.authMethod || 'password'
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ 
      error: 'A server error occurred.' 
    });
  }
}
