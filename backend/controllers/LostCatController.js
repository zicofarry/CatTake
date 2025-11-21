// backend/controllers/LostCatController.js
const LostCatService = require('../services/LostCatService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

class LostCatController {

    static async create(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let fileName = null;

            for await (const part of parts) {
                if (part.file) {
                    const fileExtension = path.extname(part.filename);
                    fileName = `lost-${Date.now()}${fileExtension}`;
                    const savePath = path.join(__dirname, '../public/img', fileName);
                    await pump(part.file, fs.createWriteStream(savePath));
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            // Validasi user login
            if (!req.user || !req.user.id) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const lostCatData = {
                owner_id: req.user.id,
                name: fields.name,
                age: parseInt(fields.age || 0),
                breed: fields.breed,
                color: fields.color,
                description: fields.description,
                last_seen_address: fields.last_seen_address,
                // Koordinat opsional (kalau user tidak klik peta)
                last_seen_lat: fields.last_seen_lat ? parseFloat(fields.last_seen_lat) : null,
                last_seen_long: fields.last_seen_long ? parseFloat(fields.last_seen_long) : null,
                reward_amount: fields.reward_amount ? parseFloat(fields.reward_amount) : 0,
                photo: fileName
            };

            const newReport = await LostCatService.createLostCatReport(lostCatData);
            
            return reply.code(201).send({ 
                message: 'Laporan kehilangan berhasil dibuat', 
                data: newReport 
            });

        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: error.message });
        }
    }

    static async getAll(req, reply) {
        try {
            const list = await LostCatService.getAllLostCats();
            return reply.send(list);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async search(req, reply) {
        try {
            const { q } = req.query; // Ambil query param ?q=...
            if (!q) return reply.send([]);

            const results = await LostCatService.searchLostCats(q);
            return reply.send(results);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = LostCatController;
