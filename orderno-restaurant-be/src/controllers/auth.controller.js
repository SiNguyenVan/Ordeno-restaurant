const AuthService = require('../services/auth.service');

const AuthController = {
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const result = await AuthService.login({ username, password });
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Đăng nhập thất bại',
      });
    }
  },

  getProfile: async (req, res, next) => {
    try {
      const profile = await AuthService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Lỗi lấy thông tin tài khoản',
      });
    }
  },

  logout: async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  },
};

module.exports = AuthController;
