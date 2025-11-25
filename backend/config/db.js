// Contoh koneksi sederhana menggunakan 'pg' (PostgreSQL)
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig = isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Diperlukan untuk koneksi SSL Railway
        }
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'cattake',
        password: process.env.DB_PASS || '3636',
        port: process.env.DB_PORT || 5432,
    };
    
const pool = new Pool(connectionConfig);


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
