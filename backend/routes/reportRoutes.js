const ReportController = require('../controllers/ReportController');
const authentication = require('../middlewares/authentication');

async function reportRoutes(fastify, options) {
    fastify.post('/', { preHandler: [authentication] }, ReportController.create);
    fastify.get('/my-history', { preHandler: [authentication] }, ReportController.getMyHistory);
}

module.exports = reportRoutes;
