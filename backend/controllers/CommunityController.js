// backend/controllers/CommunityController.js
const CommunityService = require('../services/CommunityService');
const GamificationService = require('../services/GamificationService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

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
            let imageUrl = null; // Diubah dari fileName
            let title = ''; 

            for await (const part of parts) {
                if (part.file) {
                    // [MIGRASI] Ambil buffer dan upload ke Cloudinary folder 'cattake/posts'
                    const buffer = await part.toBuffer();
                    const result = await uploadToCloudinary(buffer, 'cattake/posts');
                    imageUrl = result.secure_url;
                } else {
                    if (part.fieldname === 'content') content = part.value;
                    else if (part.fieldname === 'title') title = part.value; 
                }
            }

            const userId = req.user.id;
            // Simpan URL lengkap ke database
            const newPost = await CommunityService.createPost(userId, title, content, imageUrl);
            
            // TRIGGER QUEST: Tambah 1 ke counter postingan
            try {
                GamificationService.updateProgress(userId, 'POST_COUNT', 1)
                    .catch(err => console.error("Gamification Async Error:", err));
            } catch (gamificationError) {
                console.error("Gamification Error:", gamificationError);
            }
            return reply.code(201).send({ message: 'Post created', data: newPost });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async updatePost(req, reply) {
        try {
            const { id } = req.params;
            const { title, content } = req.body; 
            const userId = req.user.id;

            await CommunityService.updatePost(userId, id, title, content);
            return reply.send({ message: 'Post updated successfully' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async deletePost(req, reply) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // 1. Hapus dari Database & Ambil Data Postingan
            const deletedPost = await CommunityService.deletePost(userId, id);

            // 2. [MIGRASI] Hapus File di Cloudinary
            // Kita tetap pertahankan logika filter agar hanya menghapus gambar yang berasal dari folder 'posts'.
            // Ini untuk mencegah terhapusnya gambar 'lost_cats' jika postingan tersebut adalah hasil auto-share.
            if (deletedPost.media_path && deletedPost.media_path.includes('/cattake/posts/')) {
                await deleteFromCloudinary(deletedPost.media_path);
                console.log(`[Cloudinary Deleted] ${deletedPost.media_path}`);
            }

            return reply.send({ message: 'Post deleted successfully' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // ... Handler addComment, replyComment, toggleLike, getSidebarData, dll tetap sama ...
    
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

    static async getSidebarData(req, reply) {
        try {
            const data = await CommunityService.getSidebarData();
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