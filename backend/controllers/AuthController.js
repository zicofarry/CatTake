const AuthService = require('../services/AuthService');
const GamificationService = require('../services/GamificationService');
const { OAuth2Client } = require('google-auth-library');

// Pastikan GOOGLE_WEB_CLIENT_ID ada di file .env backend kamu
const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

class AuthController {
    static async register(request, reply) {
        try {
            const result = await AuthService.registerUser(request.body);
            
            if (result && result.id) {
                GamificationService.syncDaysJoined(result.id)
                    .catch(err => console.error("Gagal sync gamifikasi saat register:", err));
            }

            return reply.code(201).send({ 
                message: 'User registered successfully!', 
                user: result 
            });

        } catch (error) {
            if (error.message.includes('unique constraint')) {
                return reply.code(409).send({ error: 'Email or username already exists.' });
            }
            if (error.message.includes('violates check constraint')) {
                return reply.code(400).send({ error: 'Data tidak valid: ' + error.message });
            }
            return reply.code(500).send({ error: error.message });
        }
    }

    static async login(request, reply) {
        try {
            const { identifier, password } = request.body; 
            const result = await AuthService.loginUser(identifier, password);

            // FIX: Ganti result.user.id menjadi result.id karena struktur return AuthService flat
            if (result && result.id) {
                GamificationService.syncDaysJoined(result.id)
                    .catch(err => console.error("Sync Days Joined Error:", err));
            }

            return reply.send({ message: 'Login successful!', data: result });
        } catch (error) {
            return reply.code(401).send({ error: error.message });
        }
    }

    static async googleLogin(request, reply) {
        try {
            // Frontend Mobile mengirim { token: idToken }
            const { token, role } = request.body;
            if (!token) return reply.code(400).send({ error: 'Token Google diperlukan' });

            // Verifikasi ID Token secara aman menggunakan library resmi
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_WEB_CLIENT_ID, 
            });
            
            const payload = ticket.getPayload(); // Berisi email, name, picture, sub

            const result = await AuthService.loginOrRegisterGoogle(payload, role);

            // FIX: Ganti result.user.id menjadi result.id
            if (result && result.id) {
                GamificationService.syncDaysJoined(result.id)
                    .catch(err => console.error("Sync Days Joined Google Error:", err));
            }

            return reply.send({ 
                message: 'Login Google berhasil!', 
                data: result 
            });

        } catch (error) {
            console.error("Google Auth Error:", error);
            return reply.code(401).send({ error: 'Gagal verifikasi Google Login: ' + error.message });
        }
    }
}

module.exports = AuthController;