const MenuItemService = require('../services/MenuItem.service');

const MenuItemController = {
    getAllMenuItems: async (req, res, next) => {
        try {
            const { items, pagination } = await MenuItemService.getAllMenuItems(req.query);
            res.status(200).json({
                success: true,
                count: items.length,
                pagination,
                filters: req.query,
                data: items,
            });
        } catch (error) {
            next(error);
        }
    },

    getAllMenuItemsAdmin: async (req, res, next) => {
        try {
            const { items, pagination } = await MenuItemService.getAllMenuItemsAdmin(req.query);
            res.status(200).json({
                success: true,
                count: items.length,
                pagination,
                filters: req.query,
                data: items,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Lỗi lấy danh sách món ăn cho quản trị viên',
            });
        }
    },

    getAdminStats: async (req, res, next) => {
        try {
            const stats = await MenuItemService.getAdminStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Lỗi thống kê thực đơn',
            });
        }
    },

    getTopBestSellers: async (req, res, next) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
            const bestSellers = await MenuItemService.getTopBestSellers(limit);
            res.status(200).json({
                success: true,
                count: bestSellers.length,
                data: bestSellers,
            });
        } catch (error) {
            next(error);
        }
    },

    getMenuItemById: async (req, res, next) => {
        try {
            const menuItem = await MenuItemService.getMenuItemById(req.params.id);
            res.status(200).json({
                success: true,
                data: menuItem,
            });
        } catch (error) {
            res.status(error.status || 404).json({
                success: false,
                message: error.message || 'Không tìm thấy món ăn',
            });
        }
    },

    getMenuItemsBatch: async (req, res, next) => {
        try {
            let ids = [];
            if (Array.isArray(req.body?.ids)) {
                ids = req.body.ids;
            } else if (typeof req.query?.ids === 'string') {
                ids = req.query.ids.split(',').map((id) => id.trim());
            } else if (Array.isArray(req.query?.ids)) {
                ids = req.query.ids;
            }

            const items = await MenuItemService.getMenuItemsByIds(ids);
            res.status(200).json({
                success: true,
                count: items.length,
                data: items,
            });
        } catch (error) {
            next(error);
        }
    },

    createMenuItem: async (req, res, next) => {
        try {
            const newItem = await MenuItemService.createMenuItem(req.body);
            res.status(201).json({
                success: true,
                message: `Đã thêm món "${newItem.name}" vào thực đơn thành công`,
                data: newItem,
            });
        } catch (error) {
            res.status(error.status || 400).json({
                success: false,
                message: error.message || 'Lỗi tạo món ăn mới',
            });
        }
    },

    updateMenuItem: async (req, res, next) => {
        try {
            const updated = await MenuItemService.updateMenuItem(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: `Đã cập nhật món "${updated.name}" thành công`,
                data: updated,
            });
        } catch (error) {
            res.status(error.status || 400).json({
                success: false,
                message: error.message || 'Lỗi cập nhật món ăn',
            });
        }
    },

    updateAvailability: async (req, res, next) => {
        try {
            const { is_available } = req.body;
            const updated = await MenuItemService.updateAvailability(req.params.id, is_available);
            const statusText = updated.is_available ? 'Đang phục vụ' : 'Tạm hết món';
            res.status(200).json({
                success: true,
                message: `Đã chuyển món "${updated.name}" sang trạng thái "${statusText}"`,
                data: updated,
            });
        } catch (error) {
            res.status(error.status || 400).json({
                success: false,
                message: error.message || 'Lỗi đổi trạng thái phục vụ',
            });
        }
    },

    deleteMenuItem: async (req, res, next) => {
        try {
            const result = await MenuItemService.deleteMenuItem(req.params.id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            res.status(error.status || 400).json({
                success: false,
                message: error.message || 'Lỗi xóa món ăn',
            });
        }
    },
};

module.exports = MenuItemController;
