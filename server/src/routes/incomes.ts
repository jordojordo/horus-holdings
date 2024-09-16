import express from 'express';

import Income from '../models/Income';
import { isAuthenticated } from '../middleware/auth';
import { validateIncome } from '../middleware/validation';
import User from '../models/User';
import { broadcast } from '../index';

const router = express.Router();

router.post('/', isAuthenticated, validateIncome, async(req, res) => {
  try {
    const {
      description, amount, date, recurring, recurrenceType, recurrenceEndDate
    } = req.body;
    const user = req?.user as User;

    const income = await Income.create({
      description:       description || '',
      amount:            amount || 0,
      date:              date || null,
      recurring:         recurring || false,
      recurrenceType:    recurrenceType || null,
      recurrenceEndDate: recurrenceEndDate || null,
      userId:            user?.id
    });

    broadcast({
      type: 'new_income',
      data: income
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/', isAuthenticated, async(req, res) => {
  try {
    const user = req?.user as User;

    const incomes = await Income.findAll({ where: { userId: user?.id } });

    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.delete('/:id', isAuthenticated, async(req, res) => {
  try {
    const { id } = req.params;
    const user = req?.user as User;

    await Income.destroy({
      where: {
        id,
        userId: user?.id
      }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.put('/:id', isAuthenticated, validateIncome, async(req, res) => {
  try {
    const { id } = req.params;
    const user = req?.user as User;
    const {
      description, amount, date, recurring, recurrenceType, recurrenceEndDate
    } = req.body;

    const income = await Income.findOne({
      where: {
        id,
        userId: user?.id
      }
    });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    income.description = description || income.description;
    income.amount = amount || income.amount;
    income.date = date || income.date;
    income.recurring = recurring || income.recurring;
    income.recurrenceType = recurrenceType || income.recurrenceType;
    income.recurrenceEndDate = recurrenceEndDate || income.recurrenceEndDate;

    await income.save();

    broadcast({
      type: 'update_income',
      data: income
    });

    res.status(200).json(income);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
