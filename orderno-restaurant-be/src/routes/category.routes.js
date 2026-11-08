const { Router } = require('express');
const CategoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = Router();
const adminRoles = roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF');

// GET /api/categories - Lấy danh sách category kèm tổng số món ăn (Public)
router.get('/', CategoryController.getAllCategories);

// GET /api/categories/:id - Lấy chi tiết category (Public)
router.get('/:id', CategoryController.getCategoryById);

// POST /api/categories - Tạo danh mục mới (Admin / Manager / Chef)
router.post('/', authMiddleware, adminRoles, CategoryController.createCategory);

// PUT /api/categories/:id - Sửa danh mục (Admin / Manager / Chef)
router.put('/:id', authMiddleware, adminRoles, CategoryController.updateCategory);

// DELETE /api/categories/:id - Xóa mềm danh mục (Admin / Manager)
router.delete('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MANAGER'), CategoryController.deleteCategory);

module.exports = router;
