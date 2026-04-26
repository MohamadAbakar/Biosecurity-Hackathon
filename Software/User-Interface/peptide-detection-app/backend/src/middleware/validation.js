const Joi = require('joi');

/**
 * Returns an Express middleware that validates req.body against a Joi schema.
 * On failure responds 422 with a structured errors array.
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      })),
    });
  }
  next();
};

/**
 * Returns an Express middleware that validates req.query against a Joi schema.
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Invalid query parameters',
      errors: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      })),
    });
  }
  req.query = value;
  next();
};

module.exports = { validate, validateQuery };
