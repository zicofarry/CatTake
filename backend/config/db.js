// Contoh koneksi sederhana menggunakan 'pg' (PostgreSQL)
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'cattake',
    password: 'merahputih1',
    port: 5432,
});

async function connectDB() {
    try {
        await client.connect();
        console.log('Database connected successfully!');
    } catch (err) {
        console.error('Database connection error', err);
        process.exit(1);
    }
}

module.exports = {
    query: (text, params) => client.query(text, params),
    connectDB
};
