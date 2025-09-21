import { Router } from 'express';

import RecurrenceController from '@server/controllers/RecurrenceController';
import { isAuthenticated } from '@server/middleware/auth';

const router = Router();

router.post('/preview', isAuthenticated, RecurrenceController.preview.bind(RecurrenceController));

export default router;
