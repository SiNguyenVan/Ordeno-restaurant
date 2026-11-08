const { db } = require('./db');
const { hashPassword } = require('../utils/auth.util');

function initUsers() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'STAFF',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      salary NUMERIC(12, 2) DEFAULT 0,
      hire_date DATE DEFAULT (DATE('now')),
      last_login DATETIME,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
    CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(is_deleted);
  `);

  const count = db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, phone, avatar_url, role, status, salary, hire_date, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const initialUsers = [
      ['admin', 'admin@ordeno.vn', hashPassword('Admin@123'), 'Trần Hoàng Long (Tổng Giám Đốc)', '0901888379', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'SUPER_ADMIN', 'ACTIVE', 45000000, '2024-01-15'],
      ['manager_d1', 'manager.d1@ordeno.vn', hashPassword('Manager@123'), 'Nguyễn Văn Minh (Quản Lý Nhà Hàng)', '0902123456', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'MANAGER', 'ACTIVE', 28000000, '2024-03-01'],
      ['chef_kenji', 'chef.kenji@ordeno.vn', hashPassword('Chef@123'), 'Kenji Sato (Bếp Trưởng)', '0903987654', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80', 'CHEF', 'ACTIVE', 32000000, '2024-02-20'],
      ['waiter_lan', 'lan.nguyen@ordeno.vn', hashPassword('Staff@123'), 'Lê Ngọc Lan (Trưởng Ca Phục Vụ)', '0904555666', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'WAITER', 'ACTIVE', 12000000, '2024-06-10'],
      ['cashier_ha', 'ha.thu@ordeno.vn', hashPassword('Staff@123'), 'Vũ Thu Hà (Thu Ngân Trưởng)', '0905111222', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'CASHIER', 'ACTIVE', 14000000, '2024-05-18']
    ];

    for (const u of initialUsers) {
      insert.run(...u);
    }
    console.log('Seeded 5 initial users successfully.');
  } else {
    console.log('Users table already has', count, 'users.');
  }
}

initUsers();
