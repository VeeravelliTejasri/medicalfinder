import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medifind_super_secret_hackathon_jwt_key_2026';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role = 'user', phone, pharmacyName, address, city, latitude, longitude, licenseNumber } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(userId, name, email.toLowerCase(), password_hash, role, phone || null);

    let pharmacyId: string | undefined = undefined;

    // If registering as a pharmacy, create pharmacy record
    if (role === 'pharmacy') {
      pharmacyId = uuidv4();
      db.prepare(`
        INSERT INTO pharmacies (
          id, user_id, name, license_number, address, city, latitude, longitude, phone, email, is_verified, is_24_7, open_time, close_time, rating, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, '08:00 AM', '10:00 PM', 4.5, datetime('now'))
      `).run(
        pharmacyId,
        userId,
        pharmacyName || `${name}'s Pharmacy`,
        licenseNumber || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
        address || 'City Center, Main Road',
        city || 'Metropolis',
        latitude || 12.9716,
        longitude || 77.5946,
        phone || '9876543210',
        email.toLowerCase()
      );
    }

    const token = jwt.sign({ id: userId, email: email.toLowerCase(), role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        name,
        email: email.toLowerCase(),
        role,
        pharmacy_id: pharmacyId
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register account' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    let pharmacy: any = null;
    if (user.role === 'pharmacy') {
      pharmacy = db.prepare('SELECT * FROM pharmacies WHERE user_id = ?').get(user.id);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        pharmacy_id: pharmacy ? pharmacy.id : undefined,
        pharmacy_name: pharmacy ? pharmacy.name : undefined
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
}

export function getCurrentUser(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = db.prepare('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?').get(req.user.id) as any;
  let pharmacy: any = null;

  if (user && user.role === 'pharmacy') {
    pharmacy = db.prepare('SELECT * FROM pharmacies WHERE user_id = ?').get(user.id);
  }

  res.json({
    user: {
      ...user,
      pharmacy: pharmacy || undefined
    }
  });
}

export function getDemoAccounts(_req: Request, res: Response): void {
  res.json({
    users: [
      {
        role: 'user',
        email: 'user@demo.com',
        label: 'Citizen / Patient',
        description: 'Search medicines, find nearby pharmacies, compare prices, reserve stock, and upload prescriptions.'
      },
      {
        role: 'pharmacy',
        email: 'pharmacy@demo.com',
        label: 'Apollo Pharmacy Manager',
        description: 'Manage real-time inventory, adjust stock and prices, review and accept/reject patient reservations.'
      },
      {
        role: 'admin',
        email: 'admin@demo.com',
        label: 'Platform Administrator',
        description: 'View platform analytics, manage pharmacy verifications, view stock outage statistics, and oversee requests.'
      }
    ],
    defaultPassword: 'Demo123!'
  });
}
