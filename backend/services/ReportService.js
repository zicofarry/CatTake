const db = require('../config/db');

class ReportService {
    static async createReport(data) {
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
        return result.rows[0];
    }
}
module.exports = ReportService;