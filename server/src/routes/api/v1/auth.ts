import { Router } from 'express';

import AuthController from '@server/controllers/AuthController';
import { validateUser } from '@server/middleware/validation';
import { authLimiter } from '@server/middleware/rateLimiter';
import { isAuthenticated } from '@server/middleware/auth';
import passport from '@server/config/passport';

const router = Router();

router.post('/register', validateUser, authLimiter, AuthController.register.bind(AuthController));
router.post('/login', authLimiter, passport.authenticate('local'), AuthController.login.bind(AuthController));
router.post('/logout', AuthController.logout.bind(AuthController));
router.get('/user', isAuthenticated, AuthController.getUser.bind(AuthController));
router.put('/update', validateUser, isAuthenticated, AuthController.updateUser.bind(AuthController));
router.delete('/delete', isAuthenticated, AuthController.deleteUser.bind(AuthController));

export default router;
