const {
  createStaffSchema,
  updateStaffSchema,
} = require('../validations/staff.validation');

/**
 * Validate thông tin nhân sự bằng Zod Schema
 * @param {Object} data - Dữ liệu cần validate
 * @param {boolean} isCreate - True nếu tạo mới, False nếu cập nhật
 */
function validateStaffData(data, isCreate = true) {
  const schema = isCreate ? createStaffSchema : updateStaffSchema;
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      isValid: false,
      data: null,
      errors: result.error.issues.map((issue) => issue.message),
      issues: result.error.issues,
    };
  }

  return {
    isValid: true,
    data: result.data,
    errors: [],
    issues: [],
  };
}

module.exports = {
  validateStaffData,
};
