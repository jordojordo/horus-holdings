import type { RecurrencePayload, ExpandWindow } from '@server/types/Recurrence';

import { Request, Response } from 'express';

import { BaseController } from '@server/controllers/BaseController';
import { expandOccurrences } from '@server/utils/recurrence';

class RecurrenceController extends BaseController {
  async preview(req: Request, res: Response) {
    try {
      const payload = req.body?.payload as RecurrencePayload;
      const window  = (req.body?.window || {}) as Partial<ExpandWindow>;
      // const tz = payload.timezone || 'America/New_York';

      const today = new Date().toISOString().slice(0,10);
      const start = window.start || today;
      const end   = window.end   || new Date(Date.now() + 1000*60*60*24*90).toISOString().slice(0,10); // +90d

      const dates = expandOccurrences(payload, { start, end });

      res.json({ dates });
    } catch(error) {
      this.handleError(res, (error as Error), 'Failed to preview recurrence');
    }
  }
}

export default new RecurrenceController();
