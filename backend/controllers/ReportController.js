const ReportService = require('../services/ReportService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

class ReportController {
    static async create(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let fileName = null;

            for await (const part of parts) {
                if (part.file) {
                    const fileExtension = path.extname(part.filename);
                    fileName = `report-${Date.now()}${fileExtension}`;
                    const savePath = path.join(__dirname, '../public/img/report_cat', fileName);
                    await pump(part.file, fs.createWriteStream(savePath));
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

            const reportData = {
                reporter_id: req.user.id,
                // Logika mapping tipe laporan
                report_type: fields.report_type === 'stray' ? 'Abandoned' : fields.report_type, 
                
                // PERBAIKAN DISINI: Ambil lost_cat_id
                lost_cat_id: fields.lost_cat_id ? parseInt(fields.lost_cat_id) : null,

                location: fields.location,
                latitude: fields.lat ? parseFloat(fields.lat) : 0,
                longitude: fields.long ? parseFloat(fields.long) : 0,
                description: fields.description,
                photo: fileName
            };

            const result = await ReportService.createReport(reportData);
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
