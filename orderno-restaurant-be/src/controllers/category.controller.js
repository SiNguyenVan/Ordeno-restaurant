const CategoryService = require('../services/Category.service');

const CategoryController = {
    /**
     * GET /api/categories
     * Lấy danh sách category và tổng số món thuộc category đó
     */
    getAllCategories: async (req, res, next) => {
        try {
            const categories = await CategoryService.getAllCategories();
            res.status(200).json({
                success: true,
                count: categories.length,
                data: categories,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/categories/:id
     * Lấy chi tiết category theo ID hoặc Slug
     */
    getCategoryById: async (req, res, next) => {
        try {
            const category = await CategoryService.getCategoryById(req.params.id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy danh mục',
                });
            }
            res.status(200).json({
                success: true,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/categories
     */
    createCategory: async (req, res, next) => {
        try {
            const category = await CategoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                message: `Đã tạo danh mục "${category.name}" thành công`,
                data: category,
            });
        } catch (error) {
            res.status(error.status || 400).json({
                success: false,
                message: error.message || 'Lỗi tạo danh mục',
            });
        }
    },

    /**
     * PUT /api/categories/:id
     */
    updateCategory: async (req, res, next) => {
        try {
            const updated = await CategoryService.updateCategory(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: `Đã cập nhật danh mục "${updated.name}" thành công`,
                data: updated,
            });
        } catch (error) {
            res.status(error.status || 400).json({
                success: false,
                message: error.message || 'Lỗi cập nhật danh mục',
            });
        }
    },

    /**
     * DELETE /api/categories/:id
     */
    deleteCategory: async (req, res, next) => {
        try {
            const result = await CategoryService.deleteCategory(req.params.id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            res.status(error.status || 400).json({
                success: false,
                message: error.message || 'Lỗi xóa danh mục',
            });
        }
    },
};

module.exports = CategoryController;
