const AdoptionService = require('../services/AdoptionService');
const CatService = require('../services/CatService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

class AdoptionController {
    // GET /api/v1/adopt/cats
    static async getCats(request, reply) {
        try {
            const userId = request.user ? request.user.id : null;

            // Oper userId ke Service
            const cats = await CatService.getAvailableCats(userId);
            
            return reply.send(cats);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // POST /api/v1/adopt/apply
    static async applyAdoption(req, reply) {
        try {
            // 1. Cek Login
            if (!req.user || !req.user.id) {
                return reply.code(401).send({ error: 'Unauthorized.' });
            }

            const parts = req.parts();
            let fields = {};
            let identityFileName = null;
            let statementFileName = null;

            // 2. Loop semua bagian dari form-data
            for await (const part of parts) {
                if (part.file) {
                    // Cek fieldname untuk membedakan file
                    const fileExt = path.extname(part.filename);
                    const timestamp = Date.now();
                    
                    if (part.fieldname === 'identity_photo') {
                        // Simpan Foto KTP
                        identityFileName = `ktp-${req.user.id}-${timestamp}${fileExt}`;
                        await pump(part.file, fs.createWriteStream(path.join(__dirname, '../public/img', identityFileName)));
                    
                    } else if (part.fieldname === 'statement_letter') {
                        // Simpan Surat Pernyataan
                        statementFileName = `stmt-${req.user.id}-${timestamp}${fileExt}`;
                        await pump(part.file, fs.createWriteStream(path.join(__dirname, '../public/img', statementFileName)));
                    } else {
                        // File tak dikenal, abaikan tapi konsumsi streamnya agar tidak hang
                        part.file.resume();
                    }
                } else {
                    // Simpan text fields
                    fields[part.fieldname] = part.value;
                }
            }

            // 3. Validasi File (Backend Validation)
            if (!identityFileName || !statementFileName) {
                return reply.code(400).send({ error: 'Both Identity Photo and Statement Letter are required.' });
            }

            // 4. Susun data untuk Service
            const applicationData = {
                cat_id: fields.cat_id,
                applicant_id: req.user.id,
                
                // Data Profile User
                nik: fields.nik,
                phone: fields.phone,
                job: fields.job,
                address: fields.address,
                identityPhoto: identityFileName, // File KTP -> masuk ke detail_user_individu
                
                // Data Adopsi
                statementLetter: statementFileName // File Surat -> masuk ke adoptions
            };

            // 5. Panggil Service
            const result = await AdoptionService.createAdoption(applicationData);
            return reply.code(201).send({ 
                status: 'success', 
                message: 'Pengajuan adopsi berhasil dikirim. Menunggu verifikasi shelter.',
                data: result 
            });

        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: error.message });
        }
    }

    // GET /api/v1/adopt/reports/:shelterId
    static async getShelterReports(request, reply) {
        try {
            const { shelterId } = request.params;
            const reports = await AdoptionService.getAdoptionReportsByShelter(shelterId);
            return reply.send(reports);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = AdoptionController;
