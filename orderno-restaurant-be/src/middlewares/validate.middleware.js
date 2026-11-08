/**
 * Middleware validate request body bằng Zod Schema
 * @param {import('zod').ZodSchema} schema
 */
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const issues = result.error.issues;
    const firstMessage = issues[0]?.message || 'Dữ liệu không hợp lệ';

    return res.status(400).json({
      success: false,
      message: firstMessage,
      errors: issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // Gán dữ liệu đã được parse và validate vào req.body
  req.body = result.data;
  next();
};

/**
 * Middleware validate request query bằng Zod Schema
 * @param {import('zod').ZodSchema} schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const issues = result.error.issues;
    const firstMessage = issues[0]?.message || 'Tham số truy vấn không hợp lệ';

    return res.status(400).json({
      success: false,
      message: firstMessage,
      errors: issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  req.query = result.data;
  next();
};

module.exports = {
  validateBody,
  validateQuery,
  validate: validateBody,
};
