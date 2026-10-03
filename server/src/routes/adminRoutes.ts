import { Router } from 'express';
import { 
  getPlatformStats, 
  getAnalytics, 
  getAdminPharmacies, 
  togglePharmacyVerification, 
  createMasterMedicine 
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/stats', getPlatformStats);
router.get('/analytics', getAnalytics);
router.get('/pharmacies', getAdminPharmacies);
router.patch('/pharmacies/:id/verify', togglePharmacyVerification);
router.post('/medicines', createMasterMedicine);

export default router;
