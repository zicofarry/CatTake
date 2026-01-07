const db = require('../config/db');
const GamificationService = require('./GamificationService');

class AdoptionService {
    // 1. PROSES PENGAJUAN ADOPSI (Transaction)
    static async createAdoption(data) {
        const client = await db.connect();
        
        try {
            await client.query('BEGIN');

            // 1. Cek Ketersediaan Kucing
            const checkCat = await client.query('SELECT adoption_status FROM cats WHERE id = $1', [data.cat_id]);
            if (checkCat.rows.length === 0) throw new Error('Kucing tidak ditemukan.');
            if (checkCat.rows[0].adoption_status !== 'available') throw new Error('Kucing tidak tersedia.');

            // 2. Update Data User & Simpan Foto KTP (di detail_user_individu)
            // Pastikan tabel 'detail_user_individu' memiliki kolom 'ktp_file_path' (sudah ada di SQL kamu)
            const updateProfileQuery = `
                UPDATE detail_user_individu
                SET 
                    nik = $1,
                    contact_phone = $2,
                    job = $3,
                    address = $4,
                    ktp_file_path = $5 
                WHERE id = $6
            `;
            await client.query(updateProfileQuery, [
                data.nik, 
                data.phone, 
                data.job, 
                data.address, 
                data.identityPhoto, // Nama file KTP
                data.applicant_id
            ]);

            // 3. Buat Record Adopsi & Simpan Surat Pernyataan (di adoptions)
            // Pastikan tabel 'adoptions' memiliki kolom 'statement_letter_path' (sudah ada di SQL kamu)
            const insertAdoptionQuery = `
                INSERT INTO adoptions (
                    cat_id, 
                    applicant_id, 
                    status, 
                    statement_letter_path, 
                    applied_at, 
                    updated_at
                ) 
                VALUES ($1, $2, 'pending', $3, NOW(), NOW())
                RETURNING id
            `;
            const resAdoption = await client.query(insertAdoptionQuery, [
                data.cat_id,
                data.applicant_id,
                data.statementLetter // Nama file Surat Pernyataan
            ]);

            await client.query('COMMIT');
            return resAdoption.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // 2. GET LAPORAN ADOPSI (Dengan JOIN)
    static async getAdoptionReportsByShelter(shelterId) {
        const query = `
            SELECT 
                a.id, 
                a.cat_id AS "catId",
                a.status,
                c.name AS "catName", 
                to_char(a.applied_at, 'YYYY/MM/DD HH24:MI') AS date,
                
                -- Nama file saja
                a.statement_letter_path AS "statementFile", 
                
                u.email,
                dui.full_name AS "adopterName",
                dui.profile_picture AS "adopterPhoto",
                
                -- Nama file KTP
                dui.ktp_file_path AS "identityFile",
                
                dui.nik,
                dui.contact_phone AS phone,
                dui.job,
                dui.address

            FROM adoptions a
            JOIN cats c ON a.cat_id = c.id
            JOIN users u ON a.applicant_id = u.id
            JOIN detail_user_individu dui ON u.id = dui.id
            
            WHERE c.shelter_id = $1
            ORDER BY a.applied_at DESC
        `;
        
        const result = await db.query(query, [shelterId]);
        
        return result.rows.map(row => ({
            id: row.id,
            status: row.status,
            catId: row.catId,
            catName: row.catName,
            date: row.date,
            adopter: {
                name: row.adopterName || 'No Name',
                profilePic: row.adopterPhoto ? `${row.adopterPhoto}` : null, 
                
                nik: row.nik || '-', 
                phone: row.phone || '-',
                email: row.email || '-',
                job: row.job || '-',
                address: row.address || '-',
                
                // PATH BARU UNTUK DOKUMEN
                // Ingat: server.js serve 'public' di prefix '/public/'
                documentUrl: row.statementFile ? `${row.statementFile}` : null,
                identityUrl: row.identityFile ? `${row.identityFile}` : null
            }
        }));
    }

    static async verifyAdoption(adoptionId, status, shelterId, reason = null) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Cek Data & Ambil info cat_id
            const checkQuery = `
                SELECT a.id, a.cat_id, a.applicant_id, c.name as cat_name
                FROM adoptions a
                JOIN cats c ON a.cat_id = c.id
                WHERE a.id = $1 AND c.shelter_id = $2
            `;
            const checkRes = await client.query(checkQuery, [adoptionId, shelterId]);
            
            if (checkRes.rows.length === 0) throw new Error('Data tidak ditemukan.');
            const { cat_id, applicant_id, cat_name } = checkRes.rows[0];

            // 2. Update Status & Rejection Reason untuk user ini
            const updateAdoption = `
                UPDATE adoptions 
                SET status = $1, rejection_reason = $2, verified_at = NOW(), updated_at = NOW()
                WHERE id = $3
            `;
            await client.query(updateAdoption, [status, reason, adoptionId]);

            // 3. LOGIKA JIKA DI-APPROVE
            if (status === 'approved' || status === 'completed') {
                // Update status kucing jadi adopted
                await client.query(`UPDATE cats SET adoption_status = 'adopted' WHERE id = $1`, [cat_id]);
                
                // AUTO-REJECT pelamar lain untuk kucing yang sama
                const autoRejectMsg = `Maaf, kucing ${cat_name} sudah diadopsi oleh pelamar lain.`;
                const autoRejectQuery = `
                    UPDATE adoptions 
                    SET status = 'rejected', rejection_reason = $1, verified_at = NOW(), updated_at = NOW()
                    WHERE cat_id = $2 AND status = 'pending' AND id != $3
                `;
                await client.query(autoRejectQuery, [autoRejectMsg, cat_id, adoptionId]);

                // Quest Progress
                if (status === 'approved') {
                    GamificationService.updateProgress(applicant_id, 'ADOPTION_COUNT', 1).catch(e => console.error(e));
                }
            }

            await client.query('COMMIT');
            return { message: `Berhasil memproses status: ${status}` };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getUserAdoptions(userId) {
        const query = `
            SELECT 
                a.id, a.status, a.rejection_reason, 
                to_char(a.applied_at, 'DD Mon YYYY') AS "appliedDate",
                c.name AS "catName", 
                c.photo AS "catImage",
                s.shelter_name AS "shelterName",
                dui.full_name AS "applicantName",
                dui.address AS "applicantAddress",
                dui.nik AS "applicantNik",
                dui.contact_phone AS "applicantPhone",
                dui.job AS "applicantJob",
                a.statement_letter_path AS "statementFile",
                dui.ktp_file_path AS "identityFile"
            FROM adoptions a
            JOIN cats c ON a.cat_id = c.id
            JOIN detail_user_shelter s ON c.shelter_id = s.id
            JOIN detail_user_individu dui ON a.applicant_id = dui.id
            WHERE a.applicant_id = $1
            ORDER BY a.applied_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    static async cancelAdoption(adoptionId, userId) {
        // Cek dulu apakah statusnya masih pending
        const check = await db.query(
            'SELECT status FROM adoptions WHERE id = $1 AND applicant_id = $2', 
            [adoptionId, userId]
        );
        
        if (check.rows.length === 0) throw new Error('Data tidak ditemukan.');
        if (check.rows[0].status !== 'pending') {
            throw new Error('Hanya pengajuan yang masih pending yang dapat dibatalkan.');
        }

        await db.query('DELETE FROM adoptions WHERE id = $1', [adoptionId]);
        return { message: 'Pengajuan adopsi berhasil dibatalkan.' };
    }

    static async getAdoptionDetail(adoptionId, userId) {
        const query = `
            SELECT 
                a.*, 
                to_char(a.applied_at, 'DD Mon YYYY, HH24:MI') AS "appliedDate",
                c.name AS "catName", c.photo AS "catImage", c.breed, c.gender,
                s.shelter_name AS "shelterName", s.address AS "shelterAddress",
                dui.full_name AS "applicantName", dui.address AS "applicantAddress"
            FROM adoptions a
            JOIN cats c ON a.cat_id = c.id
            JOIN detail_user_shelter s ON c.shelter_id = s.id
            JOIN detail_user_individu dui ON a.applicant_id = dui.id
            WHERE a.id = $1 AND a.applicant_id = $2
        `;
        const result = await db.query(query, [adoptionId, userId]);
        return result.rows[0];
    }

    static async getOtherApplicantsCount(adoptionId, catId) {
        const query = `
            SELECT COUNT(*) 
            FROM adoptions 
            WHERE cat_id = $1 AND status = 'pending' AND id != $2
        `;
        const res = await db.query(query, [catId, adoptionId]);
        return parseInt(res.rows[0].count);
    }
}

module.exports = AdoptionService;
