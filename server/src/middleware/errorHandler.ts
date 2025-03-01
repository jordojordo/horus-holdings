import { Request, Response } from 'express';

import logger from '@server/config/logger';

const errorHandler = (err: Error, req: Request, res: Response) => {
  logger.error(err.message, {
    stack:   err.stack,
    request: req
  });
  res.status(500).json({ message: 'Internal Server Error' });
};

export default errorHandler;
