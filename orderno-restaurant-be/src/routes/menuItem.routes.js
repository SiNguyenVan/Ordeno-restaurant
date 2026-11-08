const { Router } = require('express');
const MenuItemController = require('../controllers/menuItem.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const {
    createMenuItemSchema,
    updateMenuItemSchema,
    updateAvailabilitySchema,
} = require('../validations/menuItem.validation');

const router = Router();

// ==================== CÁC ROUTE QUẢN TRỊ VIÊN (ADMIN) ====================
// Yêu cầu đăng nhập & vai trò: SUPER_ADMIN, ADMIN, MANAGER hoặc CHEF
const adminRoles = roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF');

// GET /api/menu-items/admin/stats - Thống kê thực đơn cho Admin
router.get('/admin/stats', authMiddleware, adminRoles, MenuItemController.getAdminStats);

// GET /api/menu-items/admin/list - Danh sách món ăn chi tiết cho Admin (kèm món hết hàng)
router.get('/admin/list', authMiddleware, adminRoles, MenuItemController.getAllMenuItemsAdmin);

// POST /api/menu-items - Thêm món ăn mới (Validate Zod + slugify)
router.post(
    '/',
    authMiddleware,
    adminRoles,
    validateBody(createMenuItemSchema),
    MenuItemController.createMenuItem
);

// PUT /api/menu-items/:id - Cập nhật món ăn (Validate Zod)
router.put(
    '/:id',
    authMiddleware,
    adminRoles,
    validateBody(updateMenuItemSchema),
    MenuItemController.updateMenuItem
);

// PATCH /api/menu-items/:id/availability - Bật/tắt nhanh tình trạng còn hàng / hết hàng
router.patch(
    '/:id/availability',
    authMiddleware,
    adminRoles,
    validateBody(updateAvailabilitySchema),
    MenuItemController.updateAvailability
);

// DELETE /api/menu-items/:id - Xóa mềm món ăn (is_deleted = 1)
router.delete(
    '/:id',
    authMiddleware,
    adminRoles,
    MenuItemController.deleteMenuItem
);


// ==================== CÁC ROUTE CÔNG KHAI (PUBLIC / KHÁCH HÀNG) ====================

// GET /api/menu-items/best-sellers - Top món ăn best seller
router.get('/best-sellers', MenuItemController.getTopBestSellers);

// GET /api/menu-items/search - Tìm kiếm và lọc món ăn
router.get('/search', MenuItemController.getAllMenuItems);

// GET & POST /api/menu-items/batch - Lấy chi tiết nhiều món ăn cùng lúc (dùng cho giỏ hàng)
router.post('/batch', MenuItemController.getMenuItemsBatch);
router.get('/batch', MenuItemController.getMenuItemsBatch);

// GET /api/menu-items/:id - Chi tiết một món ăn
router.get('/:id', MenuItemController.getMenuItemById);

// GET /api/menu-items - Danh sách món ăn kèm search / filter query params
router.get('/', MenuItemController.getAllMenuItems);

module.exports = router;
