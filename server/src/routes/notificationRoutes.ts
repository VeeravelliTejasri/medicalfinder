import { Router } from 'express';
import { getMyNotifications, markAsRead, subscribeStockAlert } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.post('/alerts/subscribe', subscribeStockAlert);

export default router;
