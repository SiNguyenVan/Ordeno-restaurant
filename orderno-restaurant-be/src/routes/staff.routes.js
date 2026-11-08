const { Router } = require('express');
const StaffController = require('../controllers/staff.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const {
  createStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
} = require('../validations/staff.validation');

const router = Router();

// Tất cả các routes bên dưới đều yêu cầu xác thực Bearer Token
router.use(authMiddleware);

// GET /api/staff/stats - Thống kê số lượng nhân sự theo vai trò & trạng thái
router.get('/stats', StaffController.getStaffStats);

// GET /api/staff - Danh sách nhân sự kèm tìm kiếm và bộ lọc
router.get('/', roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MANAGER'), StaffController.getAllStaff);

// GET /api/staff/:id - Chi tiết một nhân sự
router.get('/:id', StaffController.getStaffById);

// POST /api/staff - Thêm nhân sự mới vào hệ thống (Validate bằng Zod)
router.post(
  '/',
  roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  validateBody(createStaffSchema),
  StaffController.createStaff
);

// PUT /api/staff/:id - Cập nhật thông tin nhân sự (Validate bằng Zod)
router.put(
  '/:id',
  roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  validateBody(updateStaffSchema),
  StaffController.updateStaff
);

// PATCH /api/staff/:id/status - Đổi trạng thái hoạt động (Active/Inactive) (Validate bằng Zod)
router.patch(
  '/:id/status',
  roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  validateBody(updateStaffStatusSchema),
  StaffController.updateStaffStatus
);

// DELETE /api/staff/:id - Xóa nhân sự (chỉ dành cho Super Admin & Admin)
router.delete('/:id', roleMiddleware('SUPER_ADMIN', 'ADMIN'), StaffController.deleteStaff);

module.exports = router;
