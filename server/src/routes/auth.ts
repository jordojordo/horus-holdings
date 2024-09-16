import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User';

const router = express.Router();

router.post('/register', async(req, res) => {
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
      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET not set' });
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
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  }
});

router.post('/logout', (req, res) => {
  req.logout({}, () => {});
  res.status(200).send('Logged out');
});

router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).send('Unauthorized');
  }
});

router.put('/update', async(req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized');
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
      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  }
});

router.delete('/delete', async(req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized');
  }

  const user = req.user as User;

  try {
    await user.destroy();

    res.status(200).send('User deleted');
  } catch (error: any) {
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  }
});

export default router;
