// backend/controllers/DonationController.js
const DonationService = require('../services/DonationService');
const GamificationService = require('../services/GamificationService');
const { uploadToCloudinary } = require('../config/cloudinary');


class DonationController {

    // POST /api/v1/donations
static async create(req, reply) {
        try {
            // 1. Proses Multipart Form Data
            const parts = req.parts();
            
            let fields = {};
            let imageUrl = null;

            for await (const part of parts) {
                if (part.file) {
                    // Ambil buffer file
                    const buffer = await part.toBuffer();
                    
                    // [MIGRASI] Upload ke Cloudinary folder 'cattake/payments'
                    const result = await uploadToCloudinary(buffer, 'cattake/payments');
                    imageUrl = result.secure_url;
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
                proof_file: imageUrl // Sekarang berisi URL lengkap Cloudinary
            };

            // 4. Simpan ke DB
            const result = await DonationService.createDonation(donationData);
            
            // PERBAIKAN LOGIKA GAMIFIKASI (Bungkus try-catch)
            try {
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