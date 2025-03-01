import { Router } from 'express';

import PreferenceController from '@server/controllers/PreferenceController';
import { isAuthenticated } from '@server/middleware/auth';

const router = Router();

router.get('/', isAuthenticated, PreferenceController.getAllPreference.bind(PreferenceController));
router.post('/', isAuthenticated, PreferenceController.createNewPreference.bind(PreferenceController));
router.get('/:id', isAuthenticated, PreferenceController.getByID.bind(PreferenceController));
router.put('/:id', isAuthenticated, PreferenceController.updateByID.bind(PreferenceController));
router.delete('/:id', isAuthenticated, PreferenceController.deleteByID.bind(PreferenceController));

export default router;
