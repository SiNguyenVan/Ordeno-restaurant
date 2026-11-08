const StaffService = require('../services/staff.service');

const StaffController = {
  getAllStaff: async (req, res, next) => {
    try {
      const { staff, pagination } = await StaffService.getAllStaff(req.query);
      res.status(200).json({
        success: true,
        count: staff.length,
        pagination,
        data: staff,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Lỗi lấy danh sách nhân viên',
      });
    }
  },

  getStaffStats: async (req, res, next) => {
    try {
      const stats = await StaffService.getStaffStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Lỗi thống kê nhân sự',
      });
    }
  },

  getStaffById: async (req, res, next) => {
    try {
      const staff = await StaffService.getStaffById(req.params.id);
      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      res.status(error.status || 404).json({
        success: false,
        message: error.message || 'Không tìm thấy nhân viên',
      });
    }
  },

  createStaff: async (req, res, next) => {
    try {
      const newStaff = await StaffService.createStaff(req.body);
      res.status(201).json({
        success: true,
        message: 'Thêm nhân viên mới thành công',
        data: newStaff,
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: error.message || 'Lỗi tạo nhân viên',
      });
    }
  },

  updateStaff: async (req, res, next) => {
    try {
      const updated = await StaffService.updateStaff(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin nhân viên thành công',
        data: updated,
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: error.message || 'Lỗi cập nhật nhân viên',
      });
    }
  },

  updateStaffStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      const updated = await StaffService.updateStaffStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái nhân viên thành công',
        data: updated,
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: error.message || 'Lỗi cập nhật trạng thái',
      });
    }
  },

  deleteStaff: async (req, res, next) => {
    try {
      const result = await StaffService.deleteStaff(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message || 'Đã xóa nhân viên thành công',
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: error.message || 'Lỗi xóa nhân viên',
      });
    }
  },
};

module.exports = StaffController;
