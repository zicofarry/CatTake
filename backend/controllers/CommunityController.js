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
                    const savePath = path.join(__dirname, '../public/img', fileName);
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

    // [BARU] Reply Komentar
    static async replyComment(req, reply) {
        try {
            const { commentId } = req.params; // ID Komentar Induk
            const { content, parentReplyId } = req.body; // parentReplyId bisa null (jika reply langsung ke komentar)
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
            const [events, popular, fact] = await Promise.all([
                CommunityService.getUpcomingEvents(),
                CommunityService.getPopularPosts(),
                CommunityService.getRandomFact()
            ]);
            return reply.send({ status: 'success', data: { events, popular, fact } });
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
            const { id } = req.params; // ID Komentar
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
            const { id } = req.params; // ID Komentar
            const userId = req.user.id;
            await CommunityService.deleteComment(userId, id);
            return reply.send({ message: 'Comment deleted' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    static async editReply(req, reply) {
        try {
            const { id } = req.params; // ID Reply
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
            const { id } = req.params; // ID Reply
            const userId = req.user.id;
            await CommunityService.deleteReply(userId, id);
            return reply.send({ message: 'Reply deleted' });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = CommunityController;