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

    static async loginOrRegisterGoogle(googlePayload, requestedRole) {
        const { email, name, picture, sub } = googlePayload; 

        const checkUser = await db.query('SELECT id, role, username FROM users WHERE email = $1', [email]);

        let user;

        if (checkUser.rows.length > 0) {
            // A. USER LAMA -> Login (Abaikan requestedRole, pakai role asli di DB)
            user = checkUser.rows[0];
        } else {
            // B. USER BARU -> Register
            
            // Tentukan Role: Gunakan role yang diminta frontend, default ke 'individu' jika kosong/invalid
            const newRole = ['individu', 'shelter'].includes(requestedRole) ? requestedRole : 'individu';
            
            const dummyPassword = await bcrypt.hash(sub + Date.now(), SALT_ROUNDS);
            const cleanName = name.replace(/\s+/g, '').toLowerCase();
            const uniqueUsername = `${cleanName}${Math.floor(Math.random() * 10000)}`;

            try {
                await db.query('BEGIN');

                // 1. Insert User
                const insertUserQuery = `
                    INSERT INTO users (username, email, password_hash, role) 
                    VALUES ($1, $2, $3, $4) 
                    RETURNING id, role
                `;
                const userRes = await db.query(insertUserQuery, [uniqueUsername, email, dummyPassword, newRole]);
                user = userRes.rows[0];

                // 2. Insert Detail sesuai Role
                if (newRole === 'individu') {
                    // Masuk tabel Individu
                    const insertDetailQuery = `
                        INSERT INTO detail_user_individu (id, full_name, profile_picture, is_verified) 
                        VALUES ($1, $2, $3, true)
                    `;
                    await db.query(insertDetailQuery, [user.id, name, picture]);
                
                } else if (newRole === 'shelter') {
                    // Masuk tabel Shelter
                    // Kita gunakan Nama Google sebagai 'Shelter Name' dan 'PJ Name' sementara
                    const insertDetailQuery = `
                        INSERT INTO detail_user_shelter (id, shelter_name, pj_name, shelter_picture, is_verified_shelter, organization_type) 
                        VALUES ($1, $2, $3, $4, false, 'Komunitas')
                    `;
                    await db.query(insertDetailQuery, [user.id, name, name, picture]);
                }

                await db.query('COMMIT');
            } catch (error) {
                await db.query('ROLLBACK');
                throw error;
            }
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });

        return { token, role: user.role, userId: user.id };
    }
}

module.exports = AuthService;
