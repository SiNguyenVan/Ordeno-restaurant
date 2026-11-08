const { verifyToken } = require('../utils/auth.util');
const { UserRepository } = require('../repositories');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để truy cập tài nguyên này',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
    });
  }

  const user = UserRepository.findById(decoded.id);
  if (!user || user.status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản không tồn tại hoặc đã bị khóa',
    });
  }

  req.user = user;
  next();
};

module.exports = authMiddleware;
