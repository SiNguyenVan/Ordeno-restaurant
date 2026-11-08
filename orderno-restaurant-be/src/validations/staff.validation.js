const { z } = require('zod');

const VN_PHONE_REGEX = /^(0[3|5|7|8|9])[0-9]{8}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

const STAFF_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'CHEF',
  'WAITER',
  'CASHIER',
];

const STAFF_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

// Schema tạo mới nhân sự
const createStaffSchema = z.object({
  full_name: z
    .string({ required_error: 'Họ và tên là bắt buộc' })
    .trim()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên tối đa 100 ký tự'),

  username: z
    .string({ required_error: 'Tên đăng nhập là bắt buộc' })
    .trim()
    .min(3, 'Tên đăng nhập phải có từ 3 đến 30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới')
    .max(30, 'Tên đăng nhập phải có từ 3 đến 30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới')
    .regex(
      USERNAME_REGEX,
      'Tên đăng nhập phải có từ 3 đến 30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới'
    ),

  email: z
    .string({ required_error: 'Địa chỉ email là bắt buộc' })
    .trim()
    .email('Địa chỉ email không đúng định dạng'),

  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || VN_PHONE_REGEX.test(val),
      'Số điện thoại không hợp lệ (yêu cầu số điện thoại Việt Nam 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)'
    ),

  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(6, 'Mật khẩu bắt buộc và phải có ít nhất 6 ký tự'),

  role: z.enum(STAFF_ROLES, {
    errorMap: () => ({
      message: `Vai trò không hợp lệ. Các vai trò được chấp nhận: ${STAFF_ROLES.join(', ')}`,
    }),
  }),

  salary: z
    .union([z.number(), z.string()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === '' ||
        val === null ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      'Mức lương phải là một số không âm'
    ),

  status: z
    .enum(STAFF_STATUSES, {
      errorMap: () => ({
        message: `Trạng thái tài khoản không hợp lệ. Các trạng thái: ${STAFF_STATUSES.join(', ')}`,
      }),
    })
    .optional()
    .default('ACTIVE'),

  avatar_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      'URL ảnh đại diện phải hợp lệ (bắt đầu bằng http:// hoặc https://)'
    ),
});

// Schema cập nhật nhân sự
const updateStaffSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên tối đa 100 ký tự')
    .optional(),

  username: z
    .string()
    .trim()
    .min(3, 'Tên đăng nhập phải có từ 3 đến 30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới')
    .max(30, 'Tên đăng nhập phải có từ 3 đến 30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới')
    .regex(
      USERNAME_REGEX,
      'Tên đăng nhập phải có từ 3 đến 30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới'
    )
    .optional(),

  email: z
    .string()
    .trim()
    .email('Địa chỉ email không đúng định dạng')
    .optional(),

  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || VN_PHONE_REGEX.test(val),
      'Số điện thoại không hợp lệ (yêu cầu số điện thoại Việt Nam 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)'
    ),

  password: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || val.length >= 6,
      'Mật khẩu mới phải có ít nhất 6 ký tự'
    ),

  role: z
    .enum(STAFF_ROLES, {
      errorMap: () => ({
        message: `Vai trò không hợp lệ. Các vai trò được chấp nhận: ${STAFF_ROLES.join(', ')}`,
      }),
    })
    .optional(),

  salary: z
    .union([z.number(), z.string()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === '' ||
        val === null ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      'Mức lương phải là một số không âm'
    ),

  status: z
    .enum(STAFF_STATUSES, {
      errorMap: () => ({
        message: `Trạng thái tài khoản không hợp lệ. Các trạng thái: ${STAFF_STATUSES.join(', ')}`,
      }),
    })
    .optional(),

  avatar_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      'URL ảnh đại diện phải hợp lệ (bắt đầu bằng http:// hoặc https://)'
    ),
});

// Schema cập nhật trạng thái nhân sự
const updateStaffStatusSchema = z.object({
  status: z.enum(STAFF_STATUSES, {
    errorMap: () => ({
      message: `Trạng thái tài khoản không hợp lệ. Các trạng thái: ${STAFF_STATUSES.join(', ')}`,
    }),
  }),
});

module.exports = {
  VN_PHONE_REGEX,
  USERNAME_REGEX,
  STAFF_ROLES,
  STAFF_STATUSES,
  createStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
};
