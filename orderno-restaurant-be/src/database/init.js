const { db, initDatabase, seedDatabase, DB_PATH } = require('./db');

try {
    console.log('1. Đang làm sạch các bảng cũ...');
    db.pragma('foreign_keys = OFF');
    const existingTables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
        .all();
    for (const { name } of existingTables) {
        db.exec(`DROP TABLE IF EXISTS ${name}`);
    }
    db.pragma('foreign_keys = ON');

    console.log('2. Đang tạo các bảng mới từ schema.sql...');
    initDatabase();

    console.log('3. Đang nạp dữ liệu mẫu từ seed.sql...');
    seedDatabase();

    const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        .all();

    console.log(`\nKhởi tạo & Seed THÀNH CÔNG tại: ${DB_PATH}`);
    console.log('Thống kê số lượng dữ liệu trong từng bảng:');
    for (const { name } of tables) {
        const count = db.prepare(`SELECT COUNT(*) AS count FROM ${name}`).get().count;
        console.log(`  - ${name}: ${count} bản ghi`);
    }
} catch (error) {
    console.error('Lỗi khi khởi tạo hoặc seed database:', error);
    process.exit(1);
} finally {
    if (db && db.open) {
        db.close();
    }
}
