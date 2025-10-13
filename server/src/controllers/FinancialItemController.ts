import type { OrderItem, WhereOptions } from '@sequelize/core';

import { Request, Response } from 'express';
import { Op } from '@sequelize/core';

import Income from '@server/models/Income';
import Expense from '@server/models/Expense';
import User from '@server/models/User';
import { BaseController } from '@server/controllers/BaseController';
import { broadcast } from '@server/plugins/io/clientNamespace';
import { pickRecurrence } from '@server/utils/recurrence';
import { buildDateRangeWhere } from '@server/utils/dateRange';

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

      const user = req.user as User;
      const userID: string | undefined = user?.id;

      if (!userID) {
        res.status(401).json({ error: 'Unauthorized' });

        return;
      }

      const page     = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 15));

      const SORTABLE: Record<string, string> = {
        name:           'name',
        amount:         'amount',
        date:           'date',
        category:       'category',
        recurrenceKind: 'recurrenceKind',
        createdAt:      'createdAt',
        updatedAt:      'updatedAt',
      };

      const sortBy  = (req.query.sortBy as string) || 'createdAt';
      const sortCol = SORTABLE[sortBy] || 'createdAt';
      const sortDir = ((req.query.sort as string) || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      const order: OrderItem[] = [[sortCol, sortDir]];

      const q          = ((req.query.q as string) || '').trim();
      const recurrence = (req.query.recurrence as 'all' | 'recurring' | 'nonRecurring' | undefined) || 'all';
      const start      = (req.query.start as string) || undefined;
      const end        = (req.query.end as string) || undefined;

      const andClauses: WhereOptions[] = [
        { userID },
        buildDateRangeWhere(start, end),
      ];

      // Search query
      if (q) {
        andClauses.push({
          [Op.or]: [
            { name: { [Op.like]: `%${ q }%` } },
            { category: { [Op.like]: `%${ q }%` } },
          ],
        } as WhereOptions);
      }

      // Recurrence filter
      if (recurrence === 'recurring') {
        andClauses.push({ recurrenceKind: { [Op.ne]: 'none' } });
      } else if (recurrence === 'nonRecurring') {
        andClauses.push({ [Op.or]: [{ recurrenceKind: 'none' }, { recurrenceKind: null }] });
      }

      const where = { [Op.and]: andClauses };

      const { rows, count } = await Model.findAndCountAll({
        where,
        order,
        limit:  pageSize,
        offset: (page - 1) * pageSize,
      });

      res.json({
        items: rows, total: count, page, pageSize 
      });
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
        name:                 name || '',
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
