import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import User from '@server/models/User';
import { handleError } from '@server/utils/errorHandler';
import { broadcast } from '@server/plugins/io/clientNamespace';

export const isAuthenticated = async(req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token undefined' });

    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { user: { id: number } };
    const user = await User.findByPk(decoded.user.id);

    if (!user) {
      res.status(401).json({ error: 'User not found' });

      return;
    }

    req.user = user;
    next();
  } catch(error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      broadcast('token_expired', { message: 'Your session has expired, please log in again.' });

      res.status(401).json({ error: 'Token expired' });

      return;
    } else {
      handleError(res, (error as Error), 'An unexpected error occurred.');
    }
  }
};
