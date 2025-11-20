const db = require('../config/db');

class FaqService {
    // Mengambil semua data FAQ
    static async getAllFaqs() {
        const query = 'SELECT id, question, answer FROM faq ORDER BY id ASC';
        const result = await db.query(query);
        return result.rows;
    }

    // (Opsional) Jika nanti butuh tambah FAQ dari Admin panel
    static async createFaq(data) {
        const query = 'INSERT INTO faq (question, answer) VALUES ($1, $2) RETURNING *';
        const result = await db.query(query, [data.question, data.answer]);
        return result.rows[0];
    }
}

module.exports = FaqService;
