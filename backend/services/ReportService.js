const db = require('../config/db');

class ReportService {
    static async createReport(data) {
        let type = 'stray';
        if (data.report_type === 'missing' || data.report_type === 'Found_Missing') {
            type = 'missing';
        }
        let lostCatId = data.lost_cat_id;
        if (!lostCatId || lostCatId === 'null' || lostCatId === 'undefined' || lostCatId === '') {
            lostCatId = null;
        }
        const query = `
            INSERT INTO reports (
                reporter_id, report_type, lost_cat_id, -- Tambahkan kolom ini
                location, latitude, longitude, description, 
                photo, report_date, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) -- Tambahkan $3 & geser urutan
            RETURNING id
        `;
        
        const values = [
            data.reporter_id,
            data.report_type,
            data.lost_cat_id, // Masukkan nilai ID kucing hilang (bisa null)
            data.location,
            data.latitude,
            data.longitude,
            data.description,
            data.photo
        ];

        const result = await db.query(query, values);
        if (data.lost_cat_id) {
            await db.query(
                `UPDATE lost_cats SET status = 'found' WHERE id = $1`, 
                [data.lost_cat_id]
            );
        }
        
        return result.rows[0];
    }

    // Ambil Riwayat Laporan Milik User Tertentu
    static async getReportsByUser(userId) {
        const query = `
            SELECT 
                r.*,
                ra.tracking_id,
                ra.assignment_status,
                d.full_name as driver_name
            FROM reports r
            LEFT JOIN rescue_assignments ra ON r.id = ra.report_id
            LEFT JOIN drivers d ON ra.driver_id = d.id
            WHERE r.reporter_id = $1
            ORDER BY 
                -- LOGIKA SORTING CUSTOM --
                CASE 
                    -- 1. Paling Atas: Sedang Dijemput / OTW (Butuh Tracking)
                    WHEN ra.assignment_status IN ('assigned', 'in_transit') THEN 1
                    
                    -- 2. Tengah: Belum ada status (Menunggu Shelter)
                    WHEN ra.assignment_status IS NULL THEN 2
                    
                    -- 3. Bawah: Sudah Selesai
                    WHEN ra.assignment_status = 'completed' THEN 3
                    
                    ELSE 4
                END ASC,
                r.created_at DESC -- Di dalam grup yang sama, urutkan dari yang terbaru
        `;
        
        const result = await db.query(query, [userId]);
        
        return result.rows.map(row => ({
            ...row,
            photo: row.photo ? `${row.photo}` : '/img/placeholder.png',
            status_label: row.assignment_status || 'Mencari Shelter',
            is_trackable: !!row.tracking_id // True jika ada driver
        }));
    }
}
module.exports = ReportService;