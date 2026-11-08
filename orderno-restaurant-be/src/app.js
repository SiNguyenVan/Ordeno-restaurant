const express = require('express');
const cors = require('cors');
const { db } = require('./database/db');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kiểm tra trạng thái server và kết nối database
app.get('/api/health', (req, res) => {
    const { ok } = db.prepare('SELECT 1 AS ok').get();
    res.json({ status: 'ok', database: ok === 1 ? 'connected' : 'error' });
});

app.use('/api', routes);

// Route không tồn tại
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Không tìm thấy route: ${req.method} ${req.originalUrl}` });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) console.error(err);

    res.status(status).json({
        success: false,
        message: status >= 500 ? 'Lỗi máy chủ nội bộ' : err.message,
        ...(err.details && { details: err.details }),
    });
});

module.exports = app;

