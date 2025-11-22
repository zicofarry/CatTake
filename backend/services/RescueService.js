const db = require('../config/db');

class RescueService {
    
    // 1. Ambil Laporan Masuk (Belum diambil shelter manapun)
    static async getIncomingReports() {
        const query = `
            SELECT 
                r.*, 
                u.username as reporter_name, 
                dui.full_name, 
                dui.profile_picture,
                dui.contact_phone
            FROM reports r
            JOIN users u ON r.reporter_id = u.id
            LEFT JOIN detail_user_individu dui ON u.id = dui.id
            WHERE r.shelter_assigned_id IS NULL
            ORDER BY r.created_at DESC
        `;
        
        const result = await db.query(query);
        
        return result.rows.map(row => ({
            ...row,
            photo: row.photo ? `/public/img/report_cat/${row.photo}` : '/img/NULL.JPG',
            profile_picture: row.profile_picture ? `/public/img/profile/${row.profile_picture}` : '/img/NULL.JPG'
        }));
    }

    // 2. Ambil Daftar Driver milik Shelter
    static async getShelterDrivers(shelterId) {
        const query = `
            SELECT id, full_name, is_available 
            FROM drivers 
            WHERE shelter_id = $1 AND is_available = true
        `;
        const res = await db.query(query, [shelterId]);
        return res.rows;
    }

    // 3. Assign Job (Shelter mengambil orderan & Tugaskan Driver)
    static async assignJob(shelterId, reportId, driverId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // A. Cek apakah laporan masih available
            const checkQuery = `SELECT id FROM reports WHERE id = $1 AND shelter_assigned_id IS NULL FOR UPDATE`;
            const checkRes = await client.query(checkQuery, [reportId]);

            if (checkRes.rows.length === 0) {
                throw new Error('Maaf, laporan ini sudah diambil shelter lain.');
            }

            // === BAGIAN PENTING: GENERATE TRACKING ID ===
            
            // 1. Ambil nomor urut selanjutnya dari database
            const seqRes = await client.query("SELECT nextval('rescue_assignments_id_seq')");
            const nextId = seqRes.rows[0].nextval;
            
            // 2. Format jadi ID Keren: RES-BDG-0001
            const trackingId = `RES-BDG-${String(nextId).padStart(4, '0')}`; 

            // ============================================

            // B. Update Reports -> Set Shelter yang bertanggung jawab
            await client.query(`UPDATE reports SET shelter_assigned_id = $1 WHERE id = $2`, [shelterId, reportId]);

            // C. Insert ke Rescue Assignment DENGAN tracking_id dan id manual
            const insertQuery = `
                INSERT INTO rescue_assignments (
                    id, tracking_id, report_id, driver_id, shelter_id, assignment_status, assigned_at
                )
                VALUES ($1, $2, $3, $4, $5, 'assigned', NOW())
                RETURNING id, tracking_id
            `;
            
            // Perhatikan urutan parameter: [nextId, trackingId, reportId, driverId, shelterId]
            const res = await client.query(insertQuery, [nextId, trackingId, reportId, driverId, shelterId]);

            await client.query('COMMIT');
            return res.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // 4. Ambil Tugas Saya (History & Ongoing untuk Shelter)
    static async getMyAssignments(shelterId) {
        const query = `
            SELECT 
                ra.id, ra.tracking_id, ra.assignment_status, ra.assigned_at,
                r.location, r.description, r.photo,
                d.full_name as driver_name
            FROM rescue_assignments ra
            JOIN reports r ON ra.report_id = r.id
            JOIN drivers d ON ra.driver_id = d.id
            WHERE ra.shelter_id = $1
            ORDER BY ra.assigned_at DESC
        `;
        const result = await db.query(query, [shelterId]);
        
        return result.rows.map(row => ({
            ...row,
            photo: row.photo ? `/public/img/report_cat/${row.photo}` : '/img/NULL.JPG'
        }));
    }

    // 5. Update Status & Upload Bukti (Untuk Driver/Shelter)
    static async updateJobStatus(assignmentId, status, photoFileName = null) {
        let query = '';
        let params = [];

        if (status === 'in_transit') {
            // Status: Dijemput (Driver bawa kucing)
            query = `UPDATE rescue_assignments SET assignment_status = 'in_transit', pickup_photo = $1, pickup_time = NOW() WHERE id = $2`;
            params = [photoFileName, assignmentId];
        
        } else if (status === 'completed') {
            // Status: Selesai (Sampai Shelter)
            query = `UPDATE rescue_assignments SET assignment_status = 'completed', dropoff_photo = $1, completion_time = NOW() WHERE id = $2`;
            params = [photoFileName, assignmentId];
        
        } else {
            throw new Error('Status tidak valid');
        }

        await db.query(query, params);
        return { message: 'Status berhasil diperbarui' };
    }

    // 6. Ambil Detail Tracking (Untuk Halaman Tracking Page)
    static async getTrackingDetails(assignmentId) {
        const query = `
            SELECT 
                ra.id, ra.tracking_id, ra.assignment_status, ra.assigned_at, 
                ra.pickup_time, ra.completion_time, ra.pickup_photo, ra.dropoff_photo,
                
                r.location AS lokasi_jemput, 
                r.latitude AS lat_jemput, 
                r.longitude AS long_jemput,
                r.description, 
                r.photo AS foto_laporan,
                r.report_type,

                d.full_name AS driver_name, 
                d.license_info,
                d.contact_phone AS driver_phone, -- INI YANG BIKIN ERROR KALAU KOLOM GAK ADA
                
                dus.shelter_name, 
                dus.contact_phone AS shelter_phone,
                dus.latitude AS lat_tujuan,
                dus.longitude AS long_tujuan,

                dui.full_name AS pelapor_name,
                dui.contact_phone AS pelapor_phone

            FROM rescue_assignments ra
            JOIN reports r ON ra.report_id = r.id
            JOIN drivers d ON ra.driver_id = d.id
            JOIN users u_shelter ON ra.shelter_id = u_shelter.id
            JOIN detail_user_shelter dus ON u_shelter.id = dus.id
            JOIN users u_pelapor ON r.reporter_id = u_pelapor.id
            LEFT JOIN detail_user_individu dui ON u_pelapor.id = dui.id
            
            -- PERBAIKAN LOGIC PENCARIAN (Lebih Aman)
            WHERE ra.tracking_id = $1::text OR CAST(ra.id AS TEXT) = $1::text
        `;
        
        const result = await db.query(query, [assignmentId]);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];

        // Format Data untuk Frontend
        return {
            id: row.tracking_id || row.id, // Prioritaskan ID Keren
            db_id: row.id, // ID Asli untuk update API
            status: row.assignment_status,
            alamat: row.lokasi_jemput,
            tujuan: row.shelter_name,
            
            // Koordinat untuk Peta
            posisi_awal: [parseFloat(row.lat_jemput), parseFloat(row.long_jemput)],
            posisi_akhir: [parseFloat(row.lat_tujuan || -6.9175), parseFloat(row.long_tujuan || 107.6191)], // Default Bandung jika null
            
            kurir: {
                nama: row.driver_name,
                shelter: row.shelter_name,
                license: row.license_info,
                foto: '/img/profile_default.svg', 
                phone: row.driver_phone || '08123456789' // Default kalau null
            },
            
            laporan: {
                jenis: row.report_type,
                pemilik: row.pelapor_name || 'Anonim',
                lokasi: row.lokasi_jemput,
                deskripsi: row.description,
                foto: row.foto_laporan ? `/public/img/report_cat/${row.foto_laporan}` : '/img/placeholder.png'
            },

            // Foto Bukti dari Driver
            bukti: {
                pickup: row.pickup_photo ? `/public/img/rescue_proof/${row.pickup_photo}` : null,
                dropoff: row.dropoff_photo ? `/public/img/rescue_proof/${row.dropoff_photo}` : null
            }
        };
    }

    // 7. [BARU] Update Lokasi Driver (Dipanggil Driver setiap beberapa detik)
    static async updateDriverLocation(driverId, assignmentId, lat, long) {
        const query = `
            INSERT INTO driver_locations (driver_id, assignment_id, latitude, longitude, timestamp)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id, latitude, longitude, timestamp
        `;
        const result = await db.query(query, [driverId, assignmentId, lat, long]);
        return result.rows[0];
    }

    // 8. [BARU] Ambil Lokasi Terkini Driver (Dipanggil User/Shelter untuk memantau)
    static async getLatestLocation(assignmentId) {
        const query = `
            SELECT latitude, longitude, timestamp 
            FROM driver_locations 
            WHERE assignment_id = $1 
            ORDER BY timestamp DESC 
            LIMIT 1
        `;
        const result = await db.query(query, [assignmentId]);
        
        if (result.rows.length === 0) return null;
        
        return {
            lat: parseFloat(result.rows[0].latitude),
            long: parseFloat(result.rows[0].longitude),
            last_update: result.rows[0].timestamp
        };
    }

    static async getDriverByUserId(userId) {
        const query = `SELECT id FROM drivers WHERE user_id = $1`;
        const res = await db.query(query, [userId]);
        return res.rows[0]; // Return { id: 'DRV-...' }
    }

    // [BARU] Ambil Chat (Pakai created_at)
    static async getChatMessages(trackingId) {
        const query = `
            SELECT cm.id, cm.sender_id, cm.message, cm.created_at, u.role, u.username
            FROM chat_messages cm
            JOIN rescue_assignments ra ON cm.assignment_id = ra.id
            JOIN users u ON cm.sender_id = u.id
            WHERE ra.tracking_id = $1 OR CAST(ra.id AS TEXT) = $1
            ORDER BY cm.created_at ASC
        `;
        const res = await db.query(query, [trackingId]);
        return res.rows;
    }

    // [BARU] Kirim Chat (Pakai created_at)
    static async sendChatMessage(trackingId, senderId, message) {
        // 1. Cari ID Assignment
        const findQuery = `SELECT id FROM rescue_assignments WHERE tracking_id = $1 OR CAST(id AS TEXT) = $1`;
        const findRes = await db.query(findQuery, [trackingId]);
        
        if (findRes.rows.length === 0) throw new Error("Assignment tidak ditemukan");
        const assignmentIntId = findRes.rows[0].id;

        // 2. Insert Pesan
        const query = `
            INSERT INTO chat_messages (assignment_id, sender_id, message, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING id, message, created_at, sender_id
        `;
        const res = await db.query(query, [assignmentIntId, senderId, message]);
        return res.rows[0];
    }

    static async deleteChatMessage(messageId, userId) {
        // Query memastikan hanya menghapus jika ID pesan cocok DAN sender_id adalah user yang login
        const query = `
            DELETE FROM chat_messages 
            WHERE id = $1 AND sender_id = $2
            RETURNING id
        `;
        const result = await db.query(query, [messageId, userId]);
        
        if (result.rowCount === 0) {
            throw new Error("Gagal menghapus pesan (Mungkin bukan pesan Anda atau pesan tidak ditemukan)");
        }
        return true;
    }
}

module.exports = RescueService;