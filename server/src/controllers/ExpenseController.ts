import { Request, Response } from 'express';

import Expense from '@server/models/Expense';
import User from '@server/models/User';
import { BaseController } from '@server/controllers/BaseController';
import { broadcast } from '@server/plugins/io/clientNamespace';

class ExpenseController extends BaseController {
  async createExpense(req: Request, res: Response) {
    try {
      const {
        description, amount, category, date, recurring, recurrenceType, recurrenceEndDate, customRecurrenceDays
      } = req.body;
      const user = req?.user as User;

      const expense = await Expense.create({
        description:          description || '',
        amount:               amount || 0,
        category:             category || '',
        date:                 date || null,
        recurring:            recurring || false,
        recurrenceType:       recurrenceType || null,
        recurrenceEndDate:    recurrenceEndDate || null,
        customRecurrenceDays: customRecurrenceDays || null,
        userID:               user?.id
      });

      broadcast('new_expense', { data: expense });
      res.status(201).json(expense);
    } catch(error) {
      this.handleError(res, (error as Error), 'Error creating expense');
    }
  }

  async getExpenses(req: Request, res: Response) {
    try {
      const user = req?.user as User;

      const expenses = await Expense.findAll({ where: { userID: user?.id } });

      res.status(200).json(expenses);
    } catch(error) {
      this.handleError(res, (error as Error), 'Error getting expenses');
    }
  }

  async updateExpense(req: Request, res: Response) {
    try {
      const {
        description, amount, category, date, recurring, recurrenceType, recurrenceEndDate, customRecurrenceDays
      } = req.body;
      const { id } = req.params;
      const user = req?.user as User;

      const expense = await Expense.findOne({
        where: {
          id,
          userID: user?.id
        }
      });

      if (expense) {
        expense.description = description || '';
        expense.amount = amount || 0;
        expense.category = category || '';
        expense.date = date || null;
        expense.recurring = recurring || false;
        expense.recurrenceType = recurrenceType || null;
        expense.recurrenceEndDate = recurrenceEndDate || null;
        expense.customRecurrenceDays = customRecurrenceDays || null;

        await expense.save();

        broadcast('update_expense', { data: expense });
        res.status(200).json(expense);
      } else {
        res.status(404).json({ error: 'Expense not found' });
      }
    } catch(error) {
      this.handleError(res, (error as Error), 'Error updating expense');
    }
  }

  async deleteExpense(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req?.user as User;

      await Expense.destroy({
        where: {
          id,
          userID: user?.id
        }
      });

      res.status(204).send();
    } catch(error) {
      this.handleError(res, (error as Error), 'Error deleting expense');
    }
  }
}

export default new ExpenseController();
