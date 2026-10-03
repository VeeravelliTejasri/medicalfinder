import { Router } from 'express';
import { 
  createReservation, 
  getUserReservations, 
  getPharmacyReservations, 
  updateReservationStatus 
} from '../controllers/reservationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Patient endpoints
router.post('/', createReservation);
router.get('/my', getUserReservations);

// Pharmacy requests queue
router.get('/pharmacy', getPharmacyReservations);

// Update status (Accept, Reject, Ready for pickup, Cancel)
router.patch('/:id/status', updateReservationStatus);

export default router;
