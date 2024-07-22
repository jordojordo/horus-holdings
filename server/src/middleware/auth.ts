import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';

export const isAuthenticated = async(req: Request, res: Response, next: NextFunction) => {
  const token = req?.cookies?.token;

  if ( !token ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { user: { id: number } };
    const user = await User.findByPk( decoded.user.id);

    if ( !user ) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
