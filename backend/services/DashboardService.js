// backend/services/DashboardService.js
const db = require('../config/db');

class DashboardService {
    static async getShelterDashboardSummary(shelterId) {
        const id = parseInt(shelterId);

        // 1. REVISI: Hitung Rescue Masuk (Laporan yang BELUM diambil shelter manapun)
        // Kriteria: reports.shelter_assigned_id IS NULL
        const incomingReportsQuery = `
            SELECT COUNT(*) AS total_incoming_reports 
            FROM reports 
            WHERE shelter_assigned_id IS NULL
        `;
        
        // 2. Hitung Permintaan Adopsi (Pending)
        // Kriteria: Adopsi untuk kucing milik shelter ini DAN statusnya 'pending'
        const adoptionQuery = `
            SELECT COUNT(a.id) AS total_adoption_pending 
            FROM adoptions a
            JOIN cats c ON a.cat_id = c.id
            WHERE c.shelter_id = $1 
            AND a.status = 'pending'
        `;

        // 3. Hitung Kucing Dikelola (Total semua kucing milik shelter, termasuk yang sudah adopted)
        const catQuery = `
            SELECT COUNT(*) AS total_cats 
            FROM cats 
            WHERE shelter_id = $1
        `;

        const verificationQuery = `
            SELECT is_verified_shelter 
            FROM detail_user_shelter 
            WHERE id = $1
        `;

        // Jalankan semua query secara paralel
        const [incomingRes, adoptionRes, catRes, verificationRes] = await Promise.all([
            // Perhatikan bahwa query ini tidak menggunakan $1 untuk filter,
            // ini menghitung semua laporan yang belum terambil secara global.
            db.query(incomingReportsQuery), 
            db.query(adoptionQuery, [id]),
            db.query(catQuery, [id]),
            db.query(verificationQuery, [id])
        ]);

        const isVerified = verificationRes.rows.length > 0 ? verificationRes.rows[0].is_verified_shelter : false;
        
        // Kembalikan hasil dalam format yang diinginkan
        return {
            // Mengambil hasil dari query laporan yang belum terambil
            incoming_rescue: parseInt(incomingRes.rows[0].total_incoming_reports) || 0,
            pending_adoption: parseInt(adoptionRes.rows[0].total_adoption_pending) || 0,
            managed_cats: parseInt(catRes.rows[0].total_cats) || 0,
            is_verified_shelter: isVerified
        };
    }
}

module.exports = DashboardService;