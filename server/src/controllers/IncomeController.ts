import { Request, Response } from 'express';

import Income from '@server/models/Income';
import User from '@server/models/User';
import { BaseController } from '@server/controllers/BaseController';
import { broadcast } from '@server/plugins/io/clientNamespace';

class IncomeController extends BaseController {
  async createIncome(req: Request, res: Response) {
    try {
      const {
        description, amount, category, date, recurring, recurrenceType, recurrenceEndDate
      } = req.body;
      const user = req?.user as User;

      const income = await Income.create({
        description:       description || '',
        amount:            amount || 0,
        category:          category || '',
        date:              date || null,
        recurring:         recurring || false,
        recurrenceType:    recurrenceType || null,
        recurrenceEndDate: recurrenceEndDate || null,
        userID:            user?.id
      });

      broadcast('new_income', { data: income });
      res.status(201).json(income);
    } catch (error) {
      this.handleError(res, error, 'Error creating income');
    }
  }

  async getIncomes(req: Request, res: Response) {
    try {
      const user = req?.user as User;

      const incomes = await Income.findAll({ where: { userID: user?.id } });

      res.status(200).json(incomes);
    } catch (error) {
      this.handleError(res, error, 'Error getting incomes');
    }
  }

  async updateIncome(req: Request, res: Response) {
    try {
      const {
        description, amount, category, date, recurring, recurrenceType, recurrenceEndDate
      } = req.body;
      const { id } = req.params;
      const user = req?.user as User;

      const income = await Income.findOne({
        where: {
          id,
          userID: user?.id
        }
      });

      if (!income) {
        res.status(404).send();

        return;
      }

      await income.update({
        description:       description || '',
        amount:            amount || 0,
        category:          category || '',
        date:              date || null,
        recurring:         recurring || false,
        recurrenceType:    recurrenceType || null,
        recurrenceEndDate: recurrenceEndDate || null
      });

      broadcast('update_income', { data: income });
      res.status(200).json(income);
    } catch (error) {
      this.handleError(res, error, 'Error updating income');
    }
  }

  async deleteIncome(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req?.user as User;

      await Income.destroy({
        where: {
          id,
          userID: user?.id
        }
      });

      res.status(204).send();
    } catch (error) {
      this.handleError(res, error, 'Error deleting income');
    }
  }
}

export default new IncomeController();
