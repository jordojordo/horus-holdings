import Joi from 'joi';

class ValidationSchemas {
  public userSchema = Joi.object({
    id:       Joi.string(),
    username: Joi.string().max(255).required().messages({ 'string.max': 'Username must be less than or equal to 255 characters.' }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .required()
      .messages({ 'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' }),
  });

  public recurrenceSchema = Joi.object({
    recurrenceKind:    Joi.string().valid('none', 'simple', 'rrule').required(),
    rrule:             Joi.string().allow('', null),
    anchorDate:        Joi.string().isoDate().allow(null),
    endDate:           Joi.string().isoDate().allow(null),
    count:             Joi.number().integer().min(1).allow(null),
    timezone:          Joi.string().max(64).allow(null),
    weekendAdjustment: Joi.string().valid('none', 'next', 'prev', 'nearest').default('none'),
    includeDates:      Joi.array().items(Joi.string().isoDate()).default([]).allow(null),
    excludeDates:      Joi.array().items(Joi.string().isoDate()).default([]).allow(null),

    simple: Joi.any().optional(),
  }).required();

  public descriptionSchema = Joi.string()
    .max(255)
    .required()
    .messages({
      'string.max':   'Name must be less than or equal to 255 characters.',
      'any.required': 'Name is required.',
    });

  public amountSchema = Joi.number()
    .precision(2)
    .greater(0)
    .required()
    .messages({
      'number.base':    'Amount must be a number.',
      'number.greater': 'Amount must be greater than 0.',
      'any.required':   'Amount is required.',
    });

  public categorySchema = Joi.string().allow(null, '').max(255);

  public dateSchema = Joi.string().isoDate().allow(null);
}

export default new ValidationSchemas();
