import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const expenseSchema = Joi.object({
  id:                 Joi.number().positive(),
  description:        Joi.string().max(255).required(),
  amount:             Joi.number().positive().required(),
  category:           Joi.string().allow(null),
  date:               Joi.date().allow(null),
  recurring:          Joi.boolean(),
  recurrenceType:     Joi.string().allow(null),
  recurrenceEndDate:  Joi.date().allow(null),
  userId:             Joi.number().positive()
});

const incomeSchema = Joi.object({
  id:                 Joi.number().positive(),
  description:        Joi.string().max(255).required(),
  amount:             Joi.number().positive().required(),
  date:               Joi.date().allow(null),
  recurring:          Joi.boolean(),
  recurrenceType:     Joi.string().allow(null),
  recurrenceEndDate:  Joi.date().allow(null),
  userId:             Joi.number().positive()
});

export const validateExpense = (req: Request, res: Response, next: NextFunction) => {
  const { error } = expenseSchema.validate(req.body);

  if ( error ) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

export const validateIncome = (req: Request, res: Response, next: NextFunction) => {
  const { error } = incomeSchema.validate(req.body);

  if ( error ) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};