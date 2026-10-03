import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateStockStatus } from '../config/thresholds.js';
import { checkAndTriggerStockAlerts } from '../services/notificationService.js';

/**
 * Get inventory for the currently logged in pharmacy
 */
export function getMyInventory(req: AuthRequest, res: Response): void {
  try {
    const pharmacyId = req.user?.pharmacy_id;
    if (!pharmacyId) {
      res.status(403).json({ error: 'User is not associated with a registered pharmacy' });
      return;
    }

    const search = ((req.query.q as string) || '').trim();
    const status = (req.query.status as string) || '';

    let sql = `
      SELECT 
        i.id,
        i.pharmacy_id,
        i.medicine_id,
        i.quantity,
        i.price,
        i.availability_status,
        i.low_stock_threshold,
        i.last_updated,
        m.name as medicine_name,
        m.generic_name,
        m.brand_name,
        m.category,
        m.strength,
        m.dosage_form,
        m.requires_prescription,
        m.is_emergency
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.id
      WHERE i.pharmacy_id = ?
    `;
    const params: any[] = [pharmacyId];

    if (search) {
      sql += ' AND (m.name LIKE ? OR m.generic_name LIKE ? OR m.brand_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (status) {
      sql += ' AND i.availability_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY i.availability_status ASC, m.name ASC';

    const items = db.prepare(sql).all(...params);

    const summary = {
      total: items.length,
      in_stock: items.filter((i: any) => i.availability_status === 'IN_STOCK').length,
      low_stock: items.filter((i: any) => i.availability_status === 'LOW_STOCK').length,
      out_of_stock: items.filter((i: any) => i.availability_status === 'OUT_OF_STOCK').length
    };

    res.json({ summary, inventory: items });
  } catch (error: any) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to retrieve inventory' });
  }
}

/**
 * Update stock quantity or price for an inventory item.
 * Automatically recalculates availability_status and triggers stock alerts if restocked!
 */
export function updateInventoryItem(req: AuthRequest, res: Response): void {
  try {
    const pharmacyId = req.user?.pharmacy_id;
    const id = req.params.id as string;
    const { quantity, price, low_stock_threshold } = req.body;

    if (!pharmacyId) {
      res.status(403).json({ error: 'Pharmacy association required' });
      return;
    }

    const existing = db.prepare('SELECT * FROM inventory WHERE id = ? AND pharmacy_id = ?').get(id, pharmacyId) as any;
    if (!existing) {
      res.status(404).json({ error: 'Inventory item not found for your pharmacy' });
      return;
    }

    const newQty = quantity !== undefined ? parseInt(quantity, 10) : existing.quantity;
    const newPrice = price !== undefined ? parseFloat(price) : existing.price;
    const newThreshold = low_stock_threshold !== undefined ? parseInt(low_stock_threshold, 10) : existing.low_stock_threshold;
    const newStatus = calculateStockStatus(newQty, newThreshold);

    db.prepare(`
      UPDATE inventory 
      SET quantity = ?, price = ?, availability_status = ?, low_stock_threshold = ?, last_updated = datetime('now')
      WHERE id = ?
    `).run(newQty, newPrice, newStatus, newThreshold, id);

    // If restocked from 0 to >0, fire stock alert notifications to waiting patients!
    let alertsTriggered = 0;
    if (existing.quantity === 0 && newQty > 0) {
      alertsTriggered = checkAndTriggerStockAlerts(pharmacyId, existing.medicine_id, newQty);
    }

    res.json({
      message: 'Inventory updated successfully',
      item: {
        id,
        quantity: newQty,
        price: newPrice,
        availability_status: newStatus,
        alerts_triggered: alertsTriggered
      }
    });
  } catch (error: any) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
}

/**
 * Add a new medicine to pharmacy inventory
 */
export function addMedicineToInventory(req: AuthRequest, res: Response): void {
  try {
    const pharmacyId = req.user?.pharmacy_id;
    const { medicine_id, quantity = 20, price, low_stock_threshold = 10 } = req.body;

    if (!pharmacyId) {
      res.status(403).json({ error: 'Pharmacy association required' });
      return;
    }

    if (!medicine_id || price === undefined) {
      res.status(400).json({ error: 'medicine_id and price are required' });
      return;
    }

    const med = db.prepare('SELECT id, name FROM medicines WHERE id = ?').get(medicine_id);
    if (!med) {
      res.status(404).json({ error: 'Medicine does not exist in master catalog' });
      return;
    }

    const existing = db.prepare('SELECT id FROM inventory WHERE pharmacy_id = ? AND medicine_id = ?').get(pharmacyId, medicine_id);
    if (existing) {
      res.status(409).json({ error: 'Medicine is already in your inventory. Update its stock quantity instead.' });
      return;
    }

    const id = uuidv4();
    const qty = parseInt(quantity, 10);
    const status = calculateStockStatus(qty, low_stock_threshold);

    db.prepare(`
      INSERT INTO inventory (id, pharmacy_id, medicine_id, quantity, price, availability_status, low_stock_threshold, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, pharmacyId, medicine_id, qty, parseFloat(price), status, low_stock_threshold);

    res.status(201).json({
      message: 'Medicine added to inventory',
      id,
      availability_status: status
    });
  } catch (error: any) {
    console.error('Add inventory error:', error);
    res.status(500).json({ error: 'Failed to add medicine to inventory' });
  }
}
