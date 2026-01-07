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
            photo: row.photo && row.photo.startsWith('http') ? row.photo : `${row.photo || '/img/null.png'}`,
            profile_picture: row.profile_picture && row.profile_picture.startsWith('http') ? row.profile_picture : `${row.profile_picture || '/img/null.png'}`
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
            photo: row.photo ? `${row.photo}` : '/img/null.png'
        }));
    }

    // 5. Update Status & Upload Bukti (Update Logic Status lost_cats)
    static async updateJobStatus(assignmentId, status, photoFileName = null) {
        let query = '';
        let params = [];

        if (status === 'in_transit') {
            // Status: Dijemput (Driver bawa kucing)
            query = `UPDATE rescue_assignments SET assignment_status = 'in_transit', pickup_photo = $1, pickup_time = NOW() WHERE id = $2`;
            params = [photoFileName, assignmentId];
            
            // Eksekusi langsung untuk in_transit
            await db.query(query, params);

        } else if (status === 'completed') {
            // Status: Selesai (Sampai Shelter)
            // PERUBAHAN: Tambahkan "RETURNING report_id" agar kita tahu laporan mana yang selesai
            query = `UPDATE rescue_assignments SET assignment_status = 'completed', dropoff_photo = $1, completion_time = NOW() WHERE id = $2 RETURNING report_id`;
            params = [photoFileName, assignmentId];
            
            // Eksekusi query dan simpan hasilnya
            const res = await db.query(query, params);

            // --- LOGIKA TAMBAHAN: Update status lost_cats jadi 'at_shelter' ---
            if (res.rows.length > 0) {
                const reportId = res.rows[0].report_id;
                
                // Cek apakah report ini terhubung ke data kucing hilang (lost_cat_id)
                const checkReport = await db.query(`SELECT lost_cat_id FROM reports WHERE id = $1`, [reportId]);
                const lostCatId = checkReport.rows[0]?.lost_cat_id;

                // Jika ada ID Kucing Hilang, update statusnya
                if (lostCatId) {
                    await db.query(`UPDATE lost_cats SET status = 'at_shelter' WHERE id = $1`, [lostCatId]);
                }
            }
            // ------------------------------------------------------------------

        } else {
            throw new Error('Status tidak valid');
        }

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
                d.contact_phone AS driver_phone,
                d.profile_picture AS driver_foto, -- Ambil foto profil driver
                
                dus.shelter_name, 
                dus.contact_phone AS shelter_phone,
                dus.latitude AS lat_tujuan,
                dus.longitude AS long_tujuan,

                dui.full_name AS pelapor_name,
                dui.contact_phone AS pelapor_phone,
                dui.profile_picture AS pelapor_foto -- Ambil foto profil pelapor

            FROM rescue_assignments ra
            JOIN reports r ON ra.report_id = r.id
            -- Gunakan LEFT JOIN untuk driver agar tidak error jika driver dihapus/null
            LEFT JOIN drivers d ON ra.driver_id = d.id
            LEFT JOIN users u_shelter ON ra.shelter_id = u_shelter.id
            LEFT JOIN detail_user_shelter dus ON u_shelter.id = dus.id
            LEFT JOIN users u_pelapor ON r.reporter_id = u_pelapor.id
            LEFT JOIN detail_user_individu dui ON u_pelapor.id = dui.id
            
            WHERE ra.tracking_id = $1::text OR CAST(ra.id AS TEXT) = $1::text
        `;
        
        const result = await db.query(query, [assignmentId]);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];

        return {
            id: row.tracking_id || row.id, 
            db_id: row.id, 
            status: row.assignment_status,
            alamat: row.lokasi_jemput,
            tujuan: row.shelter_name || 'Shelter',
            
            posisi_awal: [parseFloat(row.lat_jemput || 0), parseFloat(row.long_jemput || 0)],
            posisi_akhir: [parseFloat(row.lat_tujuan || -6.9175), parseFloat(row.long_tujuan || 107.6191)],
            
            kurir: {
                nama: row.driver_name || 'Menunggu Driver',
                shelter: row.shelter_name,
                license: row.license_info,
                // Pastikan path foto driver benar
                foto: row.driver_foto && row.driver_foto.startsWith('http') ? row.driver_foto : `${row.driver_foto}`,
                phone: row.driver_phone || '-'
            },
            
            laporan: {
                jenis: row.report_type,
                pemilik: row.pelapor_name || 'Anonim',
                phone: row.pelapor_phone || '-',
                // Pastikan path foto pelapor benar
                foto_profil: row.pelapor_foto ? `${row.pelapor_foto}` : null,
                lokasi: row.lokasi_jemput,
                deskripsi: row.description,
                foto: row.foto_laporan && row.foto_laporan.startsWith('http') ? row.foto_laporan : `${row.foto_laporan}`,
            },

            bukti: {
                pickup: row.pickup_photo && row.pickup_photo.startsWith('http') ? row.pickup_photo : `${row.pickup_photo}`,
                dropoff: row.dropoff_photo && row.dropoff_photo.startsWith('http') ? row.dropoff_photo : `${row.dropoff_photo}`
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

    static async getDriverTasks(driverId) {
        const query = `
            SELECT 
                ra.id, 
                ra.tracking_id, 
                ra.assignment_status as status, 
                ra.assigned_at as "createdAt",
                r.id as report_id, 
                r.location, 
                r.description, 
                r.photo, 
                r.report_type, 
                lc.name as cat_name
            FROM rescue_assignments ra
            JOIN reports r ON ra.report_id = r.id
            LEFT JOIN lost_cats lc ON r.lost_cat_id = lc.id
            WHERE ra.driver_id = $1
            ORDER BY ra.assigned_at DESC
        `;
        const res = await db.query(query, [driverId]);
        
        // Format return agar sesuai dengan ekspektasi Frontend (item.report.location)
        return res.rows.map(row => ({
            id: row.id,
            trackingId: row.tracking_id,
            status: row.status,
            createdAt: row.createdAt,
            report: {
                id: row.report_id,
                location: row.location,
                cat_name: row.cat_name || (row.report_type === 'missing' ? 'Kucing Hilang' : 'Kucing Liar'),
                photo: row.photo ? `${row.photo}` : '/img/null.png'
            }
        }));
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

    static async clearChatMessages(trackingId) {
        // 1. Cari dulu ID assignment-nya (karena tabel chat pakai ID integer)
        const findQuery = `SELECT id FROM rescue_assignments WHERE tracking_id = $1 OR CAST(id AS TEXT) = $1`;
        const findRes = await db.query(findQuery, [trackingId]);
        
        if (findRes.rows.length === 0) throw new Error("Assignment tidak ditemukan");
        const assignmentIntId = findRes.rows[0].id;

        // 2. Hapus semua chat untuk assignment tersebut
        const query = `DELETE FROM chat_messages WHERE assignment_id = $1`;
        await db.query(query, [assignmentIntId]);
        return true;
    }

    static async getShelterRescuedCats(shelterId) {
        const query = `
            SELECT 
                ra.id as assignment_id,
                r.id as report_id,
                r.report_type,
                r.photo,
                r.description,
                r.location,
                r.is_converted,
                ra.completion_time,
                lc.id as lost_cat_id,
                lc.name as lost_cat_name,
                lc.owner_id,
                lc.status as lost_cat_status,
                
                -- Ambil Nama, Telepon, dan Email
                COALESCE(dui.full_name, u.username) as owner_name,
                dui.contact_phone, 
                u.email
                
            FROM rescue_assignments ra
            JOIN reports r ON ra.report_id = r.id
            LEFT JOIN lost_cats lc ON r.lost_cat_id = lc.id
            LEFT JOIN users u ON lc.owner_id = u.id
            LEFT JOIN detail_user_individu dui ON u.id = dui.id
            
            WHERE ra.shelter_id = $1 
            AND ra.assignment_status = 'completed'
            ORDER BY ra.completion_time DESC
        `;
        const result = await db.query(query, [shelterId]);
        
        return result.rows.map(row => ({
            ...row,
            photo: row.photo ? `${row.photo}` : '/img/null.png',
            display_name: row.report_type === 'missing' ? row.lost_cat_name : 'Kucing Liar (Rescue)',
            is_processed: row.lost_cat_status === 'returned',
            
            // [LOGIKA KONTAK]: Prioritaskan Telepon, jika kosong pakai Email
            owner_contact: row.contact_phone || row.email
        }));
    }

    // [BARU] Aksi: Kembalikan ke Pemilik
    static async markAsReturned(lostCatId) {
        await db.query(`UPDATE lost_cats SET status = 'returned' WHERE id = $1`, [lostCatId]);
        return { message: 'Status diupdate menjadi Returned' };
    }

    // [BARU] Aksi: Pindahkan Stray ke Kucing Adopsi
    static async moveStrayToAdoption(shelterId, reportId, catData) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Insert ke tabel CATS (Tetap sama)
            const insertQuery = `
                INSERT INTO cats (
                    shelter_id, name, breed, age, gender, 
                    health_status, description, adoption_status, photo
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'available', $8)
                RETURNING id
            `;
            const values = [
                shelterId, catData.name, catData.breed, catData.age, catData.gender,
                'healthy', catData.description, catData.photo
            ];
            await client.query(insertQuery, values);

            // 2. [BARU] Update report jadi is_converted = true
            await client.query(`UPDATE reports SET is_converted = true WHERE id = $1`, [reportId]);

            await client.query('COMMIT');
            return { message: 'Kucing berhasil dipindahkan ke daftar adopsi' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = RescueService;