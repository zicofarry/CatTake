const AuthService = require('../services/AuthService');

class AuthController {
    static async register(request, reply) {
        try {
            const result = await AuthService.registerUser(request.body);
            return reply.code(201).send({ message: 'User registered successfully!', user: result });
        } catch (error) {
            if (error.message.includes('unique constraint')) {
                return reply.code(409).send({ error: 'Email or NIK already exists.' });
            }
            if (error.message.includes('violates check constraint')) {
                // Menangani error ENUM/CHECK constraint
                return reply.code(400).send({ error: 'Data tidak valid: ' + error.message });
            }
            return reply.code(500).send({ error: error.message });
        }
    }

    static async login(request, reply) {
        try {
            const { identifier, password } = request.body; 
            const result = await AuthService.loginUser(identifier, password);
            return reply.send({ message: 'Login successful!', data: result });
        } catch (error) {
            return reply.code(401).send({ error: error.message });
        }
    }
}

module.exports = AuthController;
