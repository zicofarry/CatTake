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
                    // Ini adalah File (Bukti Transfer)
                    // Simpan ke folder public/images/proofs (Buat foldernya dulu!)
                    const fileExtension = path.extname(part.filename);
                    fileName = `proof-${Date.now()}${fileExtension}`;
                    const savePath = path.join(__dirname, '../public/img', fileName);
                    
                    await pump(part.file, fs.createWriteStream(savePath));
                } else {
                    // Ini adalah Field text (amount, shelter, dll)
                    fields[part.fieldname] = part.value;
                }
            }

            // 2. Validasi User Login (Dari Middleware JWT)
            const userId = req.user.id; 

            // 3. Susun data untuk Service
            const donationData = {
                donatur_id: userId,
                shelter_id: fields.shelter_id, // ID Shelter (integer)
                amount: fields.amount,
                is_anonymus: fields.is_anonymus === 'true', // Convert string to boolean
                payment_method: fields.payment_method,
                proof_file: fileName
            };

            // 4. Simpan ke DB
            const result = await DonationService.createDonation(donationData);

            return reply.code(201).send({ 
                status: 'success', 
                message: 'Donasi berhasil dikirim', 
                data: result 
            });

        } catch (error) {
            console.error(error);
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
