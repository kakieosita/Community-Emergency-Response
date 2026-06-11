import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getUsers, addUser } from './db';
import { User, UserRole } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'community-response-secret-key-13579';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(410).json({ error: 'Authorization header is missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole; name: string };
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      createdAt: '', // Not strictly needed in token
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function setupAuthRoutes(app: any) {
  // Register citizen
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, badgeNumber } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }

      const users = await getUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        res.status(400).json({ error: 'A user with this email address already exists' });
        return;
      }

      const targetRole: UserRole = (role === 'responder' || role === 'admin') ? role : 'citizen';
      const passwordHash = bcrypt.hashSync(password, 10);
      
      const newUser = {
        id: 'u-' + Date.now(),
        name,
        email: email.toLowerCase(),
        role: targetRole,
        badgeNumber: targetRole === 'responder' ? badgeNumber || 'Badge-' + Math.floor(Math.random() * 1000) : undefined,
        createdAt: new Date().toISOString(),
        passwordHash,
      };

      await addUser(newUser);

      // Create JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Respond
      const userResponse: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        badgeNumber: newUser.badgeNumber,
        createdAt: newUser.createdAt,
      };

      res.status(201).json({ token, user: userResponse });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'An error occurred during registration' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const users = await getUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userResponse: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        badgeNumber: user.badgeNumber,
        createdAt: user.createdAt,
      };

      res.json({ token, user: userResponse });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'An error occurred during login' });
    }
  });

  // Get current user profile
  app.get('/api/auth/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const users = await getUsers();
    const userRecord = users.find((u) => u.id === req.user?.id);
    if (!userRecord) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const { passwordHash, ...userResponse } = userRecord;
    res.json({ user: userResponse });
  });

  // Admin: Get all responders
  app.get('/api/responders', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin clearance required' });
      return;
    }
    const allUsers = await getUsers();
    const responders = allUsers
      .filter((u) => u.role === 'responder')
      .map(({ passwordHash, ...user }) => user);
    res.json(responders);
  });

  // Admin: Get all citizens
  app.get('/api/citizens', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin clearance required' });
      return;
    }
    const allUsers = await getUsers();
    const citizens = allUsers
      .filter((u) => u.role === 'citizen')
      .map(({ passwordHash, ...user }) => user);
    res.json(citizens);
  });
}
