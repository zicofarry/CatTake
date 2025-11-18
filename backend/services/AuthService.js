const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Diperlukan untuk login
const db = require('../config/db');
const User = require('../models/User');

const SALT_ROUNDS = 10;
const SECRET = 'YOUR_SUPER_SECRET_KEY'; // Ganti ini di file .env!

class AuthService {
    static async registerUser(data) {
        // 1. Validasi input (minimal email, password, role)

        if (!['individu', 'shelter'].includes(data.role)) {
            throw new Error('Invalid user role.');
        }

        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
        
        // 2. Transaksi Database (PENTING untuk register multi-tabel)
        try {
            await db.query('BEGIN'); // Mulai transaksi
            
            // 2a. Insert ke tabel users
            const userQuery = 'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id';
            const userResult = await db.query(userQuery, [data.username, data.email, hashedPassword, data.role]);
            const userId = userResult.rows[0].id;

            // 2b. Insert ke tabel detail
            if (data.role === 'individu') {
                const detailQuery = 'INSERT INTO detail_user_individu (id, full_name, contact_phone, address, nik, job, gender, birth_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
                await db.query(detailQuery, [userId, data.full_name, data.contact_phone, data.address, data.nik, data.job, data.gender, data.birth_date]);
            } else if (data.role === 'shelter') {
                const detailQuery = 'INSERT INTO detail_user_shelter (id, shelter_name, contact_phone, pj_name, pj_nik, organization_type) VALUES ($1, $2, $3, $4, $5, $6)';
                await db.query(detailQuery, [userId, data.shelter_name, data.contact_phone, data.pj_name, data.pj_nik, data.organization_type]);
            }

            await db.query('COMMIT'); // Commit transaksi
            return { id: userId, role: data.role };

        } catch (error) {
            await db.query('ROLLBACK'); // Batalkan jika ada error
            throw new Error('Registration failed: ' + error.message);
        }
    }

    static async loginUser(identifier, password) {
        const userResult = await User.findByLoginIdentifier(identifier);
        const user = userResult.rows[0];

        if (!user) {
            throw new Error('User not found.');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            throw new Error('Invalid credentials.');
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });

        return { token, role: user.role, userId: user.id };
    }
}

module.exports = AuthService;
