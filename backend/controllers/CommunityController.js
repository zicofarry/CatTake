const CommunityService = require('../services/CommunityService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

class CommunityController {
    
    // 1. Ambil Semua Postingan
    static async getAll(req, reply) {
        try {
            const userId = req.user ? req.user.id : null;
            const posts = await CommunityService.getAllPosts(userId);
            return reply.send(posts);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // 2. Ambil Satu Postingan (INI YANG TADI HILANG/ERROR)
    static async getOne(req, reply) {
        try {
            const { id } = req.params;
            const post = await CommunityService.getPostById(id);
            return reply.send(post);
        } catch (error) {
            return reply.code(404).send({ error: error.message });
        }
    }

    // 3. Buat Postingan Baru
    static async create(req, reply) {
        try {
            const parts = req.parts();
            let content = '';
            let fileName = null;
            let title = ''; // <<< BARIS BARU: Inisialisasi title

            for await (const part of parts) {
                if (part.file) {
                    const fileExtension = path.extname(part.filename);
                    fileName = `post-${Date.now()}${fileExtension}`;
                    const savePath = path.join(__dirname, '../public/img', fileName);
                    await pump(part.file, fs.createWriteStream(savePath));
                } else {
                    if (part.fieldname === 'content') content = part.value;
                    else if (part.fieldname === 'title') title = part.value; // <<< BARIS BARU: Ambil nilai title
                }
            }

            const userId = req.user.id;
            // PASSING 'title' sebagai argumen kedua
            const newPost = await CommunityService.createPost(userId, title, content, fileName);
            
            return reply.code(201).send({ message: 'Post created', data: newPost });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // 4. Tambah Komentar
    static async addComment(req, reply) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.id;

            const newComment = await CommunityService.addComment(userId, id, content);
            return reply.code(201).send({ message: 'Comment added', data: newComment });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // 5. Like / Unlike Postingan
    static async toggleLike(req, reply) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await CommunityService.toggleLike(userId, id);
            return reply.send({ 
                status: 'success', 
                data: result 
            });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // 6. Ambil Data Sidebar (Event, Populer, Fakta)
    static async getSidebarData(req, reply) {
        try {
            const [events, popular, fact] = await Promise.all([
                CommunityService.getUpcomingEvents(),
                CommunityService.getPopularPosts(),
                CommunityService.getRandomFact()
            ]);

            return reply.send({
                status: 'success',
                data: {
                    events,
                    popular,
                    fact
                }
            });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async getAllFacts(req, reply) {
        try {
            const facts = await CommunityService.getAllFacts();
            return reply.send({
                status: 'success',
                data: facts
            });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = CommunityController;