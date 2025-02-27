import express, { Request, Response }  from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User';

const router = express.Router();

router.post('/register', async(req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    console.log('username:', username);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword
    });

    res.status(201).json(user);
  } catch (error: Error | any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Username is unavailable. Please choose a different username.' });
    } else {
      res.status(500).json({
        message: 'An unexpected error occurred.',
        error
      });
    }
  }
});

router.post('/login', passport.authenticate('local'), (req: Request, res: Response) => {
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: 'JWT_SECRET not set' });

    return;
  }

  try {
    const token = jwt.sign({ user: req?.user }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
    });

    res.json(req.user);
  } catch (error) {
    res.status(500).json({
      message: 'An unexpected error occurred.',
      error
    });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  req.logout({}, () => {});
  res.status(200).send('Logged out');
});

router.get('/user', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).send('Unauthorized');
  }
});

router.put('/update', async(req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).send('Unauthorized');

    return;
  }

  const { username, newPassword } = req.body;
  const user = req.user as User;

  try {
    if (username) {
      user.username = username;
    }
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json(user);
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Username is unavailable. Please choose a different username.' });
    } else {
      res.status(500).json({
        message: 'An unexpected error occurred',
        error
      });
    }
  }
});

router.delete('/delete', async(req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).send('Unauthorized');

    return;
  }

  const user = req.user as User;

  try {
    await user.destroy();

    res.status(200).send('User deleted');
  } catch (error: any) {
    res.status(500).json({
      message: 'An unexpected error occurred',
      error
    });
  }
});

export default router;
