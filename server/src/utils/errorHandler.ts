import { Response } from 'express';
import { UniqueConstraintError } from '@sequelize/core';

import logger from '@server/config/logger';

export const handleError = (res: Response, error: Error, defaultMessage = 'An unexpected error occurred.') => {
  let message;

  if (error instanceof UniqueConstraintError) {
    message = `[UniqueConstraintError] Request failed: ${ error.cause }.`;

    res.status(400).json({ error: `Request failed: ${ error.cause }. Please ensure all fields are unique.` });
  } else {
    message = error.message;
    res.status(500).json({ error: defaultMessage });
  }

  logger.error(`${ message }`);
};
