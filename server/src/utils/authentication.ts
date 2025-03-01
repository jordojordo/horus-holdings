import { Request } from 'express';

export const getAuthenticatedUser = (req: Request) => {
  return req.user as { id: number };
};

