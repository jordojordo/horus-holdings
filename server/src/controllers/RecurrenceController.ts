import type { RecurrencePayload } from '@server/types/Recurrence';

import { Request, Response } from 'express';

import { BaseController } from '@server/controllers/BaseController';
import { expandOccurrences } from '@server/utils/recurrence';
import { toYMD } from '@server/utils/civilDate';

class RecurrenceController extends BaseController {
  async preview(req: Request, res: Response) {
    try {
      const payload = req.body?.payload as RecurrencePayload;
      // const tz = payload.timezone || 'America/New_York';

      const start = toYMD(new Date());
      const end   = toYMD(new Date(Date.now() + 1000*60*60*24*90)); // +90d

      const dates = expandOccurrences(payload, { start, end });

      res.json({ dates });
    } catch(error) {
      this.handleError(res, (error as Error), 'Failed to preview recurrence');
    }
  }
}

export default new RecurrenceController();
