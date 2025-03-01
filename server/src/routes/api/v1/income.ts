import { Router } from 'express';

import IncomeController from '@server/controllers/IncomeController';
import { isAuthenticated } from '@server/middleware/auth';
import { validateIncome } from '@server/middleware/validation';

const router = Router();

router.get('/', isAuthenticated, IncomeController.getIncomes.bind(IncomeController));
router.post('/', isAuthenticated, validateIncome, IncomeController.createIncome.bind(IncomeController));
router.put('/:id', isAuthenticated, validateIncome, IncomeController.updateIncome.bind(IncomeController));
router.delete('/:id', isAuthenticated, IncomeController.deleteIncome.bind(IncomeController));

export default router;
