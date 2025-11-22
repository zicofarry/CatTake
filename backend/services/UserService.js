const db = require('../config/db');

class UserService {
    static async getProfile(userId, role) {
        let query;

        if (role === 'individu') {
            query = `
                SELECT 
                    u.id AS id,
                    u.email,
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
                    d.contact_phone
                FROM users u
                JOIN detail_user_shelter d ON u.id = d.id
                WHERE u.id = $1
            `;
        } else {
            return { id: userId, role };
        }

        const result = await db.query(query, [userId]);
        if (result.rows.length === 0) {
            throw new Error('Profile not found.');
        }
        let profileData = result.rows[0]; 

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