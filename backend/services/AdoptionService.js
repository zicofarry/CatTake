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
            catName: row.catName,
            date: row.date,
            adopter: {
                name: row.adopterName || 'No Name',
                // Foto Profil (asumsi masih di /img/profile/)
                profilePic: row.adopterPhoto ? `/public/img/profile/${row.adopterPhoto}` : null, 
                
                nik: row.nik || '-', 
                phone: row.phone || '-',
                email: row.email || '-',
                job: row.job || '-',
                address: row.address || '-',
                
                // PATH BARU UNTUK DOKUMEN
                // Ingat: server.js serve 'public' di prefix '/public/'
                documentUrl: row.statementFile ? `/public/docs/stmt/${row.statementFile}` : null,
                identityUrl: row.identityFile ? `/public/img/identity/${row.identityFile}` : null
            }
        }));
    }

    static async verifyAdoption(adoptionId, status, shelterId) {
        const client = await db.connect(); // Gunakan client untuk transaksi
        try {
            await client.query('BEGIN');

            // 1. Cek Data & Ambil ID Pelamar (applicant_id) untuk logging
            const checkQuery = `
                SELECT a.id, a.cat_id, a.applicant_id
                FROM adoptions a
                JOIN cats c ON a.cat_id = c.id
                WHERE a.id = $1 AND c.shelter_id = $2
            `;
            const checkRes = await client.query(checkQuery, [adoptionId, shelterId]);
            
            if (checkRes.rows.length === 0) {
                throw new Error('Permintaan adopsi tidak ditemukan atau Anda tidak memiliki akses.');
            }
            
            const { cat_id, applicant_id } = checkRes.rows[0];

            // 2. Update Status di Tabel 'adoptions'
            const updateAdoption = `
                UPDATE adoptions 
                SET status = $1, verified_at = NOW() 
                WHERE id = $2
            `;
            await client.query(updateAdoption, [status, adoptionId]);

            // 3. Jika Approved, Update Status Kucing di Tabel 'cats' jadi 'adopted'
            if (status === 'approved' || status === 'completed') {
                const updateCat = `UPDATE cats SET adoption_status = 'adopted' WHERE id = $1`;
                await client.query(updateCat, [cat_id]);
                
                // --- NEW LOGIC: TRIGGER ADOPTION_COUNT ---
                // Hanya hitung saat status berubah menjadi 'approved'
                if (status === 'approved') { 
                   GamificationService.updateProgress(applicant_id, 'ADOPTION_COUNT', 1).catch(err => console.error("Quest Update Error:", err));
                }
                // -----------------------------------------
            }

            // 4. [BARU] Masukkan Log ke Tabel 'verification_log'
            // Kita mapping status adopsi ke status log yang valid (approved/rejected)
            let logStatus = status;
            if (status === 'completed') logStatus = 'approved'; 

            // Pastikan hanya status valid yang masuk log (sesuai constraint check di DB)
            if (['approved', 'rejected'].includes(logStatus)) {
                const insertLogQuery = `
                    INSERT INTO verification_log 
                    (user_id, verifier_id, verification_type, status, notes, created_at)
                    VALUES ($1, $2, 'Adoption_Application', $3, $4, NOW())
                `;
                
                const notes = `Permintaan adopsi telah di-${status} oleh shelter.`;
                
                await client.query(insertLogQuery, [
                    applicant_id, // User yang diverifikasi (Pelamar)
                    shelterId,    // User yang memverifikasi (Shelter)
                    logStatus,    // Status (approved/rejected)
                    notes         // Catatan tambahan
                ]);
            }

            await client.query('COMMIT');
            return { message: `Adopsi berhasil di-${status}` };

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
                a.id, 
                a.status, 
                to_char(a.applied_at, 'DD Mon YYYY') AS "appliedDate",
                c.name AS "catName", 
                c.photo AS "catImage",
                s.shelter_name AS "shelterName",
                dui.full_name AS "applicantName"
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
}

module.exports = AdoptionService;
