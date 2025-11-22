const AuthController = require('../controllers/AuthController');

async function authRoutes(fastify, options) {
    fastify.post('/register', AuthController.register);
    fastify.post('/login', AuthController.login);
    fastify.post('/google', AuthController.googleLogin);
}

module.exports = authRoutes;
