// Contoh koneksi sederhana menggunakan 'pg' (PostgreSQL)
const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cattake',
    password: '3636',
    port: 5432,
});

const connectDB = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Database connected successfully!');
    } catch (err) {
        console.error('Database connection error', err);
        process.exit(1);
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect(),
    connectDB
};
