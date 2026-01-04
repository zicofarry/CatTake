// backend/controllers/LostCatController.js
const LostCatService = require('../services/LostCatService');
const CommunityService = require('../services/CommunityService');
const GamificationService = require('../services/GamificationService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);
const sharp = require('sharp');

class LostCatController {

    static async create(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let fileName = null;

            for await (const part of parts) {
                if (part.file) {
                    fileName = `lost-${Date.now()}.jpeg`;
                    const savePath = path.join(__dirname, '../public/img/lost_cat', fileName);
                    
                    const buffer = await part.toBuffer();
                    await sharp(buffer)
                        .resize(800, null, { withoutEnlargement: true })
                        .jpeg({ quality: 80 })
                        .toFile(savePath);
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
                // Koordinat opsional
                last_seen_lat: fields.last_seen_lat ? parseFloat(fields.last_seen_lat) : null,
                last_seen_long: fields.last_seen_long ? parseFloat(fields.last_seen_long) : null,
                reward_amount: fields.reward_amount ? parseFloat(fields.reward_amount) : 0,
                photo: fileName
            };

            const newReport = await LostCatService.createLostCatReport(lostCatData);
            
            // --- NEW LOGIC: TRIGGER QUESTS ---
            GamificationService.updateProgress(req.user.id, 'LOST_REPORT_COUNT', 1).catch(err => console.error("Quest Update Error:", err));
            // ---------------------------------
            
            // [FITUR BARU] Auto Post ke Komunitas jika dicentang
            if (fields.share_to_community === 'true' || fields.share_to_community === 'on' || fields.share_to_community === true) {
                
                const postTitle = `[DICARI] ${fields.name} Hilang!`;
                const postContent = `Halo teman-teman, kucing saya hilang.\n\nNama: ${fields.name}\nCiri-ciri: ${fields.description}\nLokasi Terakhir: ${fields.last_seen_address}\n\nMohon bantuannya jika melihat. Bisa hubungi saya atau lapor di menu Kucing Hilang. Terima kasih.`;
                
                // Kita reuse fileName yang sama (sudah ada di folder lost_cat)
                // Service Community sudah kita update untuk handle prefix 'lost-'
                await CommunityService.createPost(req.user.id, postTitle, postContent, fileName);
            }

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

    // [BARU] Endpoint khusus untuk halaman LostCatListPage (Format Data Frontend)
    static async getList(req, reply) {
        try {
            const list = await LostCatService.getAllLostCats();
            
            // Mapping data agar sesuai properti yang diminta Vue (image, owner, reward, dll)
            const formattedList = list.map(cat => ({
                id: cat.id,
                name: cat.name,
                image: cat.photo, // Service sudah memformat path ini
                owner: cat.owner_name,
                breed: cat.breed,
                age: cat.age,
                color: cat.color,
                address: cat.last_seen_address,
                description: cat.description,
                reward: cat.reward_amount
            }));

            return reply.send({
                status: 'success',
                data: formattedList
            });
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

    static async getMyHistory(req, reply) {
        try {
            const userId = req.user.id; // Diambil dari middleware authentication
            const list = await LostCatService.getMyLostCats(userId);
            
            return reply.send(list);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async updateStatus(req, reply) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user.id; // Dari middleware authentication

            // 1. Cek dulu apakah benar ini kucing milik user yang login
            const checkQuery = 'SELECT owner_id FROM lost_cats WHERE id = $1';
            const checkResult = await db.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                return reply.code(404).send({ error: 'Data tidak ditemukan' });
            }

            if (checkResult.rows[0].owner_id !== userId) {
                return reply.code(403).send({ error: 'Kamu tidak berhak mengubah status ini' });
            }

            // 2. Jalankan update lewat service
            await LostCatService.updateStatus(id, status);
            
            return reply.send({ message: 'Status berhasil diperbarui' });
        } catch (error) {
            console.error("Update Status Error:", error);
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = LostCatController;