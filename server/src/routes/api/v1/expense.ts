import { Router } from 'express';

import ExpenseController from '@server/controllers/ExpenseController';
import { isAuthenticated } from '@server/middleware/auth';
import { validateExpense } from '@server/middleware/validation';

const router = Router();

router.get('/', isAuthenticated, ExpenseController.getExpenses.bind(ExpenseController));
router.post('/', isAuthenticated, validateExpense, ExpenseController.createExpense.bind(ExpenseController));
router.put('/:id', isAuthenticated, validateExpense, ExpenseController.updateExpense.bind(ExpenseController));
router.delete('/:id', isAuthenticated, ExpenseController.deleteExpense.bind(ExpenseController));

export default router;
