import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const userSchema = Joi.object({
  id:       Joi.string(),
  username: Joi.string().max(255).required().messages({ 'string.max': 'Username must be less than or equal to 255 characters.' }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .required()
    .messages({ 'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' }),
});

const financeSchema = Joi.object({
  id:                 Joi.string(),
  description:        Joi.string().max(255).required().messages({ 'string.max': 'Description must be less than or equal to 255 characters.' }),
  amount:             Joi.number().positive().required().messages({ 'number.positive': 'Amount must be a positive number.' }),
  date:               Joi.date().allow(null),
  category:           Joi.string().allow(null).max(255).messages({ 'string.max': 'Category must be less than or equal to 255 characters.' }),
  recurring:          Joi.boolean(),
  recurrenceType:     Joi.string().allow(null),
  recurrenceEndDate:  Joi.date().allow(null),
  userId:             Joi.number().positive()
});

export const validateExpense = (req: Request, res: Response, next: NextFunction) => {
  const { error } = financeSchema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });

    return;
  }

  next();
};

export const validateIncome = (req: Request, res: Response, next: NextFunction) => {
  const { error } = financeSchema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });

    return;
  }

  next();
};

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    console.log('# validateUser error', error);

    res.status(400).json({ error: error.details[0].message });

    return;
  }

  next();
};
