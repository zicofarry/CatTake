const AdoptionService = require('../services/AdoptionService');
const CatService = require('../services/CatService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);
const sharp = require('sharp');

const ensureDir = async (dirPath) => {
    try {
        await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
};

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
            if (!req.user || !req.user.id) {
                return reply.code(401).send({ error: 'Unauthorized.' });
            }

            const parts = req.parts();
            let fields = {};
            let identityFileName = null;
            let statementFileName = null;

            // Tentukan path folder tujuan
            const identityDir = path.join(__dirname, '../public/img/identity');
            const statementDir = path.join(__dirname, '../public/docs/stmt');

            // Buat folder jika belum ada
            await ensureDir(identityDir);
            await ensureDir(statementDir);

            for await (const part of parts) {
                if (part.file) {
                    const fileExt = path.extname(part.filename).toLowerCase();
                    const timestamp = Date.now();
                    
                    if (part.fieldname === 'identity_photo') {
                        // Simpan KTP (Image) -> COMPRESS
                        identityFileName = `ktp-${req.user.id}-${timestamp}.jpeg`;
                        const savePath = path.join(identityDir, identityFileName);
                        
                        const buffer = await part.toBuffer();
                        await sharp(buffer).resize(800).jpeg({ quality: 80 }).toFile(savePath);
                    
                    } else if (part.fieldname === 'statement_letter') {
                        // Surat Pernyataan -> Cek tipe file
                        if (fileExt === '.pdf') {
                            // PDF -> Save Normal
                            statementFileName = `stmt-${req.user.id}-${timestamp}.pdf`;
                            const savePath = path.join(statementDir, statementFileName);
                            await pump(part.file, fs.createWriteStream(savePath));
                        } else {
                            // Image -> Compress
                            statementFileName = `stmt-${req.user.id}-${timestamp}.jpeg`;
                            const savePath = path.join(statementDir, statementFileName);
                            const buffer = await part.toBuffer();
                            await sharp(buffer).resize(1024).jpeg({ quality: 80 }).toFile(savePath);
                        }
                    } else {
                        part.file.resume();
                    }
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            if (!identityFileName || !statementFileName) {
                return reply.code(400).send({ error: 'Mohon lengkapi Foto Identitas dan Surat Pernyataan (PDF).' });
            }

            const applicationData = {
                cat_id: fields.cat_id,
                applicant_id: req.user.id,
                nik: fields.nik,
                phone: fields.phone,
                job: fields.job,
                address: fields.address,
                identityPhoto: identityFileName, 
                statementLetter: statementFileName
            };

            const result = await AdoptionService.createAdoption(applicationData);
            return reply.code(201).send({ 
                status: 'success', 
                message: 'Pengajuan adopsi berhasil dikirim.',
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
            const shelterId = request.user.id; 

            if (!shelterId) {
                return reply.code(401).send({ error: 'Unauthorized Access' });
            }

            const reports = await AdoptionService.getAdoptionReportsByShelter(shelterId);
            return reply.send(reports);
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: error.message });
        }
    }

    static async verifyAdoption(req, reply) {
        try {
            const { id } = req.params; // ID Adopsi
            const { status } = req.body; // 'approved' atau 'rejected'
            const shelterId = req.user.id;

            if (!['approved', 'rejected', 'completed'].includes(status)) {
                return reply.code(400).send({ error: 'Invalid status' });
            }

            await AdoptionService.verifyAdoption(id, status, shelterId);
            
            return reply.send({ status: 'success', message: `Adoption request ${status}` });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = AdoptionController;
