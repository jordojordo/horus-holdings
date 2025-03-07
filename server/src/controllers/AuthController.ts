import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '@server/models/User';
import { BaseController } from '@server/controllers/BaseController';
import logger from '@server/config/logger';

class AuthController extends BaseController {
  async register(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        Username: username,
        Password: hashedPassword,
      });

      res.status(201).json(user);
    } catch (error: any) {
      this.handleError(res, error, 'Error registering user');
    }
  }

  async login(req: Request, res: Response) {
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: 'JWT_SECRET not set' });

      return;
    }

    try {
      const token = jwt.sign({ user: req?.user }, process.env.JWT_SECRET!, { expiresIn: '1d' });

      /**
       * TODO: Use self-signed certificate for HTTPS
       */
      res.cookie('token', token, {
        // If everything is from the same domain, we can do:
        httpOnly: true,
        sameSite: 'lax', // Or 'strict', or omit it entirely
        secure:   false, // Because we’re on HTTP
      });

      const user = req.user as User;

      res.json({
        id: user.id,
        token,
      });

      logger.info(`User ${ user.id } logged in`);
    } catch (error) {
      this.handleError(res, error, 'Error logging in');
    }
  }

  async logout(req: Request, res: Response) {
    req.logout({}, () => {});
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure:   false,
    }).json({ message: 'Logged out' });
  }

  async getUser(req: Request, res: Response) {
    if (req.user) {
      const user = req.user as User;

      res.json({ id: user.id });
    } else {
      res.status(401).send('Unauthorized');
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = req.user as User;
      const { username, password } = req.body;

      if (username) {
        user.Username = username;
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);

        user.Password = hashedPassword;
      }

      await user.save();

      res.json(user);
    } catch (error: any) {
      this.handleError(res, error, 'Error updating user');
    }
  }


  async deleteUser(req: Request, res: Response) {
    const user = req.user as User;

    try {
      await user.destroy();

      res.json({ message: 'User deleted' });
    } catch (error: any) {
      this.handleError(error, res, 'Error deleting user');
    }
  }
}

export default new AuthController();
