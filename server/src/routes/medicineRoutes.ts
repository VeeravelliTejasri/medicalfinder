import { Router } from 'express';
import { searchMedicines, getMedicineById, getMedicineAlternatives, getCategories } from '../controllers/medicineController.js';

const router = Router();

router.get('/search', searchMedicines);
router.get('/categories', getCategories);
router.get('/:id', getMedicineById);
router.get('/:id/alternatives', getMedicineAlternatives);

export default router;
