const RescueService = require('../services/RescueService');
const { uploadToCloudinary } = require('../config/cloudinary');

class RescueController {
    
    // GET /api/v1/rescue/incoming
    static async getIncoming(req, reply) {
        try {
            const reports = await RescueService.getIncomingReports(); 
            return reply.send(reports);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // GET /api/v1/rescue/drivers
    static async getDrivers(req, reply) {
        try {
            // Ambil ID Shelter dari Token JWT
            const shelterId = req.user.id;
            const drivers = await RescueService.getShelterDrivers(shelterId);
            return reply.send(drivers);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // POST /api/v1/rescue/accept (Shelter mengambil job)
    static async acceptJob(req, reply) {
        try {
            const { reportId, driverId } = req.body;
            const shelterId = req.user.id;

            if (!reportId || !driverId) {
                return reply.code(400).send({ error: 'Report ID dan Driver ID harus diisi.' });
            }

            const result = await RescueService.assignJob(shelterId, reportId, driverId);
            return reply.send({ 
                message: 'Berhasil mengambil laporan!', 
                data: result // Berisi { id, tracking_id }
            });
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    }

    // GET /api/v1/rescue/my-tasks (List tugas shelter)
    static async getMyTasks(req, reply) {
        try {
            const shelterId = req.user.id;
            const tasks = await RescueService.getMyAssignments(shelterId);
            return reply.send(tasks);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // POST /api/v1/rescue/update-status (Driver update status + foto)
    static async updateStatus(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let imageUrl = null;

            // Proses Multipart (File + Text)
            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    // [MIGRASI] Upload ke Cloudinary folder 'cattake/rescue'
                    const result = await uploadToCloudinary(buffer, 'cattake/rescue');
                    imageUrl = result.secure_url;
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            if (!fields.assignmentId || !fields.status) {
                return reply.code(400).send({ error: 'Data tidak lengkap (assignmentId, status)' });
            }

            // Panggil Service dengan URL Cloudinary
            await RescueService.updateJobStatus(fields.assignmentId, fields.status, imageUrl);
            
            return reply.send({ message: 'Status berhasil diupdate', photo: imageUrl });

        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: error.message });
        }
    }

    // GET /api/v1/rescue/tracking/:id
    static async getTrackingDetail(req, reply) {
        try {
            const { id } = req.params;
            const detail = await RescueService.getTrackingDetails(id);
            
            if (!detail) {
                return reply.code(404).send({ error: 'Tracking data not found' });
            }
            
            return reply.send(detail);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // POST /api/v1/rescue/location (Driver update posisi)
    static async updateLocation(req, reply) {
        try {
            // Pastikan yang akses adalah driver (opsional: cek role di token)
            const driverId = req.user.id; // Asumsi ID di token sama dengan ID di tabel drivers (perlu penyesuaian jika beda)
            // Note: Di tabel drivers kamu, ID-nya VARCHAR (DRV-...). 
            // Jika req.user.id adalah INT (user_id), kita perlu query cari driver_id nya dulu.
            // Untuk simpelnya sekarang, kita minta driver_id dikirim di body atau kita cari.
            
            // Solusi cepat: Kita cari driver_id berdasarkan user_id yang login
            const driverData = await RescueService.getDriverByUserId(req.user.id); // Kita buat helper ini nanti
            if (!driverData) return reply.code(403).send({ error: 'Anda bukan driver' });

            const { assignmentId, lat, long } = req.body;

            if (!assignmentId || !lat || !long) {
                return reply.code(400).send({ error: 'Data lokasi tidak lengkap' });
            }

            const result = await RescueService.updateDriverLocation(driverData.id, assignmentId, lat, long);
            
            return reply.send({ status: 'success', data: result });

        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // GET /api/v1/rescue/location/:assignmentId (User/Shelter melihat posisi)
    static async getLocation(req, reply) {
        try {
            const { assignmentId } = req.params;
            const location = await RescueService.getLatestLocation(assignmentId);
            
            if (!location) {
                return reply.send({ status: 'waiting', message: 'Belum ada data lokasi' });
            }

            return reply.send({ status: 'success', data: location });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // GET /api/v1/rescue/chat/:id
    static async getChats(req, reply) {
        try {
            const { id } = req.params; // id = tracking_id (RES-BDG-...)
            const chats = await RescueService.getChatMessages(id);
            return reply.send(chats);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // POST /api/v1/rescue/chat
    static async sendChat(req, reply) {
        try {
            const { trackingId, message } = req.body;
            const senderId = req.user.id; // Ambil dari Token User yang login

            if (!message || !trackingId) {
                return reply.code(400).send({ error: "Data message dan trackingId wajib diisi" });
            }

            const result = await RescueService.sendChatMessage(trackingId, senderId, message);
            return reply.send(result);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async deleteChat(req, reply) {
        try {
            const { messageId } = req.params;
            const userId = req.user.id; // Ambil ID user yang sedang login

            // Panggil service (kirim userId untuk validasi keamanan)
            await RescueService.deleteChatMessage(messageId, userId);
            
            return reply.send({ message: 'Pesan dihapus' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async clearChat(req, reply) {
        try {
            const { trackingId } = req.params;
            // Kita panggil service untuk hapus semua chat berdasarkan trackingId
            await RescueService.clearChatMessages(trackingId); 
            return reply.send({ message: 'Semua pesan chat berhasil dibersihkan.' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // GET /api/v1/rescue/driver/tasks
   static async getDriverTasks(req, reply) {
        try {
            // 1. Ambil ID Driver berdasarkan User ID yang login
            const userId = req.user.id; 
            const driver = await RescueService.getDriverByUserId(userId);
            
            if (!driver) {
                return reply.code(404).send({ error: "Profil driver tidak ditemukan." });
            }

            // 2. Ambil Tugas
            const tasks = await RescueService.getDriverTasks(driver.id);
            
            return reply.send({
                status: 'success',
                data: tasks
            });
        } catch (error) {
            console.error("Error fetching driver tasks:", error);
            return reply.code(500).send({ error: error.message });
        }
    }

    static async getShelterRescuedCats(req, reply) {
        try {
            const shelterId = req.user.id;
            const data = await RescueService.getShelterRescuedCats(shelterId);
            return reply.send(data);
        } catch (error) { return reply.code(500).send({ error: error.message }); }
    }

    static async returnToOwner(req, reply) {
        try {
            const { lostCatId } = req.body;
            await RescueService.markAsReturned(lostCatId);
            return reply.send({ message: 'Kucing berhasil dikembalikan.' });
        } catch (error) { return reply.code(500).send({ error: error.message }); }
    }

    static async moveToAdoption(req, reply) {
        try {
            // Kita butuh data kucing baru (Nama, Gender, dll)
            // Dan ID Report asalnya untuk referensi foto
            const { reportId, name, breed, age, gender, description, photoPath } = req.body;
            const shelterId = req.user.id;

            const catData = { name, breed, age, gender, description, photo: photoPath };
            
            await RescueService.moveStrayToAdoption(shelterId, reportId, catData);
            return reply.send({ message: 'Berhasil masuk ke daftar adopsi.' });
        } catch (error) { return reply.code(500).send({ error: error.message }); }
    }
}

module.exports = RescueController;