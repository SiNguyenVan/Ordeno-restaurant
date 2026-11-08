const { UserRepository } = require('../repositories');
const { verifyPassword, generateToken } = require('../utils/auth.util');

const AuthService = {
  /**
   * Đăng nhập người dùng bằng username hoặc email
   */
  login: async ({ username, password }) => {
    if (!username || !password) {
      const err = new Error('Vui lòng nhập tên đăng nhập và mật khẩu');
      err.status = 400;
      throw err;
    }

    const user = UserRepository.findByUsernameOrEmail(username);
    if (!user) {
      const err = new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
      err.status = 401;
      throw err;
    }

    if (user.status !== 'ACTIVE') {
      const err = new Error('Tài khoản của bạn đã bị vô hiệu hóa hoặc tạm khóa. Vui lòng liên hệ quản trị viên.');
      err.status = 403;
      throw err;
    }

    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
      err.status = 401;
      throw err;
    }

    // Cập nhật thời điểm đăng nhập
    UserRepository.updateLastLogin(user.id);

    // Tạo JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        salary: user.salary,
        hire_date: user.hire_date,
      },
    };
  },

  /**
   * Lấy profile hiện tại của người dùng
   */
  getProfile: async (userId) => {
    const user = UserRepository.findById(userId);
    if (!user) {
      const err = new Error('Không tìm thấy tài khoản người dùng');
      err.status = 404;
      throw err;
    }
    return user;
  },
};

module.exports = AuthService;
