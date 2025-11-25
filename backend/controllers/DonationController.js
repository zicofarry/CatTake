// backend/controllers/DonationController.js
const DonationService = require('../services/DonationService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

class DonationController {

    // POST /api/v1/donations
    static async create(req, reply) {
        try {
            // 1. Proses Multipart Form Data
            const parts = req.parts();
            
            let fields = {};
            let fileName = null;

            for await (const part of parts) {
                if (part.file) {
                    const fileExtension = path.extname(part.filename);
                    fileName = `proof-${Date.now()}${fileExtension}`;
                    
                    // Pastikan folder ada
                    const uploadDir = path.join(__dirname, '../public/img/proof_payment');
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    const savePath = path.join(uploadDir, fileName);
                    
                    await pump(part.file, fs.createWriteStream(savePath));
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            // 2. Validasi User Login
            const userId = req.user.id; 

            // 3. Susun data untuk Service
            const donationData = {
                donatur_id: userId,
                shelter_id: fields.shelter_id, 
                amount: fields.amount,
                is_anonymus: fields.is_anonymus === 'true' || fields.is_anonymus === '1' || fields.is_anonymus === true,
                payment_method: fields.payment_method,
                proof_file: fileName
            };

            // 4. Simpan ke DB
            const result = await DonationService.createDonation(donationData);
            
            // [2] PERBAIKAN LOGIKA GAMIFIKASI (Bungkus try-catch)
            // Agar jika sistem poin error, donasi tetap dianggap sukses
            try {
                // TRIGGER QUEST: Tambah nominal donasi ke progress
                if (fields.amount) {
                    GamificationService.updateProgress(userId, 'DONATION_AMOUNT', parseFloat(fields.amount))
                        .catch(err => console.error("Gamification Error (Async):", err));
                }
            } catch (gameErr) {
                console.error("Gamification Error (Sync):", gameErr);
            }

            return reply.code(201).send({ 
                status: 'success', 
                message: 'Donasi berhasil dikirim', 
                data: result 
            });

        } catch (error) {
            console.error("Error Donation Create:", error);
            return reply.code(500).send({ error: 'Gagal memproses donasi' });
        }
    }

    // GET /api/v1/donations/shelter/:shelterId
    static async getByShelter(req, reply) {
        try {
            const { shelterId } = req.params;
            const donations = await DonationService.getDonationsByShelter(shelterId);
            return reply.send(donations);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = DonationController;