const { db } = require('../database/db');

const UserRepository = {
  /**
   * Tìm người dùng theo username hoặc email (chỉ tìm trong những người chưa bị xóa)
   */
  findByUsernameOrEmail: (identifier) => {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const query = `
      SELECT *
      FROM users
      WHERE (LOWER(username) = ? OR LOWER(email) = ?)
        AND is_deleted = 0
      LIMIT 1
    `;
    return db.prepare(query).get(clean, clean);
  },

  /**
   * Kiểm tra trùng lặp username hoặc email (loại trừ ID đang sửa nếu có)
   */
  checkExisting: (username, email, excludeId = null) => {
    let query = `
      SELECT id, username, email 
      FROM users 
      WHERE is_deleted = 0 AND (LOWER(username) = ? OR LOWER(email) = ?)
    `;
    const params = [username.trim().toLowerCase(), email.trim().toLowerCase()];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(Number(excludeId));
    }
    return db.prepare(query).get(...params);
  },

  /**
   * Lấy thông tin người dùng theo ID (không bao gồm password_hash, chỉ lấy người chưa xóa)
   */
  findById: (id) => {
    const query = `
      SELECT 
        id,
        username,
        email,
        full_name,
        phone,
        avatar_url,
        role,
        status,
        salary,
        hire_date,
        last_login,
        is_deleted,
        created_at
      FROM users
      WHERE id = ? AND is_deleted = 0
    `;
    return db.prepare(query).get(id);
  },

  /**
   * Lấy danh sách nhân viên kèm tìm kiếm, lọc và phân trang (chỉ lấy is_deleted = 0)
   */
  getAllStaff: ({
    role,
    status,
    search,
    page = 1,
    limit = 50,
  } = {}) => {
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 50);
    const offset = (currentPage - 1) * pageSize;

    let whereClause = ' WHERE is_deleted = 0';
    const params = [];

    if (search) {
      whereClause += ' AND (full_name LIKE ? OR username LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (role && role !== 'ALL') {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (status && status !== 'ALL') {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users
      ${whereClause}
    `;
    const { total = 0 } = db.prepare(countQuery).get(...params) || {};

    const dataQuery = `
      SELECT 
        id,
        username,
        email,
        full_name,
        phone,
        avatar_url,
        role,
        status,
        salary,
        hire_date,
        last_login,
        is_deleted,
        created_at
      FROM users
      ${whereClause}
      ORDER BY 
        CASE role
          WHEN 'SUPER_ADMIN' THEN 1
          WHEN 'ADMIN' THEN 2
          WHEN 'MANAGER' THEN 3
          WHEN 'CHEF' THEN 4
          WHEN 'CASHIER' THEN 5
          WHEN 'WAITER' THEN 6
          ELSE 7
        END ASC,
        id ASC
      LIMIT ? OFFSET ?
    `;

    const staffList = db.prepare(dataQuery).all(...params, pageSize, offset);

    return {
      staff: staffList,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  },

  /**
   * Thêm nhân viên mới
   */
  createStaff: (data) => {
    const query = `
      INSERT INTO users (
        username,
        email,
        password_hash,
        full_name,
        phone,
        avatar_url,
        role,
        status,
        salary,
        hire_date,
        is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    const info = db.prepare(query).run(
      data.username.trim().toLowerCase(),
      data.email.trim().toLowerCase(),
      data.password_hash,
      data.full_name.trim(),
      data.phone ? data.phone.trim() : null,
      data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      data.role || 'STAFF',
      data.status || 'ACTIVE',
      data.salary ? Number(data.salary) : 0,
      data.hire_date || new Date().toISOString().split('T')[0]
    );

    return UserRepository.findById(info.lastInsertRowid);
  },

  /**
   * Cập nhật thông tin nhân viên
   */
  updateStaff: (id, data) => {
    const fields = [];
    const params = [];

    if (data.full_name !== undefined) {
      fields.push('full_name = ?');
      params.push(data.full_name.trim());
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      params.push(data.email.trim().toLowerCase());
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      params.push(data.phone ? data.phone.trim() : null);
    }
    if (data.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      params.push(data.avatar_url);
    }
    if (data.role !== undefined) {
      fields.push('role = ?');
      params.push(data.role);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      params.push(data.status);
    }
    if (data.salary !== undefined) {
      fields.push('salary = ?');
      params.push(Number(data.salary) || 0);
    }
    if (data.password_hash) {
      fields.push('password_hash = ?');
      params.push(data.password_hash);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length === 1) return UserRepository.findById(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND is_deleted = 0`;
    params.push(id);
    db.prepare(query).run(...params);

    return UserRepository.findById(id);
  },

  /**
   * Đổi nhanh trạng thái nhân viên
   */
  updateStatus: (id, status) => {
    const query = `UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0`;
    db.prepare(query).run(status, id);
    return UserRepository.findById(id);
  },

  /**
   * Cập nhật lần đăng nhập cuối
   */
  updateLastLogin: (id) => {
    const query = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
    db.prepare(query).run(id);
  },

  /**
   * XÓA MỀM (Soft delete): Đánh dấu is_deleted = 1, status = 'INACTIVE'
   */
  deleteStaff: (id) => {
    const query = `
      UPDATE users 
      SET is_deleted = 1, status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND is_deleted = 0
    `;
    return db.prepare(query).run(id);
  },

  /**
   * Thống kê nhân sự theo vai trò và trạng thái (chỉ tính is_deleted = 0)
   */
  getStaffStats: () => {
    const where = ' WHERE is_deleted = 0';

    const total = db.prepare(`SELECT COUNT(*) AS c FROM users ${where}`).get().c;
    const active = db.prepare(`SELECT COUNT(*) AS c FROM users ${where} AND status = 'ACTIVE'`).get().c;
    const inactive = db.prepare(`SELECT COUNT(*) AS c FROM users ${where} AND status != 'ACTIVE'`).get().c;

    const roles = db
      .prepare(`
      SELECT role, COUNT(*) AS count
      FROM users
      ${where}
      GROUP BY role
    `)
      .all();

    return {
      total,
      active,
      inactive,
      byRole: roles.reduce((acc, r) => ({ ...acc, [r.role]: r.count }), {}),
    };
  },
};

module.exports = UserRepository;
