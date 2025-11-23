const db = require('../config/db');

class DriverModel {
    
    static async getByShelterId(shelterId) {
        const query = `
            SELECT 
                d.id,
                d.user_id,
                u.username,
                d.full_name as name,
                d.contact_phone,
                d.license_info as sim_photo,
                d.profile_picture, -- Tambahan
                d.is_available,
                u.email
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE d.shelter_id = $1
            ORDER BY d.id DESC
        `;
        const result = await db.query(query, [shelterId]);
        return result.rows;
    }

    static async getById(driverId) {
        const query = `
            SELECT d.*, u.email, u.username 
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = $1
        `;
        const result = await db.query(query, [driverId]);
        return result.rows[0];
    }

    static async create(userData, driverData) {
        const client = await db.connect(); 
        try {
            await client.query('BEGIN');

            // 1. Insert USERS (Sama seperti sebelumnya)
            const userQuery = `
                INSERT INTO users (username, email, password_hash, role)
                VALUES ($1, $2, $3, 'driver')
                RETURNING id
            `;
            const userRes = await client.query(userQuery, [
                userData.username, userData.email, userData.password
            ]);
            const newUserId = userRes.rows[0].id;

            // --- LOGIC ID BARU DI SINI ---
            
            // A. Hitung jumlah driver yang sudah ada di shelter ini
            const countQuery = `SELECT COUNT(*) FROM drivers WHERE shelter_id = $1`;
            const countRes = await client.query(countQuery, [driverData.shelter_id]);
            const nextSeq = parseInt(countRes.rows[0].count) + 1;

            // B. Format ID: DRV-<SHELTER_ID>-<URUTAN_3_DIGIT>
            // Contoh: shelter 10, urutan 3 -> DRV-10-003
            const shelterStr = String(driverData.shelter_id).padStart(2, '0'); // Min 2 digit
            const seqStr = String(nextSeq).padStart(3, '0'); // Min 3 digit
            const driverId = `DRV-${shelterStr}-${seqStr}`;

            // -----------------------------

            // 2. Insert DRIVERS (Gunakan driverId yang baru)
            const driverQuery = `
                INSERT INTO drivers (id, user_id, shelter_id, full_name, contact_phone, license_info, profile_picture, is_available)
                VALUES ($1, $2, $3, $4, $5, $6, $7, true)
                RETURNING *
            `;
            
            const driverRes = await client.query(driverQuery, [
                driverId, // <-- Pakai ID hasil generate
                newUserId,
                driverData.shelter_id,
                driverData.full_name,
                driverData.contact_phone,
                driverData.license_info,
                driverData.profile_picture
            ]);

            await client.query('COMMIT');
            return driverRes.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async update(driverId, data) {
        // PERBAIKAN: Gunakan db.connect()
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Logic Update Dinamis untuk Driver
            let updates = [];
            let values = [];
            let idx = 1;

            // Helper simple untuk build query
            if (data.full_name) { updates.push(`full_name=$${idx++}`); values.push(data.full_name); }
            if (data.contact_phone) { updates.push(`contact_phone=$${idx++}`); values.push(data.contact_phone); }
            if (data.license_info) { updates.push(`license_info=$${idx++}`); values.push(data.license_info); }
            if (data.profile_picture) { updates.push(`profile_picture=$${idx++}`); values.push(data.profile_picture); }

            let userId = null;

            if (updates.length > 0) {
                values.push(driverId); // ID untuk WHERE
                const driverQuery = `UPDATE drivers SET ${updates.join(', ')} WHERE id=$${idx} RETURNING user_id`;
                const resDriver = await client.query(driverQuery, values);
                if (resDriver.rows.length === 0) throw new Error("Driver not found");
                userId = resDriver.rows[0].user_id;
            } else {
                // Kalau tidak ada update di tabel driver, ambil user_id manual
                const resIds = await client.query('SELECT user_id FROM drivers WHERE id = $1', [driverId]);
                if(resIds.rows.length > 0) userId = resIds.rows[0].user_id;
            }

            // Update User (Email / Username)
            if (userId && (data.email || data.username)) {
                let userUpdates = [];
                let userValues = [];
                let uIdx = 1;

                if (data.email) { userUpdates.push(`email=$${uIdx++}`); userValues.push(data.email); }
                if (data.username) { userUpdates.push(`username=$${uIdx++}`); userValues.push(data.username); }
                
                userValues.push(userId);
                const userQuery = `UPDATE users SET ${userUpdates.join(', ')} WHERE id=$${uIdx}`;
                await client.query(userQuery, userValues);
            }

            await client.query('COMMIT');
            return true;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async delete(driverId) {
        // PERBAIKAN: Gunakan db.connect()
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const checkQuery = `SELECT user_id FROM drivers WHERE id = $1`;
            const checkRes = await client.query(checkQuery, [driverId]);
            
            if (checkRes.rows.length === 0) return false;
            const userId = checkRes.rows[0].user_id;

            await client.query(`DELETE FROM drivers WHERE id = $1`, [driverId]);
            await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = DriverModel;