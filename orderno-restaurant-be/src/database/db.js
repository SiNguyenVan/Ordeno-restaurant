require('dotenv').config({ quiet: true });

// better-sqlite3 v13+ yêu cầu Node.js >= 22
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 22) {
    console.error(
        `[Lỗi] better-sqlite3 yêu cầu Node.js >= 22 (hiện tại: ${process.version}). ` +
        `Hãy chạy "nvm use 24.10.0" rồi thử lại.`
    );
    process.exit(1);
}

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const PROJECT_ROOT = path.join(__dirname, '../..');
const DB_PATH = path.resolve(PROJECT_ROOT, process.env.DB_PATH || 'restaurant_mvp.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

const db = new Database(DB_PATH);

// Bật WAL mode để tối ưu hiệu năng đọc/ghi và bật kiểm tra khóa ngoại
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Khởi tạo cấu trúc các bảng trong database từ file schema.sql
 */
function initDatabase() {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schemaSql);
}

/**
 * Nạp dữ liệu mẫu từ file seed.sql
 */
function seedDatabase() {
    const seedSql = fs.readFileSync(SEED_PATH, 'utf8');
    db.exec(seedSql);
}

module.exports = {
    db,
    initDatabase,
    seedDatabase,
    DB_PATH,
};
