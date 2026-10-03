import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'pharmacy' | 'admin';
    name: string;
    pharmacy_id?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'medifind_super_secret_hackathon_jwt_key_2026';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Fetch latest user details including linked pharmacy if role is pharmacy
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(decoded.id) as any;
    if (!user) {
      res.status(401).json({ error: 'User not found or session expired' });
      return;
    }

    let pharmacyId: string | undefined = undefined;
    if (user.role === 'pharmacy') {
      const pharmacy = db.prepare('SELECT id FROM pharmacies WHERE user_id = ?').get(user.id) as any;
      if (pharmacy) {
        pharmacyId = pharmacy.id;
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      pharmacy_id: pharmacyId
    };

    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(allowedRoles: ('user' | 'pharmacy' | 'admin')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Access forbidden: Requires one of [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.` 
      });
      return;
    }

    next();
  };
}
