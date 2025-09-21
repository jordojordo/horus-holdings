import { Router } from 'express';

import FinancialItemController from '@server/controllers/FinancialItemController';
import { isAuthenticated } from '@server/middleware/auth';
import { validateIncomeCreate, validateIncomeUpdate } from '@server/middleware/validation';

const router = Router();

router.get('/', isAuthenticated, FinancialItemController.getItems.bind(FinancialItemController));
router.post('/', isAuthenticated, validateIncomeCreate, FinancialItemController.createItem.bind(FinancialItemController));
router.put('/:id', isAuthenticated, validateIncomeUpdate, FinancialItemController.updateItem.bind(FinancialItemController));
router.delete('/:id', isAuthenticated, FinancialItemController.deleteItem.bind(FinancialItemController));

export default router;
