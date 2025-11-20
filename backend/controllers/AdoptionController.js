const CatService = require('../services/CatService');
const AdoptionService = require('../services/AdoptionService');

class AdoptionController {
    // GET /api/v1/adopt/cats
    static async getCats(request, reply) {
        try {
            const cats = await CatService.getAvailableCats();
            return reply.send(cats);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }

    // POST /api/v1/adopt/apply
    static async applyAdoption(request, reply) {
        try {
            // Validasi data (request.body) di sini jika perlu
            const result = await AdoptionService.createAdoption(request.body);
            return reply.code(201).send({ message: 'Adoption application submitted', id: result.id });
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    }

    // GET /api/v1/adopt/reports/:shelterId
    static async getShelterReports(request, reply) {
        try {
            const { shelterId } = request.params;
            const reports = await AdoptionService.getAdoptionReportsByShelter(shelterId);
            return reply.send(reports);
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = AdoptionController;
