const db = require('../config/db');

class AdminService {
    // 1. Ambil List Shelter yang Belum Terverifikasi
    static async getPendingShelters() {
        const query = `
            SELECT 
                u.id, u.email, 
                d.shelter_name, d.organization_type, d.contact_phone,
                d.legal_certificate, d.shelter_picture, d.established_date
            FROM users u
            JOIN detail_user_shelter d ON u.id = d.id
            WHERE u.role = 'shelter' 
            AND d.is_verified_shelter = false
            -- Optional: Pastikan mereka sudah upload dokumen
            AND d.legal_certificate IS NOT NULL 
            ORDER BY u.created_at ASC
        `;
        const result = await db.query(query);
        
        // Format URL dokumen
        return result.rows.map(row => ({
            ...row,
            legal_certificate: row.legal_certificate ? `/public/docs/legal/${row.legal_certificate}` : null,
            shelter_picture: row.shelter_picture ? `/public/img/profile/${row.shelter_picture}` : null
        }));
    }

    // 2. Proses Verifikasi (Approve/Reject)
    static async verifyUser(adminId, targetUserId, status, notes, roleType) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // A. Update Status di Tabel Detail
            if (status === 'approved') {
                if (roleType === 'shelter') {
                    await client.query(`UPDATE detail_user_shelter SET is_verified_shelter = true WHERE id = $1`, [targetUserId]);
                } else {
                    await client.query(`UPDATE detail_user_individu SET is_verified = true WHERE id = $1`, [targetUserId]);
                }
            }

            // B. Catat ke Verification Log
            const logQuery = `
                INSERT INTO verification_log 
                (user_id, verifier_id, verification_type, status, notes, created_at)
                VALUES ($1, $2, 'Initial_Data_Check', $3, $4, NOW())
            `;
            await client.query(logQuery, [targetUserId, adminId, status, notes]);

            await client.query('COMMIT');
            return { message: `User berhasil di-${status}` };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = AdminService;
