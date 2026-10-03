import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'STOCK_ALERT' | 'RESERVATION_UPDATE' | 'SYSTEM';
  metadata?: Record<string, any>;
}

export function createNotification(params: CreateNotificationParams): void {
  const id = uuidv4();
  const metaJson = params.metadata ? JSON.stringify(params.metadata) : null;
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, is_read, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))
  `).run(id, params.userId, params.title, params.message, params.type, metaJson);
}

/**
 * Triggers stock alert notifications when an out-of-stock item is restocked.
 */
export function checkAndTriggerStockAlerts(pharmacyId: string, medicineId: string, newQuantity: number): number {
  if (newQuantity <= 0) return 0;

  // Get pharmacy & medicine info
  const pharmacy = db.prepare('SELECT id, name FROM pharmacies WHERE id = ?').get(pharmacyId) as any;
  const medicine = db.prepare('SELECT id, name FROM medicines WHERE id = ?').get(medicineId) as any;

  if (!pharmacy || !medicine) return 0;

  // Find subscribers for this medicine (either at this specific pharmacy or any pharmacy)
  const subscribers = db.prepare(`
    SELECT sa.id as alert_id, sa.user_id 
    FROM stock_alerts sa
    WHERE sa.medicine_id = ? 
      AND (sa.pharmacy_id = ? OR sa.pharmacy_id IS NULL)
      AND sa.is_triggered = 0
  `).all(medicineId, pharmacyId) as any[];

  let triggeredCount = 0;
  for (const sub of subscribers) {
    createNotification({
      userId: sub.user_id,
      title: '🔔 Medicine Now Available!',
      message: `${medicine.name} is now back in stock at ${pharmacy.name}. Reserve your pack before it runs out.`,
      type: 'STOCK_ALERT',
      metadata: { pharmacyId, medicineId, medicineName: medicine.name, pharmacyName: pharmacy.name }
    });

    db.prepare('UPDATE stock_alerts SET is_triggered = 1 WHERE id = ?').run(sub.alert_id);
    triggeredCount++;
  }

  return triggeredCount;
}

/**
 * Sends notification on reservation status update
 */
export function notifyReservationStatusChange(
  userId: string,
  reservationCode: string,
  medicineName: string,
  pharmacyName: string,
  newStatus: string,
  reason?: string
): void {
  let title = 'Reservation Update';
  let message = `Your reservation #${reservationCode} for ${medicineName} status is now ${newStatus}.`;

  if (newStatus === 'CONFIRMED') {
    title = '✅ Reservation Confirmed!';
    message = `${pharmacyName} has confirmed your reservation for ${medicineName}. They are preparing your order.`;
  } else if (newStatus === 'READY_FOR_PICKUP') {
    title = '🎉 Ready for Pickup!';
    message = `Your medicine (${medicineName}) is packed and waiting at ${pharmacyName}. Please show reservation code #${reservationCode} at the counter.`;
  } else if (newStatus === 'REJECTED') {
    title = '❌ Reservation Declined';
    message = `${pharmacyName} could not fulfill reservation #${reservationCode}. ${reason ? 'Reason: ' + reason : ''}`;
  } else if (newStatus === 'COMPLETED') {
    title = '✨ Order Completed';
    message = `Thank you for picking up your medicine #${reservationCode} at ${pharmacyName}.`;
  }

  createNotification({
    userId,
    title,
    message,
    type: 'RESERVATION_UPDATE',
    metadata: { reservationCode, newStatus, pharmacyName, medicineName }
  });
}
