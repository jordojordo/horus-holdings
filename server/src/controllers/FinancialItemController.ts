import { Request, Response } from 'express';

import Income from '@server/models/Income';
import Expense from '@server/models/Expense';
import User from '@server/models/User';
import { BaseController } from '@server/controllers/BaseController';
import { broadcast } from '@server/plugins/io/clientNamespace';
import { pickRecurrence } from '@server/utils/recurrence';

type Kind = 'income' | 'expense';

const MODEL_BY_KIND = {
  income:  Income,
  expense: Expense,
} as const;

// Infer kind of model based on the request route
// e.g. /income or /expense
function inferKind(req: Request): Kind {
  const inferred = req.baseUrl?.match(/\/(income|expense)\b/i);

  if (!inferred) {
    throw new Error('Could not determine kind from route.');
  }

  return inferred[1].toLowerCase() as Kind;
}

class FinancialItemController extends BaseController {
  async getItems(req: Request, res: Response) {
    try {
      const kind = inferKind(req);
      const Model = MODEL_BY_KIND[kind];
      const user = req?.user as User;

      const rows = await Model.findAll({
        where: { userID: user.id },
        order: [['createdAt', 'DESC']],
      });

      res.json(rows);
    } catch(error) {
      this.handleError(res, error as Error, 'Error fetching items');
    }
  }

  async createItem(req: Request, res: Response) {
    try {
      const kind = inferKind(req);
      const Model = MODEL_BY_KIND[kind];
      const user = req?.user as User;

      const {
        name, amount, category, date 
      } = req.body;

      const created = await Model.create({
        userID:               user?.id,
        name:          name || '',
        amount:               amount || 0,
        category:             category,
        date:                 date,
        ...pickRecurrence(req.body),
      });

      broadcast(`new_${ kind }`, { data: created });
      res.status(201).json({ data: created });
    } catch(error) {
      this.handleError(res, error as Error, 'Error creating item');
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const kind = inferKind(req);
      const Model = MODEL_BY_KIND[kind];
      const user = req?.user as User;
      const { id } = req.params;
      const {
        name, amount, category, date 
      } = req.body;

      const [count] = await Model.update({
        name,
        amount,
        category: category,
        date:     date,
        ...pickRecurrence(req.body),
      }, { where: { id, userID: user.id } });

      if (!count) {
        res.status(404).json({ error: `${ kind[0].toUpperCase() + kind.slice(1) } not found` });

        return;
      }

      const updated = await Model.findOne({ where: { id, userID: user.id } });

      broadcast(`update_${ kind }`, { data: updated });
      res.json({ data: updated });
    } catch(error) {
      this.handleError(res, error as Error, `Error updating ${ inferKind(req) }`);
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      const kind = inferKind(req);
      const Model = MODEL_BY_KIND[kind];
      const user = req?.user as User;
      const { id } = req.params;

      const deleted = await Model.destroy({ where: { id, userID: user?.id } });

      if (!deleted) {
        res.status(404).json({ error: `${ kind[0].toUpperCase() + kind.slice(1) } not found` });
        
        return;
      }

      broadcast(`delete_${ kind }`, { data: { id } });
      res.status(204).send();
    } catch(error) {
      this.handleError(res, error as Error, `Error deleting ${ inferKind(req) }`);
    }
  }
}

export default new FinancialItemController();
