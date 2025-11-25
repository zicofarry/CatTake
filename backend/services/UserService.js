const db = require('../config/db');
const GamificationService = require('./GamificationService');

class UserService {
    static async getProfile(userId, role) {
        let query;

        // 1. FIX: Deklarasi 'id' dan variabel gamifikasi di awal fungsi
        const id = parseInt(userId, 10); // FIX: Definisikan id di sini
        let quests = []; 
        let achievements = [];

        if (role === 'individu') {
            query = `
                SELECT 
                    u.id AS id,
                    u.email,
                    COALESCE(u.total_points, 0) as total_points,
                    d.full_name AS name,
                    d.profile_picture AS photo,
                    d.contact_phone,
                    d.address,
                    d.bio,
                    d.birth_date,
                    d.gender
                FROM users u
                JOIN detail_user_individu d ON u.id = d.id
                WHERE u.id = $1
            `;
        } else if (role === 'shelter') {
            query = `
                SELECT
                    u.id AS id,
                    u.email,
                    d.shelter_name AS name,
                    d.shelter_picture AS photo,
                    d.contact_phone,
                    d.organization_type,
                    d.established_date,
                    d.bio,
                    d.donation_account_number,
                    d.pj_name,
                    d.pj_nik,
                    d.legal_certificate,
                    d.qr_img,
                    d.latitude,
                    d.longitude
                FROM users u
                JOIN detail_user_shelter d ON u.id = d.id
                WHERE u.id = $1
            `;
        } else if (role === 'driver') { 
            query = `
                SELECT 
                    u.id AS id,
                    u.email,
                    d.full_name AS name,
                    d.profile_picture AS photo, -- Pastikan kolom profile_picture ada di tabel drivers
                    d.contact_phone
                FROM users u
                JOIN drivers d ON u.id = d.user_id
                WHERE u.id = $1
            `;
        } else {
            return { id: userId, role };
        }

        // Jalankan query menggunakan 'id' yang sudah diconvert
        const result = await db.query(query, [id]);
        if (result.rows.length === 0) {
            throw new Error('Profile not found.');
        }
        let profileData = result.rows[0]; 

        // --- LOKASI PENGAMBILAN DATA GAMIFIKASI ---
        // 1. Inisialisasi properti gamifikasi pada profileData (Untuk Non-individu dan Fallback)
        profileData.quests = [];
        profileData.achievements = [];


        // 2. Pengambilan Gamifikasi hanya untuk 'individu'
        if (role === 'individu') {
            try {
                const gamificationData = await GamificationService.getUserQuestsAndAchievements(id);
                
                // FIX KRUSIAL: Tempelkan array hasil langsung ke profileData
                profileData.quests = gamificationData.quests; 
                profileData.achievements = gamificationData.achievements;
                
                // DEBUGGING LOG: (Menggunakan profileData yang sudah diupdate)
                // console.log("DEBUG_USER_SERVICE: Data Gamifikasi Diterima:", {
                //     user: profileData.username,
                //     total_quests: profileData.quests.length, 
                //     total_achievements: profileData.achievements.length,
                //     example_quest: profileData.quests.length > 0 ? profileData.quests[0] : 'Tidak ada misi aktif'
                // });

            } catch (e) {
                console.error("Gagal ambil gamifikasi:", e.message); 
                profileData.quests = []; // Biarkan array kosong jika gagal
                profileData.achievements = [];
            }
        }
        // ------------------------------------------

        // Logic URL Foto Profil
        const BASE_IMAGE_URL = '/public/img/profile/'; 
        
        if (profileData.photo && profileData.photo !== 'NULL.JPG') {
            if (profileData.photo.startsWith('http')) {
                // Biarkan URL eksternal
            } else {
                profileData.photo = `${BASE_IMAGE_URL}${profileData.photo}`;
            }
        } else {
            profileData.photo = '/img/NULL.JPG'; 
        }

        return { ...profileData, role };
    }

    // [TAMBAHAN BARU] Update Detail Shelter Lengkap
    static async updateShelterDetails(userId, data) {
        let updates = [];
        let values = [];
        let idx = 1;

        const fields = [
            'shelter_name', 'organization_type', 'established_date', 'bio', 
            'contact_phone', 'donation_account_number', 'pj_name', 'pj_nik',
            'legal_certificate', 'qr_img', 'latitude', 'longitude'
        ];

        fields.forEach(field => {
            if (data[field] !== undefined && data[field] !== null && data[field] !== 'null') {
                updates.push(`${field} = $${idx++}`);
                values.push(data[field]);
            }
        });

        if (updates.length === 0) return null;

        values.push(userId);
        const query = `
            UPDATE detail_user_shelter 
            SET ${updates.join(', ')} 
            WHERE id = $${idx} 
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }
    
    static async updateProfile(userId, role, data) {
        if (role === 'guest') {
            throw new Error('Unauthorized.');
        }

        let tableName;
        let fields = [];
        let values = [];
        let i = 1;

        if (role === 'individu') {
            tableName = 'detail_user_individu';
            if (data.full_name !== undefined) { fields.push(`full_name = $${i++}`); values.push(data.full_name); }
            if (data.birth_date !== undefined) {
                const birthDateValue = data.birth_date === '' ? null : data.birth_date; 
                fields.push(`birth_date = $${i++}`); 
                values.push(birthDateValue);
            }
            if (data.gender !== undefined) { fields.push(`gender = $${i++}`); values.push(data.gender); }
            if (data.bio !== undefined) { fields.push(`bio = $${i++}`); values.push(data.bio); }
            
        } else if (role === 'shelter') {
            tableName = 'detail_user_shelter';
            if (data.full_name !== undefined) { fields.push(`shelter_name = $${i++}`); values.push(data.full_name); }
            if (data.bio !== undefined) { fields.push(`bio = $${i++}`); values.push(data.bio); }
            if (data.contact_phone !== undefined) { fields.push(`contact_phone = $${i++}`); values.push(data.contact_phone); }
        }

        if (fields.length === 0) {
            return { message: 'No data to update.' };
        }

        values.push(userId); 

        const updateQuery = `
            UPDATE ${tableName} 
            SET ${fields.join(', ')} 
            WHERE id = $${i} 
            RETURNING *;
        `;

        const result = await db.query(updateQuery, values);

        if (result.rowCount === 0) {
            throw new Error(`User detail for ID ${userId} not found.`);
        }

        return result.rows[0];
    }

    static async updateProfilePhoto(userId, role, fileName) {
        let table;
        let column;

        if (role === 'individu') {
            table = 'detail_user_individu';
            column = 'profile_picture';
        } else if (role === 'shelter') {
            table = 'detail_user_shelter';
            column = 'shelter_picture';
        } else {
            throw new Error('Invalid role');
        }

        const getOldQuery = `SELECT ${column} AS old_photo FROM ${table} WHERE id = $1`;
        const oldResult = await db.query(getOldQuery, [userId]);
        const oldFileName = oldResult.rows.length > 0 ? oldResult.rows[0].old_photo : null;
        
        const updateQuery = `UPDATE ${table} SET ${column} = $1 WHERE id = $2 RETURNING ${column}`;
        const result = await db.query(updateQuery, [fileName, userId]);
        
        if (result.rowCount === 0) {
            throw new Error('User not found');
        }
        
        return { 
            newPhoto: result.rows[0][column],
            oldPhoto: oldFileName
        };
    }

    // [UPDATE BAGIAN INI]
    static async getAllShelters() {
        // Menambahkan qr_img ke dalam query SELECT
        const query = `
            SELECT id, shelter_name, donation_account_number, qr_img 
            FROM detail_user_shelter
            ORDER BY shelter_name ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = UserService;