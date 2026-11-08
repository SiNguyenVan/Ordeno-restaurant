const { Router } = require('express');
const SpaceTypeController = require('../controllers/spaceType.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const {
  createSpaceTypeSchema,
  updateSpaceTypeSchema,
  updateSpaceStatusSchema,
} = require('../validations/space.validation');

const router = Router();

const adminRoles = roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MANAGER');

// ==================== ADMIN ROUTES ====================

// GET /api/space-types/admin/stats - Thống kê không gian & sức chứa
router.get('/admin/stats', authMiddleware, adminRoles, SpaceTypeController.getAdminStats);

// GET /api/space-types/admin/list - Danh sách loại phòng cho admin
router.get('/admin/list', authMiddleware, adminRoles, SpaceTypeController.getAdminList);

// POST /api/space-types - Tạo mới loại phòng
router.post(
  '/',
  authMiddleware,
  adminRoles,
  validateBody(createSpaceTypeSchema),
  SpaceTypeController.createSpaceType
);

// PUT /api/space-types/:id - Cập nhật loại phòng
router.put(
  '/:id',
  authMiddleware,
  adminRoles,
  validateBody(updateSpaceTypeSchema),
  SpaceTypeController.updateSpaceType
);

// PATCH /api/space-types/:id/status - Bật/tắt trạng thái nhận khách
router.patch(
  '/:id/status',
  authMiddleware,
  adminRoles,
  validateBody(updateSpaceStatusSchema),
  SpaceTypeController.updateStatus
);

// DELETE /api/space-types/:id - Xóa mềm loại phòng
router.delete(
  '/:id',
  authMiddleware,
  adminRoles,
  SpaceTypeController.deleteSpaceType
);

// ==================== PUBLIC ROUTES ====================

// GET /api/space-types - Danh sách loại phòng / không gian cho khách hàng
router.get('/', SpaceTypeController.getAllSpaceTypes);
router.get('/:id', SpaceTypeController.getSpaceTypeById);

module.exports = router;
