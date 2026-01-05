const UserService = require('../services/UserService'); // <-- Memanggil service yang melakukan JOIN DB
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');const fs = require('fs');

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
    
    static async updateShelter(req, reply) {
        try {
            const { userId } = req.params;
            const parts = req.parts();
            
            let fields = {};
            let qrUrl = null;
            let legalUrl = null;

            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();

                    if (part.fieldname === 'qr_img') {
                        // FIX: Upload QR Code ke Cloudinary
                        const result = await uploadToCloudinary(buffer, 'cattake/qr_codes');
                        qrUrl = result.secure_url;
                    } else if (part.fieldname === 'legal_certificate') {
                        // FIX: Upload PDF Legalitas ke Cloudinary
                        const result = await uploadToCloudinary(buffer, 'cattake/legal');
                        legalUrl = result.secure_url;
                    }
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            // Masukkan URL Cloudinary ke objek fields jika ada upload baru
            if (qrUrl) fields.qr_img = qrUrl;
            if (legalUrl) fields.legal_certificate = legalUrl;

            // Update ke database melalui service
            const updatedData = await UserService.updateShelterDetails(userId, fields);

            return reply.send({ 
                message: 'Shelter profile updated successfully', 
                data: updatedData 
            });

        } catch (error) {
            console.error("Update Shelter Error:", error);
            return reply.code(500).send({ error: error.message });
        }
    }

    static async uploadPhoto(req, reply) {
        try {
            const { userId } = req.params;
            const parts = req.parts();
            
            let fileBuffer = null; // Ganti fileName jadi buffer
            let role = 'individu'; 

            // Loop tetap sama untuk ambil file dan role
            for await (const part of parts) {
                if (part.file) {
                    // Ambil buffer-nya saja, urusan kompresi & simpan serahkan ke Cloudinary
                    fileBuffer = await part.toBuffer();
                } else {
                    if (part.fieldname === 'role') {
                        role = part.value;
                    }
                }
            }

            if (!fileBuffer) {
                return reply.code(400).send({ error: 'No file uploaded' });
            }

            // [PROSES BARU] Upload ke Cloudinary
            // Kita pakai folder 'cattake/profiles' agar rapi
            const cloudinaryResult = await uploadToCloudinary(fileBuffer, 'cattake/profiles');
            const imageUrl = cloudinaryResult.secure_url; // Ini URL lengkapnya

            // 1. Simpan URL ke Database melalui Service (Struktur tetap sama)
            // Kita kirim imageUrl sebagai pengganti fileName
            const result = await UserService.updateProfilePhoto(userId, role, imageUrl);

            // 2. Hapus file lama (Cloudinary atau Lokal)
            // Fungsi deleteFromCloudinary sudah kita buat agar pintar: 
            // Kalau isinya URL Cloudinary dia hapus di awan, kalau bukan dia abaikan.
            if (result.oldPhoto) {
                await deleteFromCloudinary(result.oldPhoto); 
            }

            return reply.send({ 
                message: 'Profile photo updated', 
                photo: imageUrl // Kirim URL lengkap ke frontend
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

    // [TAMBAHAN BARU] Update Profil Shelter (Multipart)
    static async updateShelter(req, reply) {
        try {
            const { userId } = req.params;
            const parts = req.parts();
            
            let fields = {};
            let qrFileName = null;
            let legalFileName = null;

            for await (const part of parts) {
                if (part.file) {
                    const ext = path.extname(part.filename);
                    const timestamp = Date.now();

                    if (part.fieldname === 'qr_img') {
                       qrFileName = `qr-${userId}-${timestamp}.jpeg`;
                        const savePath = path.join(__dirname, '../public/img/qr_img', qrFileName);
                        if (!fs.existsSync(path.dirname(savePath))) fs.mkdirSync(path.dirname(savePath), { recursive: true });
                        await pump(part.file, fs.createWriteStream(savePath));
                    
                    } else if (part.fieldname === 'legal_certificate') {
                        if (ext.toLowerCase() === '.pdf') {
                            // PDF -> Jangan pakai Sharp
                            legalFileName = `legal-${userId}-${timestamp}.pdf`;
                            const savePath = path.join(__dirname, '../public/docs/legal', legalFileName);
                            if (!fs.existsSync(path.dirname(savePath))) fs.mkdirSync(path.dirname(savePath), { recursive: true });
                            const util = require('util');
                            const { pipeline } = require('stream');
                            const pump = util.promisify(pipeline);
                            await pump(part.file, fs.createWriteStream(savePath));
                        } else {
                            // Image -> Pakai Sharp
                            legalFileName = `legal-${userId}-${timestamp}.jpeg`;
                            const savePath = path.join(__dirname, '../public/docs/legal', legalFileName);
                            if (!fs.existsSync(path.dirname(savePath))) fs.mkdirSync(path.dirname(savePath), { recursive: true });
                            
                            const buffer = await part.toBuffer();
                            await sharp(buffer).resize(1024).jpeg({ quality: 80 }).toFile(savePath);
                        }
                    } else {
                        part.file.resume();
                    }
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            if (qrFileName) fields.qr_img = qrFileName;
            if (legalFileName) fields.legal_certificate = legalFileName;

            const updatedData = await UserService.updateShelterDetails(userId, fields);

            return reply.send({ 
                message: 'Shelter profile updated successfully', 
                data: updatedData 
            });

        } catch (error) {
            console.error("Update Shelter Error:", error);
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = UserController;