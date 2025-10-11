import { Op } from '@sequelize/core';

/**
 * Build a Sequelize "where" clause that limits items to those that can exist
 * within the [start, end] window.
 *
 * - One-off items:  date BETWEEN start AND end
 * - Recurring items: anchorDate <= end AND (endDate IS NULL OR endDate >= start)
 */
export const buildDateRangeWhere = (startISO: string, endISO: string) => {
  return {
    [Op.or]: [
      // One-off items (no recurrence)
      {
        recurrenceKind: 'none',
        date:           { [Op.between]: [startISO, endISO] },
      },
      // Recurring items — overlap their active window with [start, end]
      {
        recurrenceKind: { [Op.ne]: 'none' },
        [Op.and]:       [
          // If anchorDate is present, it must be <= end
          {
            [Op.or]: [
              { anchorDate: null },
              { anchorDate: { [Op.lte]: endISO } },
            ],
          },
          // If endDate is present, it must be >= start
          {
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: startISO } },
            ],
          },
        ],
      },
    ],
  };
};
