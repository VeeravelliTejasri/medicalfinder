import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateStockStatus } from '../config/thresholds.js';
import { notifyReservationStatusChange } from '../services/notificationService.js';

/**
 * Patient creates a reservation request for an available medicine at a pharmacy
 */
export function createReservation(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User must be authenticated to reserve medicine' });
      return;
    }

    const { pharmacy_id, medicine_id, quantity = 1, notes } = req.body;

    if (!pharmacy_id || !medicine_id) {
      res.status(400).json({ error: 'pharmacy_id and medicine_id are required' });
      return;
    }

    // Check inventory availability
    const inv = db.prepare(`
      SELECT i.*, m.name as medicine_name, p.name as pharmacy_name 
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.id
      JOIN pharmacies p ON i.pharmacy_id = p.id
      WHERE i.pharmacy_id = ? AND i.medicine_id = ?
    `).get(pharmacy_id, medicine_id) as any;

    if (!inv) {
      res.status(404).json({ error: 'This medicine is not stocked at the selected pharmacy' });
      return;
    }

    if (inv.quantity < quantity) {
      res.status(400).json({ 
        error: `Insufficient stock. Only ${inv.quantity} units currently available at ${inv.pharmacy_name}.` 
      });
      return;
    }

    const resId = uuidv4();
    const reservationCode = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
    const totalPrice = Math.round(inv.price * quantity * 100) / 100;

    // Calculate pickup deadline: 4 hours from now
    const deadline = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    // Deduct held quantity from inventory
    const newQty = Math.max(0, inv.quantity - quantity);
    const newStatus = calculateStockStatus(newQty, inv.low_stock_threshold);
    db.prepare(`
      UPDATE inventory 
      SET quantity = ?, availability_status = ?, last_updated = datetime('now')
      WHERE id = ?
    `).run(newQty, newStatus, inv.id);

    // Create reservation record
    db.prepare(`
      INSERT INTO reservations (
        id, reservation_code, user_id, pharmacy_id, medicine_id, quantity, total_price, status, pickup_deadline, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, datetime('now'), datetime('now'))
    `).run(resId, reservationCode, userId, pharmacy_id, medicine_id, quantity, totalPrice, deadline, notes || null);

    res.status(201).json({
      message: 'Reservation submitted successfully',
      reservation: {
        id: resId,
        reservation_code: reservationCode,
        pharmacy_name: inv.pharmacy_name,
        medicine_name: inv.medicine_name,
        quantity,
        total_price: totalPrice,
        status: 'PENDING',
        pickup_deadline: deadline,
        instructions: 'The pharmacy will review your reservation shortly. Check notifications for confirmation.'
      }
    });
  } catch (error: any) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
}

/**
 * Get reservations for the currently authenticated user
 */
export function getUserReservations(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const reservations = db.prepare(`
      SELECT 
        r.*,
        p.name as pharmacy_name,
        p.address as pharmacy_address,
        p.phone as pharmacy_phone,
        p.latitude as pharmacy_lat,
        p.longitude as pharmacy_lng,
        m.name as medicine_name,
        m.strength as medicine_strength,
        m.dosage_form as medicine_form,
        m.requires_prescription
      FROM reservations r
      JOIN pharmacies p ON r.pharmacy_id = p.id
      JOIN medicines m ON r.medicine_id = m.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);

    res.json({ reservations });
  } catch (error: any) {
    console.error('Get user reservations error:', error);
    res.status(500).json({ error: 'Failed to retrieve reservations' });
  }
}

/**
 * Get reservation requests for the authenticated pharmacy
 */
export function getPharmacyReservations(req: AuthRequest, res: Response): void {
  try {
    const pharmacyId = req.user?.pharmacy_id;
    if (!pharmacyId) {
      res.status(403).json({ error: 'Pharmacy association required' });
      return;
    }

    const status = (req.query.status as string) || '';

    let sql = `
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        m.name as medicine_name,
        m.strength,
        m.dosage_form,
        m.requires_prescription
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN medicines m ON r.medicine_id = m.id
      WHERE r.pharmacy_id = ?
    `;
    const params: any[] = [pharmacyId];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY CASE r.status WHEN \'PENDING\' THEN 1 WHEN \'CONFIRMED\' THEN 2 WHEN \'READY_FOR_PICKUP\' THEN 3 ELSE 4 END, r.created_at DESC';

    const reservations = db.prepare(sql).all(...params);

    const counts = {
      pending: reservations.filter((r: any) => r.status === 'PENDING').length,
      ready: reservations.filter((r: any) => r.status === 'READY_FOR_PICKUP').length,
      confirmed: reservations.filter((r: any) => r.status === 'CONFIRMED').length,
      completed: reservations.filter((r: any) => r.status === 'COMPLETED').length
    };

    res.json({ counts, reservations });
  } catch (error: any) {
    console.error('Get pharmacy reservations error:', error);
    res.status(500).json({ error: 'Failed to retrieve pharmacy reservations' });
  }
}

/**
 * Update reservation status (Accept, Reject, Ready for Pickup, Complete)
 */
export function updateReservationStatus(req: AuthRequest, res: Response): void {
  try {
    const id = req.params.id as string;
    const { status, rejection_reason } = req.body;
    const userRole = req.user?.role;
    const pharmacyId = req.user?.pharmacy_id;

    const allowedStatuses = ['CONFIRMED', 'REJECTED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
      return;
    }

    const reservation = db.prepare(`
      SELECT r.*, m.name as medicine_name, p.name as pharmacy_name 
      FROM reservations r
      JOIN medicines m ON r.medicine_id = m.id
      JOIN pharmacies p ON r.pharmacy_id = p.id
      WHERE r.id = ?
    `).get(id) as any;

    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    // Permission check: Pharmacy can manage their own reservations; User can only cancel their own pending reservation
    if (userRole === 'user') {
      if (reservation.user_id !== req.user?.id) {
        res.status(403).json({ error: 'Unauthorized to modify this reservation' });
        return;
      }
      if (status !== 'CANCELLED') {
        res.status(403).json({ error: 'Users may only cancel their own reservations' });
        return;
      }
    } else if (userRole === 'pharmacy') {
      if (reservation.pharmacy_id !== pharmacyId) {
        res.status(403).json({ error: 'This reservation does not belong to your pharmacy' });
        return;
      }
    }

    // If reservation is being cancelled or rejected, return stock back to inventory
    if ((status === 'REJECTED' || status === 'CANCELLED') && reservation.status !== 'REJECTED' && reservation.status !== 'CANCELLED') {
      const inv = db.prepare('SELECT * FROM inventory WHERE pharmacy_id = ? AND medicine_id = ?').get(
        reservation.pharmacy_id,
        reservation.medicine_id
      ) as any;

      if (inv) {
        const restoredQty = inv.quantity + reservation.quantity;
        const restoredStatus = calculateStockStatus(restoredQty, inv.low_stock_threshold);
        db.prepare('UPDATE inventory SET quantity = ?, availability_status = ? WHERE id = ?').run(
          restoredQty,
          restoredStatus,
          inv.id
        );
      }
    }

    db.prepare(`
      UPDATE reservations 
      SET status = ?, rejection_reason = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, rejection_reason || null, id);

    // Notify the user about the status update
    notifyReservationStatusChange(
      reservation.user_id,
      reservation.reservation_code,
      reservation.medicine_name,
      reservation.pharmacy_name,
      status,
      rejection_reason
    );

    res.json({
      message: `Reservation status updated to ${status}`,
      reservation: {
        id,
        status,
        rejection_reason: rejection_reason || null
      }
    });
  } catch (error: any) {
    console.error('Update reservation status error:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
}
