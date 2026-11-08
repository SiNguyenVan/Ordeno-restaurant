const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

// POST /api/auth/login - Đăng nhập tài khoản quản trị
router.post('/login', AuthController.login);

// GET /api/auth/me - Lấy thông tin tài khoản hiện tại (yêu cầu Bearer Token)
router.get('/me', authMiddleware, AuthController.getProfile);

// POST /api/auth/logout - Đăng xuất tài khoản
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
