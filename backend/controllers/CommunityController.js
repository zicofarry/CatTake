const CommunityService = require('../services/CommunityService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

class CommunityController {
    
    static async getAll(req, reply) {
        try {
            const userId = req.user ? req.user.id : null;
            const posts = await CommunityService.getAllPosts(userId);
            return reply.send(posts);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async getOne(req, reply) {
        try {
            const { id } = req.params;
            const post = await CommunityService.getPostById(id);
            return reply.send(post);
        } catch (error) {
            return reply.code(404).send({ error: error.message });
        }
    }

    static async create(req, reply) {
        try {
            const parts = req.parts();
            let content = '';
            let fileName = null;
            let title = ''; 

            for await (const part of parts) {
                if (part.file) {
                    const fileExtension = path.extname(part.filename);
                    fileName = `post-${Date.now()}${fileExtension}`;
                    
                    // [PERBAIKAN] Simpan ke folder public/img/post
                    const uploadDir = path.join(__dirname, '../public/img/post');
                    
                    // Buat folder jika belum ada
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    const savePath = path.join(uploadDir, fileName);
                    await pump(part.file, fs.createWriteStream(savePath));
                } else {
                    if (part.fieldname === 'content') content = part.value;
                    else if (part.fieldname === 'title') title = part.value; 
                }
            }

            const userId = req.user.id;
            const newPost = await CommunityService.createPost(userId, title, content, fileName);
            
            return reply.code(201).send({ message: 'Post created', data: newPost });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // [BARU] Handler Update Post
    static async updatePost(req, reply) {
        try {
            const { id } = req.params;
            // Kita handle text content dulu, update gambar butuh logic upload terpisah jika mau kompleks
            const { title, content } = req.body; 
            const userId = req.user.id;

            await CommunityService.updatePost(userId, id, title, content);
            return reply.send({ message: 'Post updated successfully' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // [BARU] Handler Delete Post
    static async deletePost(req, reply) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // 1. Hapus dari Database & Ambil Data Postingan
            const deletedPost = await CommunityService.deletePost(userId, id);

            // 2. Hapus File Fisik (Hanya jika file ada dan berawalan 'post-')
            // Kita filter 'post-' agar tidak tidak sengaja menghapus gambar 'lost-' (kucing hilang) 
            // yang mungkin masih dipakai di menu Laporan Kehilangan.
            if (deletedPost.media_path && deletedPost.media_path.startsWith('post-')) {
                
                const filePath = path.join(__dirname, '../public/img/post', deletedPost.media_path);
                
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath); // Hapus file
                        console.log(`[File Deleted] ${filePath}`);
                    }
                } catch (err) {
                    console.error("[File Error] Gagal menghapus file fisik:", err);
                    // Kita tidak throw error di sini agar response ke user tetap sukses (karena DB sudah kehapus)
                }
            }

            return reply.send({ message: 'Post deleted successfully' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

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

    static async replyComment(req, reply) {
        try {
            const { commentId } = req.params;
            const { content, parentReplyId } = req.body;
            const userId = req.user.id;

            if (!content) return reply.code(400).send({ error: 'Konten tidak boleh kosong' });

            const newReply = await CommunityService.addReply(userId, commentId, content, parentReplyId);
            return reply.code(201).send({ message: 'Reply added', data: newReply });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async toggleLike(req, reply) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await CommunityService.toggleLike(userId, id);
            return reply.send({ status: 'success', data: result });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // [PERBAIKAN UTAMA DI SINI]
    // Menggunakan method service yang sudah mengembalikan 'missing'
    static async getSidebarData(req, reply) {
        try {
            // Panggil service yang sudah menggabungkan semua data (termasuk kucing hilang)
            const data = await CommunityService.getSidebarData();
            
            // Kirim response
            return reply.send({ status: 'success', data: data });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async getAllFacts(req, reply) {
        try {
            const facts = await CommunityService.getAllFacts();
            return reply.send({ status: 'success', data: facts });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async editComment(req, reply) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.id;
            await CommunityService.updateComment(userId, id, content);
            return reply.send({ message: 'Comment updated' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async deleteComment(req, reply) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await CommunityService.deleteComment(userId, id);
            return reply.send({ message: 'Comment deleted' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async editReply(req, reply) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.id;
            await CommunityService.updateReply(userId, id, content);
            return reply.send({ message: 'Reply updated' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async deleteReply(req, reply) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await CommunityService.deleteReply(userId, id);
            return reply.send({ message: 'Reply deleted' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = CommunityController;