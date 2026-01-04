const ReportService = require('../services/ReportService');
const GamificationService = require('../services/GamificationService');
const { uploadToCloudinary } = require('../config/cloudinary');

class ReportController {
    static async create(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let imageUrl = null;

            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    // [MIGRASI] Upload ke Cloudinary folder 'cattake/reports'
                    const result = await uploadToCloudinary(buffer, 'cattake/reports');
                    imageUrl = result.secure_url;
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

            const reportData = {
                reporter_id: req.user.id,
                report_type: fields.report_type,
                lost_cat_id: fields.lost_cat_id ? parseInt(fields.lost_cat_id) : null,
                location: fields.location,
                latitude: fields.lat ? parseFloat(fields.lat) : 0,
                longitude: fields.long ? parseFloat(fields.long) : 0,
                description: fields.description,
                photo: imageUrl // Sekarang berisi URL lengkap
            };

            const result = await ReportService.createReport(reportData);
            
            // TRIGGER QUESTS
            const userId = req.user.id;
            if (reportData.report_type === 'stray') {
                GamificationService.updateProgress(userId, 'RESCUE_STRAY_COUNT', 1).catch(err => console.error("Quest Update Error:", err));
            } else if (reportData.report_type === 'missing') {
                GamificationService.updateProgress(userId, 'RESCUE_MISSING_COUNT', 1).catch(err => console.error("Quest Update Error:", err));
            }

            return reply.code(201).send({ message: 'Report submitted', data: result });

        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: error.message });
        }
    }

    static async getMyHistory(req, reply) {
        try {
            const userId = req.user.id;
            const history = await ReportService.getReportsByUser(userId);
            return reply.send(history);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = ReportController;
