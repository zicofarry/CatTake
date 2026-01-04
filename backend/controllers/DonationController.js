// backend/controllers/DonationController.js
const DonationService = require('../services/DonationService');
const GamificationService = require('../services/GamificationService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const sharp = require('sharp');

class DonationController {

    static async create(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let fileName = null;

            for await (const part of parts) {
                if (part.file) {
                    fileName = `proof-${Date.now()}.jpeg`;
                    const uploadDir = path.join(__dirname, '../public/img/proof_payment');
                    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

                    const savePath = path.join(uploadDir, fileName);
                    const buffer = await part.toBuffer();
                    await sharp(buffer)
                        .resize(800, null, { withoutEnlargement: true })
                        .jpeg({ quality: 80 })
                        .toFile(savePath);
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            const userId = req.user.id; 

            const donationData = {
                donatur_id: userId,
                shelter_id: fields.shelter_id, 
                amount: fields.amount,
                is_anonymus: fields.is_anonymus === 'true' || fields.is_anonymus === '1' || fields.is_anonymus === true,
                payment_method: fields.payment_method,
                proof_file: fileName
            };

            const result = await DonationService.createDonation(donationData);
            
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

    // [PERBAIKAN] Menambahkan fungsi untuk mengambil riwayat donasi pribadi
    static async getMyHistory(req, reply) {
        try {
            const userId = req.user.id;
            const history = await DonationService.getUserDonations(userId);
            return reply.send(history);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

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