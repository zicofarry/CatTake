const AuthController = require('../controllers/AuthController');

async function authRoutes(fastify, options) {
    fastify.post('/register', AuthController.register);
    fastify.post('/login', AuthController.login);
}

module.exports = authRoutes;
