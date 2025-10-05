import type { RecurrencePayload } from '@server/types';

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

import ValidationSchemas from './schemas';

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { error } = ValidationSchemas.userSchema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });

    return;
  }

  next();
};

/**
 * Cross-field rule enforcement for create:
 * - one-off => date required
 * - recurring => anchorDate required, rrule required when kind==='rrule'
 */
function enforceCreateCrossRules<T extends { date?: string | null; recurrence: RecurrencePayload }>(
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
function enforceUpdateCrossRules<T extends { date?: string | null; recurrence?: RecurrencePayload }>(
  value: T,
  helpers: Joi.CustomHelpers
) {
  const kind = value?.recurrence?.recurrenceKind;

  if (kind === 'none') {
    // If user explicitly switches to 'none', ensure date present in payload or at least not explicitly removed
    if (value.date === undefined) {
      return value; // let controller keep existing date
    }
  
    if (!value.date) {
      return helpers.error('any.custom', { message: 'date is required when recurrenceKind is "none".' });
    }

    return value;
  }

  if (kind) {
    // If switching to or updating a recurring item, require anchorDate when recurrence present
    const hasRecurrence = typeof value.recurrence === 'object' && value.recurrence !== null;

    if (hasRecurrence && value.recurrence?.anchorDate === undefined) {
      // allow controller to keep existing anchorDate if not provided
      return value;
    }
    if (hasRecurrence && !value.recurrence?.anchorDate) {
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
  name:       ValidationSchemas.descriptionSchema,
  amount:      ValidationSchemas.amountSchema,
  category:    ValidationSchemas.categorySchema,
  date:        ValidationSchemas.dateSchema,
  recurrence:  ValidationSchemas.recurrenceSchema,
}).custom(enforceCreateCrossRules);

const expenseCreateSchema = Joi.object({
  name:       ValidationSchemas.descriptionSchema,
  amount:      ValidationSchemas.amountSchema,
  category:    ValidationSchemas.categorySchema,
  date:        ValidationSchemas.dateSchema,
  recurrence:  ValidationSchemas.recurrenceSchema,
}).custom(enforceCreateCrossRules);

const recurrenceUpdateSchema = ValidationSchemas.recurrenceSchema.fork(
  ['recurrenceKind', 'rrule', 'anchorDate', 'endDate', 'count', 'timezone', 'weekendAdjustment', 'includeDates', 'excludeDates', 'simple'],
  (s) => s.optional()
);

const incomeUpdateSchema = Joi.object({
  name:       ValidationSchemas.descriptionSchema.optional(),
  amount:      ValidationSchemas.amountSchema.optional(),
  category:    ValidationSchemas.categorySchema.optional(),
  date:        ValidationSchemas.dateSchema.optional(),
  recurrence:  recurrenceUpdateSchema.optional(),
}).custom(enforceUpdateCrossRules);

const expenseUpdateSchema = Joi.object({
  name:       ValidationSchemas.descriptionSchema.optional(),
  amount:      ValidationSchemas.amountSchema.optional(),
  category:    ValidationSchemas.categorySchema.optional(),
  date:        ValidationSchemas.dateSchema.optional(),
  recurrence:  recurrenceUpdateSchema.optional(),
}).custom(enforceUpdateCrossRules);

function replyBadRequest(res: Response, error: Joi.ValidationError) {
  console.log(' bad request: ', error);
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