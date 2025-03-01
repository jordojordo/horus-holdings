import { Request, Response } from 'express';

import { getAuthenticatedUser } from '@server/utils/authentication';
import { handleError } from '@server/utils/errorHandler';

export class BaseController {
  protected async getUserID(req: Request): Promise<{ id: number } | undefined> {
    return getAuthenticatedUser(req);
  }

  protected handleError(res: Response, error: any, defaultMessage = 'An unexpected error occurred.') {
    console.error(error);

    return handleError(res, error, defaultMessage);
  }
}
