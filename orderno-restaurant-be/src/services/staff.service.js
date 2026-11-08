const { UserRepository } = require('../repositories');
const { hashPassword } = require('../utils/auth.util');
const { validateStaffData } = require('../utils/staffValidation');

const StaffService = {
  getAllStaff: async (filters = {}) => {
    return UserRepository.getAllStaff(filters);
  },

  getStaffById: async (id) => {
    const staff = UserRepository.findById(id);
    if (!staff) {
      const err = new Error('Không tìm thấy nhân viên hoặc tài khoản đã bị xóa');
      err.status = 404;
      throw err;
    }
    return staff;
  },

  createStaff: async (data) => {
    // 1. Validate dữ liệu đầu vào
    const validation = validateStaffData(data, true);
    if (!validation.isValid) {
      const err = new Error(validation.errors[0] || 'Dữ liệu nhân sự không hợp lệ');
      err.status = 400;
      err.errors = validation.errors;
      throw err;
    }

    // 2. Kiểm tra trùng lặp username hoặc email (trong các tài khoản chưa bị xóa)
    const existing = UserRepository.checkExisting(data.username, data.email);
    if (existing) {
      const isUsernameDuplicate = existing.username.toLowerCase() === data.username.trim().toLowerCase();
      const err = new Error(
        isUsernameDuplicate
          ? `Tên đăng nhập "${data.username.trim()}" đã được sử dụng. Vui lòng chọn tên khác.`
          : `Địa chỉ email "${data.email.trim()}" đã tồn tại trong hệ thống.`
      );
      err.status = 409;
      throw err;
    }

    const rawPassword = data.password && data.password.trim() ? data.password.trim() : 'Staff@123';
    const password_hash = hashPassword(rawPassword);

    const created = UserRepository.createStaff({
      ...data,
      password_hash,
    });

    return created;
  },

  updateStaff: async (id, data) => {
    // 1. Kiểm tra tài khoản có tồn tại không
    const existing = UserRepository.findById(id);
    if (!existing) {
      const err = new Error('Không tìm thấy nhân sự để cập nhật');
      err.status = 404;
      throw err;
    }

    // 2. Validate dữ liệu cập nhật
    const validation = validateStaffData(data, false);
    if (!validation.isValid) {
      const err = new Error(validation.errors[0] || 'Dữ liệu cập nhật không hợp lệ');
      err.status = 400;
      err.errors = validation.errors;
      throw err;
    }

    // 3. Nếu có cập nhật email hoặc username, kiểm tra trùng lặp với người khác
    const checkUsername = data.username ? data.username.trim() : existing.username;
    const checkEmail = data.email ? data.email.trim() : existing.email;
    const duplicate = UserRepository.checkExisting(checkUsername, checkEmail, id);
    if (duplicate) {
      const isUsernameDuplicate = duplicate.username.toLowerCase() === checkUsername.toLowerCase();
      const err = new Error(
        isUsernameDuplicate
          ? `Tên đăng nhập "${checkUsername}" đã được người khác sử dụng.`
          : `Địa chỉ email "${checkEmail}" đã tồn tại trên tài khoản khác.`
      );
      err.status = 409;
      throw err;
    }

    const updatePayload = { ...data };
    if (data.password && data.password.trim()) {
      updatePayload.password_hash = hashPassword(data.password.trim());
    }

    const updated = UserRepository.updateStaff(id, updatePayload);
    return updated;
  },

  updateStaffStatus: async (id, status) => {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      const err = new Error('Trạng thái nhân sự không hợp lệ. Cho phép: ' + validStatuses.join(', '));
      err.status = 400;
      throw err;
    }

    const existing = UserRepository.findById(id);
    if (!existing) {
      const err = new Error('Không tìm thấy nhân viên');
      err.status = 404;
      throw err;
    }

    return UserRepository.updateStatus(id, status);
  },

  /**
   * XÓA MỀM (Soft delete): Đánh dấu is_deleted = 1
   */
  deleteStaff: async (id) => {
    const existing = UserRepository.findById(id);
    if (!existing) {
      const err = new Error('Không tìm thấy nhân viên cần xóa');
      err.status = 404;
      throw err;
    }

    if (existing.role === 'SUPER_ADMIN') {
      const err = new Error('Không thể xóa tài khoản Quản Trị Tối Cao (Super Admin)');
      err.status = 403;
      throw err;
    }

    UserRepository.deleteStaff(id);
    return { success: true, message: `Đã xóa tài khoản "${existing.full_name}" thành công` };
  },

  getStaffStats: async () => {
    return UserRepository.getStaffStats();
  },
};

module.exports = StaffService;
