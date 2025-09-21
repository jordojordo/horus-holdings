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

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });

    return;
  }

  next();
};

const recurrenceSchema = Joi.object({
  recurrenceKind:    Joi.string().valid('none', 'simple', 'rrule').required(),
  rrule:             Joi.string().allow('', null),
  anchorDate:        Joi.string().isoDate().allow(null),
  endDate:           Joi.string().isoDate().allow(null),
  count:             Joi.number().integer().min(1).allow(null),
  timezone:          Joi.string().max(64).allow(null),
  weekendAdjustment: Joi.string().valid('none', 'next', 'prev', 'nearest').default('none'),
  includeDates:      Joi.array().items(Joi.string().isoDate()).default([]),
  excludeDates:      Joi.array().items(Joi.string().isoDate()).default([]),

  simple: Joi.any().optional(),
}).required();

const descriptionSchema = Joi.string()
  .max(255)
  .required()
  .messages({
    'string.max':   'Description must be less than or equal to 255 characters.',
    'any.required': 'Description is required.',
  });

const amountSchema = Joi.number()
  .precision(2)
  .greater(0)
  .required()
  .messages({
    'number.base':    'Amount must be a number.',
    'number.greater': 'Amount must be greater than 0.',
    'any.required':   'Amount is required.',
  });

const categorySchema = Joi.string().allow(null, '').max(255);

const dateSchema = Joi.string().isoDate().allow(null);

/**
 * Cross-field rule enforcement for create:
 * - one-off => date required
 * - recurring => anchorDate required, rrule required when kind==='rrule'
 */
function enforceCreateCrossRules<T extends { date?: string | null; recurrence: any }>(
  value: T,
  helpers: Joi.CustomHelpers
) {
  const kind = value?.recurrence?.recurrenceKind ?? 'none';

  if (kind === 'none') {
    if (!value.date) {
      return helpers.message({ custom: 'date is required when recurrenceKind is "none".' });
    }

    return value;
  }

  // recurring
  if (!value.recurrence?.anchorDate) {
    return helpers.message({ custom: 'recurrence.anchorDate is required when recurrenceKind is not "none".' });
  }

  if (kind === 'rrule') {
    const r = value.recurrence?.rrule;

    if (!r || (typeof r === 'string' && r.trim().length === 0)) {
      return helpers.message({ custom: 'recurrence.rrule is required when recurrenceKind is "rrule".' });
    }
  }

  return value;
}

/**
 * Cross-field rule enforcement for update:
 * - Only enforce if the related fields are present (partial updates allowed)
 */
function enforceUpdateCrossRules<T extends { date?: string | null; recurrence?: any }>(
  value: T,
  helpers: Joi.CustomHelpers
) {
  const kind = value?.recurrence?.recurrenceKind;

  if (kind === 'none') {
    // If user explicitly switches to 'none', ensure date present in payload or at least not explicitly removed
    if (value.date === undefined) return value; // let controller keep existing date
    if (!value.date) {
      return helpers.error('any.custom', { message: 'date is required when recurrenceKind is "none".' });
    }

    return value;
  }

  if (kind && kind !== 'none') {
    // If switching to or updating a recurring item, require anchorDate when recurrence present
    const hasRecurrence = typeof value.recurrence === 'object' && value.recurrence !== null;

    if (hasRecurrence && value.recurrence.anchorDate === undefined) {
      // allow controller to keep existing anchorDate if not provided
      return value;
    }
    if (hasRecurrence && !value.recurrence.anchorDate) {
      return helpers.error('any.custom', { message: 'recurrence.anchorDate is required when recurrenceKind is not "none".' });
    }
    if (kind === 'rrule') {
      const r = value.recurrence?.rrule;

      if (r !== undefined && (!r || (typeof r === 'string' && r.trim().length === 0))) {
        return helpers.error('any.custom', { message: 'recurrence.rrule is required when recurrenceKind is "rrule".' });
      }
    }
  }

  return value;
}

const incomeCreateSchema = Joi.object({
  description: descriptionSchema,
  amount:      amountSchema,
  category:    categorySchema,
  date:        dateSchema,
  recurrence:  recurrenceSchema,
}).custom(enforceCreateCrossRules);

const expenseCreateSchema = Joi.object({
  description: descriptionSchema,
  amount:      amountSchema,
  category:    categorySchema,
  date:        dateSchema,
  recurrence:  recurrenceSchema,
}).custom(enforceCreateCrossRules);

const recurrenceUpdateSchema = recurrenceSchema.fork(
  ['recurrenceKind', 'rrule', 'anchorDate', 'endDate', 'count', 'timezone', 'weekendAdjustment', 'includeDates', 'excludeDates', 'simple'],
  (s) => s.optional()
);

const incomeUpdateSchema = Joi.object({
  description: descriptionSchema.optional(),
  amount:      amountSchema.optional(),
  category:    categorySchema.optional(),
  date:        dateSchema.optional(),
  recurrence:  recurrenceUpdateSchema.optional(),
}).custom(enforceUpdateCrossRules);

const expenseUpdateSchema = Joi.object({
  description: descriptionSchema.optional(),
  amount:      amountSchema.optional(),
  category:    categorySchema.optional(),
  date:        dateSchema.optional(),
  recurrence:  recurrenceUpdateSchema.optional(),
}).custom(enforceUpdateCrossRules);

function replyBadRequest(res: Response, error: Joi.ValidationError) {
  const detail = (error?.details?.[0]?.message ?? 'Validation error').replace(/^"(.+?)"\s+/, '');

  res.status(400).json({ error: detail });
}

export const validateIncomeCreate = (req: Request, res: Response, next: NextFunction) => {
  const { error } = incomeCreateSchema.validate(req.body, { abortEarly: true, allowUnknown: true });

  if (error) {
    return replyBadRequest(res, error);
  }

  next();
};

export const validateIncomeUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { error } = incomeUpdateSchema.validate(req.body, { abortEarly: true, allowUnknown: true });

  if (error) {
    return replyBadRequest(res, error);
  }

  next();
};

export const validateExpenseCreate = (req: Request, res: Response, next: NextFunction) => {
  const { error } = expenseCreateSchema.validate(req.body, { abortEarly: true, allowUnknown: true });

  if (error) {
    return replyBadRequest(res, error);
  }

  next();
};

export const validateExpenseUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { error } = expenseUpdateSchema.validate(req.body, { abortEarly: true, allowUnknown: true });

  if (error) {
    return replyBadRequest(res, error);
  }

  next();
};