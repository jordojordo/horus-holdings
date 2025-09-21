import { Router } from 'express';

import FinancialItemController from '@server/controllers/FinancialItemController';
import { isAuthenticated } from '@server/middleware/auth';
import { validateExpenseCreate, validateExpenseUpdate } from '@server/middleware/validation';

const router = Router();

router.get('/', isAuthenticated, FinancialItemController.getItems.bind(FinancialItemController));
router.post('/', isAuthenticated, validateExpenseCreate, FinancialItemController.createItem.bind(FinancialItemController));
router.put('/:id', isAuthenticated, validateExpenseUpdate, FinancialItemController.updateItem.bind(FinancialItemController));
router.delete('/:id', isAuthenticated, FinancialItemController.deleteItem.bind(FinancialItemController));

export default router;
