require('dotenv').config({ quiet: true });

const app = require('./app');
const { db } = require('./database/db');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

function shutdown() {
    server.close(() => {
        db.close();
        process.exit(0);
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

