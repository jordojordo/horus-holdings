import express, { Request, Response } from 'express';

import Expense from '../models/Expense';
import { isAuthenticated } from '../middleware/auth';
import { validateExpense } from '../middleware/validation';
import User from '../models/User';
import { broadcast } from '../index';

const router = express.Router();

router.post('/', isAuthenticated, validateExpense, async(req: Request, res: Response) => {
  try {
    const {
      description, amount, category, date, recurring, recurrenceType, recurrenceEndDate
    } = req.body;
    const user = req?.user as User;

    const expense = await Expense.create({
      description:       description || '',
      amount:            amount || 0,
      category:          category || '',
      date:              date || null,
      recurring:         recurring || false,
      recurrenceType:    recurrenceType || null,
      recurrenceEndDate: recurrenceEndDate || null,
      userId:            user?.id
    });

    broadcast({
      type: 'new_expense',
      data: expense
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get('/', isAuthenticated, async(req: Request, res: Response) => {
  try {
    const user = req?.user as User;

    const expenses = await Expense.findAll({ where: { userId: user?.id } });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/:id', isAuthenticated, async(req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req?.user as User;

    await Expense.destroy({
      where: {
        id,
        userId: user?.id
      }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put('/:id', isAuthenticated, validateExpense, async(req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req?.user as User;
    const {
      description, amount, category, date, recurring, recurrenceType, recurrenceEndDate
    } = req.body;

    const expense = await Expense.findOne({
      where: {
        id,
        userId: user?.id
      }
    });

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });

      return;
    }

    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.recurring = recurring || expense.recurring;
    expense.recurrenceType = recurrenceType || expense.recurrenceType;
    expense.recurrenceEndDate = recurrenceEndDate || expense.recurrenceEndDate;

    await expense.save();

    broadcast({
      type: 'update_expense',
      data: expense
    });

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
