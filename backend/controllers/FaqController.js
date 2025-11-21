const FaqService = require('../services/FaqService');

class FaqController {
    static async getAll(request, reply) {
        try {
            const faqs = await FaqService.getAllFaqs();
            return reply.code(200).send({
                status: 'success',
                data: faqs
            });
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    // (Opsional) Handler untuk create
    static async create(request, reply) {
        try {
            const newFaq = await FaqService.createFaq(request.body);
            return reply.code(201).send({
                status: 'success',
                message: 'FAQ created successfully',
                data: newFaq
            });
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = FaqController;
