const db = require('../config/db');

class AdoptionService {
    // 1. Buat pengajuan adopsi baru (User submit form)
    static async createAdoption(data) {
        // Pastikan kucing masih available sebelum insert
        const checkCat = await db.query('SELECT adoption_status FROM cats WHERE id = $1', [data.cat_id]);
        if (!checkCat.rows.length || checkCat.rows[0].adoption_status !== 'available') {
            throw new Error('Kucing tidak tersedia untuk diadopsi.');
        }

        const query = `
            INSERT INTO adoptions (
                cat_id, applicant_id, status, 
                adopter_nik, adopter_phone, adopter_email, 
                adopter_job, adopter_address, identity_photo_url, 
                applied_at, updated_at
            ) 
            VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id
        `;
        
        const values = [
            data.cat_id, data.applicant_id, 
            data.nik, data.phone, data.email, 
            data.job, data.address, data.photoUrl
        ];

        const result = await db.query(query, values);
        
        // Update status kucing jadi 'pending' agar tidak bisa di-apply orang lain (opsional, tergantung flow bisnis)
        // await db.query("UPDATE cats SET adoption_status = 'pending' WHERE id = $1", [data.cat_id]);

        return result.rows[0];
    }

    // 2. Ambil laporan adopsi untuk Shelter tertentu (Fitur Shelter View)
    static async getAdoptionReportsByShelter(shelterId) {
        const query = `
            SELECT 
                a.id, 
                c.name AS "catName", 
                to_char(a.applied_at, 'YYYY/MM/DD HH24:MI') AS date,
                COALESCE(d.full_name, u_app.username) AS "adopterName",
                d.profile_picture AS "adopterPhoto",
                d.nik AS nik,               
                d.contact_phone AS phone,
                u_app.email AS email,
                d.job AS job,               
                d.address AS address        

            FROM adoptions a
            JOIN cats c ON a.cat_id = c.id
            JOIN users u_app ON a.applicant_id = u_app.id
            LEFT JOIN detail_user_individu d ON u_app.id = d.id
            WHERE c.shelter_id = $1
            ORDER BY a.applied_at DESC
        `;
        
        const result = await db.query(query, [shelterId]);
        
        // Mapping format agar sesuai komponen AdoptionReportCard.vue
        return result.rows.map(row => {
            // Logic masking NIK
            // Ambil 4 digit terakhir, sisanya ganti bintang
            let maskedNik = '-';
            if (row.nik && row.nik.length >= 4) {
                maskedNik = '*'.repeat(12) + row.nik.slice(-4); 
                // Hasil: ************1234
            }

            return {
                id: row.id,
                catName: row.catName,
                date: row.date,
                adopter: {
                    name: row.adopterName,
                    profilePic: row.adopterPhoto ? `/img/${row.adopterPhoto}` : '/img/profile_default.png',
                    nik: maskedNik, 
                    phone: row.phone,
                    email: row.email,
                    job: row.job,
                    address: row.address
                }
            }
        });
    }
}

module.exports = AdoptionService;
