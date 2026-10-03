import { Router } from 'express';
import { register, login, getCurrentUser, getDemoAccounts } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/demo-accounts', getDemoAccounts);

export default router;
