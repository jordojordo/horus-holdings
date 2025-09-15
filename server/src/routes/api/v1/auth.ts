import { Router } from 'express';

import AuthController from '@server/controllers/AuthController';
import { validateUser } from '@server/middleware/validation';
import { authLimiter } from '@server/middleware/rateLimiter';
import { isAuthenticated } from '@server/middleware/auth';
import passport from '@server/config/passport';
import User from '@server/models/User';

const router = Router();

router.post('/register', validateUser, authLimiter, AuthController.register.bind(AuthController));

router.post('/login', authLimiter, (req, res, next) => {
  passport.authenticate('local', { session: false }, (err: unknown, user: User, info: { message: string }) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }

    req.user = user;

    return AuthController.login(req, res);
  })(req, res, next);
});

router.post('/logout', AuthController.logout.bind(AuthController));
router.get('/user', isAuthenticated, AuthController.getUser.bind(AuthController));
router.put('/update', validateUser, isAuthenticated, AuthController.updateUser.bind(AuthController));
router.delete('/delete', isAuthenticated, AuthController.deleteUser.bind(AuthController));

export default router;
