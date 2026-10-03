import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * Get all notifications for the authenticated user
 */
export function getMyNotifications(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(userId) as any[];

    const unreadCount = notifications.filter(n => n.is_read === 0).length;

    res.json({
      unread_count: unreadCount,
      notifications: notifications.map(n => ({
        ...n,
        metadata: n.metadata ? JSON.parse(n.metadata) : null
      }))
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
}

/**
 * Mark one or all notifications as read
 */
export function markAsRead(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (id === 'all') {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
    } else {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
    }

    res.json({ message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update notification status' });
  }
}

/**
 * Register a "Notify me when available" alert for an out-of-stock medicine
 */
export function subscribeStockAlert(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Please log in to set availability alerts' });
      return;
    }

    const { medicine_id, pharmacy_id } = req.body;
    if (!medicine_id) {
      res.status(400).json({ error: 'medicine_id is required' });
      return;
    }

    const existing = db.prepare(`
      SELECT id FROM stock_alerts 
      WHERE user_id = ? AND medicine_id = ? AND (pharmacy_id = ? OR (pharmacy_id IS NULL AND ? IS NULL))
    `).get(userId, medicine_id, pharmacy_id || null, pharmacy_id || null);

    if (existing) {
      res.json({ message: 'You are already subscribed for availability updates for this medicine.' });
      return;
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO stock_alerts (id, user_id, medicine_id, pharmacy_id, is_triggered, created_at)
      VALUES (?, ?, ?, ?, 0, datetime('now'))
    `).run(id, userId, medicine_id, pharmacy_id || null);

    res.status(201).json({
      message: 'Alert set successfully! You will receive an in-app notification when this medicine is restocked.',
      alert_id: id
    });
  } catch (error: any) {
    console.error('Subscribe stock alert error:', error);
    res.status(500).json({ error: 'Failed to create availability alert' });
  }
}
