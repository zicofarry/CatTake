// /backend/controllers/UserController.js

const UserService = require('../services/UserService'); // <-- Memanggil service yang melakukan JOIN DB
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

async function deleteOldFile(fileName) {
    // Abaikan penghapusan jika tidak ada nama file atau itu adalah nama default/null
    if (!fileName || fileName === 'NULL.JPG' || fileName === 'null' || fileName === 'Ellipse.png') {
        return; 
    }

    // Gabungkan path lengkap ke folder upload
    const filePath = path.join(__dirname, '../public/img/profile', fileName);
    
    // Cek apakah file ada secara fisik sebelum mencoba menghapus
    if (fs.existsSync(filePath)) {
        try {
            // Hapus file secara asinkron
            await fsp.unlink(filePath); 
            console.log(`[File Deletion Success] Berhasil menghapus file lama: ${fileName}`);
        } catch (error) {
            console.error(`[File Deletion Failed] Gagal menghapus file ${fileName}:`, error);
            // Biarkan proses berlanjut, kegagalan menghapus file lama tidak boleh menggagalkan upload foto baru
        }
    }
}

class UserController {
    /**
     * Mengambil detail profil pengguna (individu/shelter) berdasarkan ID dan role.
     * Endpoint: GET /api/v1/users/profile/:userId/:role
     */
    static async getProfile(request, reply) {
        try {
            // Mengambil userId dan role dari parameter URL yang dikirimkan (saat testing tanpa JWT)
            const { userId, role } = request.params; 
            
            // Konversi userId ke integer karena Fastify params adalah string
            const id = parseInt(userId, 10);
            
            if (isNaN(id) || !role) {
                return reply.code(400).send({ error: 'Invalid user ID or role.' });
            }

            // Panggil UserService untuk mengambil data yang di-JOIN dari tabel detail
            const profile = await UserService.getProfile(id, role);
            
            // Mengembalikan status 200 OK
            return reply.send(profile);
            
        } catch (error) {
            if (error.message.includes('Profile not found')) {
                return reply.code(404).send({ error: 'User profile data not found.' });
            }
            console.error('Error fetching profile:', error);
            return reply.code(500).send({ error: 'Internal server error while fetching profile.' });
        }
    }
    
    static async updateProfile(request, reply) {
        try {
            // Asumsi middleware JWT sudah memverifikasi user dan menaruhnya di request.user
            // Kita akan menggunakan userId dan role dari URL params untuk saat ini
            const { userId } = request.params; 
            const { role } = request.body; // Ambil role dari body atau dari JWT

            // Panggil service untuk melakukan update
            const updatedData = await UserService.updateProfile(parseInt(userId, 10), role, request.body);

            return reply.send({ 
                message: 'Profile updated successfully!', 
                data: updatedData
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            return reply.code(400).send({ error: error.message });
        }
    }

    static async uploadPhoto(req, reply) {
        try {
            const { userId } = req.params;
            const parts = req.parts();
            
            let fileName = null;
            let role = 'individu'; // Default fallback

            // Loop untuk memproses file dan field lainnya (seperti role)
            for await (const part of parts) {
                if (part.file) {
                    const fileExtension = path.extname(part.filename);
                    fileName = `profile-${userId}-${Date.now()}${fileExtension}`;
                    const savePath = path.join(__dirname, '../public/img/profile', fileName);
                    
                    // Simpan file ke folder public/img
                    await pump(part.file, fs.createWriteStream(savePath));
                } else {
                    // Ambil field 'role' jika dikirim dari frontend
                    if (part.fieldname === 'role') {
                        role = part.value;
                    }
                }
            }

            if (!fileName) {
                return reply.code(400).send({ error: 'No file uploaded' });
            }

            // 1. Simpan nama file baru & ambil nama file lama
            const result = await UserService.updateProfilePhoto(userId, role, fileName);

            // 2. Hapus file lama (hanya jika ada)
            if (result.oldPhoto) {
                await deleteOldFile(result.oldPhoto); 
            }

            return reply.send({ 
                message: 'Profile photo updated', 
                photo: fileName 
            });

        } catch (error) {
            console.error("Upload Error:", error);
            return reply.code(500).send({ error: error.message });
        }
    }

    static async getShelters(request, reply) {
        try {
            const shelters = await UserService.getAllShelters();
            return reply.send(shelters);
        } catch (error) {
            console.error('Error fetching shelters:', error);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
    // Anda bisa menambahkan controller lain di sini, seperti updateProfile
}

module.exports = UserController;
