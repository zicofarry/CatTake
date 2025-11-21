const db = require('../config/db');

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
                c.name AS "catName", 
                to_char(a.applied_at, 'YYYY/MM/DD HH24:MI') AS date,
                a.statement_letter_path AS document,
                
                -- Data dari tabel users & detail_user_individu (JOIN)
                u.email,
                dui.full_name AS "adopterName",
                dui.profile_picture AS "adopterPhoto",
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
        
        // Mapping data untuk Frontend
        return result.rows.map(row => ({
            id: row.id,
            catName: row.catName,
            date: row.date,
            adopter: {
                name: row.adopterName || 'No Name',
                profilePic: row.adopterPhoto ? `/img/${row.adopterPhoto}` : '/img/profile_default.png',
                // Data sensitif dari detail_user_individu
                nik: row.nik || '-', 
                phone: row.phone || '-',
                email: row.email || '-',
                job: row.job || '-',
                address: row.address || '-',
                document: row.document ? `/img/${row.document}` : null
            }
        }));
    }
}

module.exports = AdoptionService;
