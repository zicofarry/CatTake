const AdoptionService = require('../services/AdoptionService');
const CatService = require('../services/CatService');
const { uploadToCloudinary } = require('../config/cloudinary');

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
            let identityUrl = null;
            let statementUrl = null;

            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    
                    // Cek fieldname sesuai yang dikirim frontend (identity_photo & statement_letter)
                    if (part.fieldname === 'identity_photo') {
                        const result = await uploadToCloudinary(buffer, 'cattake/identity');
                        identityUrl = result.secure_url;
                    } else if (part.fieldname === 'statement_letter') {
                        // Cloudinary otomatis handle PDF atau Image jika resource_type: 'auto'
                        const result = await uploadToCloudinary(buffer, 'cattake/statements');
                        statementUrl = result.secure_url;
                    }
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            // Validasi: Pastikan kedua file sudah terupload ke Cloudinary
            if (!identityUrl || !statementUrl) {
                return reply.code(400).send({ error: 'Mohon lengkapi Foto Identitas dan Surat Pernyataan.' });
            }

            const applicationData = {
                cat_id: fields.cat_id,
                applicant_id: req.user.id,
                nik: fields.nik,
                phone: fields.phone,
                job: fields.job,
                address: fields.address,
                identityPhoto: identityUrl,   // Simpan URL lengkap Cloudinary
                statementLetter: statementUrl // Simpan URL lengkap Cloudinary
            };

            const result = await AdoptionService.createAdoption(applicationData);
            
            return reply.code(201).send({ 
                status: 'success', 
                message: 'Pengajuan adopsi berhasil dikirim ke Cloudinary.',
                data: result 
            });

        } catch (error) {
            console.error("Adoption Error:", error);
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
            const { status, reason } = req.body; // 'approved' atau 'rejected'
            const shelterId = req.user.id;

            if (!['approved', 'rejected', 'completed'].includes(status)) {
                return reply.code(400).send({ error: 'Invalid status' });
            }

            await AdoptionService.verifyAdoption(id, status, shelterId, reason);
            
            return reply.send({ status: 'success', message: `Adoption request ${status}` });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: error.message });
        }
    }

    static async getMyAdoptions(req, reply) {
        try {
            const userId = req.user.id;
            const history = await AdoptionService.getUserAdoptions(userId);
            return reply.send(history);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async cancelAdoption(req, reply) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await AdoptionService.cancelAdoption(id, userId);
            return reply.send(result);
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    }

    static async getMyAdoptionDetail(req, reply) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const detail = await AdoptionService.getAdoptionDetail(id, userId);
            if (!detail) return reply.code(404).send({ error: 'Data tidak ditemukan' });
            return reply.send(detail);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // GET /api/v1/adopt/count-others/:cat_id/:adoption_id
    static async countOthers(req, reply) {
        try {
            const { cat_id, adoption_id } = req.params;
            const count = await AdoptionService.getOtherApplicantsCount(adoption_id, cat_id);
            return reply.send({ count });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = AdoptionController;
