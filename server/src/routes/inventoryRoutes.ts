import { Router } from 'express';
import { getMyInventory, updateInventoryItem, addMedicineToInventory } from '../controllers/inventoryController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Pharmacy role required for all inventory operations
router.use(authenticateToken);
router.use(requireRole(['pharmacy', 'admin']));

router.get('/my', getMyInventory);
router.post('/add', addMedicineToInventory);
router.patch('/:id', updateInventoryItem);

export default router;
