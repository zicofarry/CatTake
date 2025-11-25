const CatService = require('../services/CatService');
const CatModel = require('../models/CatModel');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

class CatController {
    // --- FITUR AMBIL KUCING SHELTER ---
    static async getShelterCats(req, reply) {
        try {
            const { id } = req.params;
            // Pastikan user yang login berhak melihat (opsional: cek id user = id params)
            
            const cats = await CatModel.findByShelterId(id);
            reply.send(cats);
        } catch (error) {
            console.error("Error Get Shelter Cats:", error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    // Fungsi ini akan dipanggil saat update atau delete
    static deleteImageFile(filename) {
        if (!filename) return;
        
        // Path ke folder public/img/cats
        const filePath = path.join(__dirname, '../public/img/cats', filename);
        
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Hapus file fisik
                console.log(`File ${filename} berhasil dihapus.`);
            }
        } catch (err) {
            console.error(`Gagal menghapus file ${filename}:`, err);
        }
    }

    // --- FITUR: TAMBAH KUCING (CREATE) ---
    static async createCat(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let filename = null;

            for await (const part of parts) {
                if (part.file) {
                    const uploadDir = path.join(__dirname, '../public/img/cats');
                    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

                    const ext = path.extname(part.filename);
                    filename = `cat-${Date.now()}${ext}`;
                    await pump(part.file, fs.createWriteStream(path.join(uploadDir, filename)));
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            const catData = {
                shelter_id: fields.shelter_id,
                name: fields.name,
                breed: fields.breed,
                age: fields.age,
                gender: fields.gender,
                health_status: fields.health_status,
                description: fields.description,
                adoption_status: fields.adoption_status || 'available',
                photo: filename
            };

            await CatModel.create(catData);
            reply.code(201).send({ message: 'Kucing berhasil ditambahkan' });

        } catch (error) {
            console.error("Error Upload:", error);
            reply.code(500).send({ error: 'Gagal upload data' });
        }
    }

    // --- FITUR: UPDATE KUCING (Hapus Foto Lama jika Ganti Foto) ---
    static async updateCat(req, reply) {
        try {
            const { id } = req.params;
            const parts = req.parts();
            let fields = {};
            let newFilename = null;

            // 1. Proses Upload File Baru (Jika ada)
            for await (const part of parts) {
                if (part.file) {
                    const uploadDir = path.join(__dirname, '../public/img/cats');
                    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                    
                    const ext = path.extname(part.filename);
                    newFilename = `cat-${Date.now()}${ext}`;
                    await pump(part.file, fs.createWriteStream(path.join(uploadDir, newFilename)));
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            // 2. LOGIKA HAPUS FOTO LAMA
            // Jika user mengupload foto baru (newFilename tidak null), 
            // kita cari data lama dulu untuk hapus fotonya.
            if (newFilename) {
                const oldCat = await CatService.getCatById(id); // Ambil data lama
                if (oldCat && oldCat.photo) {
                    CatController.deleteImageFile(oldCat.photo); // Hapus foto lama
                }
            }

            // 3. Update Database
            const updateData = {
                name: fields.name,
                breed: fields.breed,
                age: fields.age,
                gender: fields.gender,
                health_status: fields.health_status,
                description: fields.description,
                // Jika newFilename ada, pakai itu. Jika tidak, kosongkan agar Model tahu tidak ada update foto
                photo: newFilename 
            };

            const updatedCat = await CatModel.update(id, updateData);
            
            if (!updatedCat) {
                return reply.code(404).send({ message: 'Kucing tidak ditemukan' });
            }

            reply.send({ message: 'Data kucing berhasil diperbarui', data: updatedCat });

        } catch (error) {
            console.error("Error Update:", error);
            reply.code(500).send({ error: 'Gagal update data kucing' });
        }
    }

    // --- FITUR: HAPUS KUCING (Hapus Foto Juga) ---
    static async deleteCat(req, reply) {
        try {
            const { id } = req.params;

            // 1. Ambil data kucing dulu SEBELUM dihapus untuk dapat nama filenya
            const catToDelete = await CatService.getCatById(id);

            if (!catToDelete) {
                return reply.code(404).send({ message: 'Kucing tidak ditemukan' });
            }

            // 2. Hapus dari Database
            const deleted = await CatModel.delete(id);
            
            // 3. Jika sukses hapus DB, hapus juga FOTO fisiknya
            if (deleted && catToDelete.photo) {
                CatController.deleteImageFile(catToDelete.photo);
            }

            reply.send({ message: 'Kucing dan fotonya berhasil dihapus' });

        } catch (error) {
            console.error("Error Delete:", error);
            reply.code(500).send({ error: 'Gagal menghapus kucing' });
        }
    }

    // Handler untuk mengambil semua kucing
    static async getCats(req, reply) {
        try {
            // Asumsi: Kamu pakai middleware auth yang menaruh data user di req.user
            // Jika user belum login (guest), userId bisa undefined/null
            const userId = req.user ? req.user.id : null;

            const cats = await CatModel.getAllCatsWithUserStatus(userId);
            
            reply.status(200).send(cats);
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    }

    static async getDetail(req, reply) {
        try {
            const { id } = req.params;
            const cat = await CatService.getCatById(id);

            if (!cat) {
                return reply.code(404).send({ error: 'Kucing tidak ditemukan' });
            }

            reply.send(cat);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
    
    // Handler untuk Like/Unlike
    static async toggleLike(req, reply) {
        try {
            const userId = req.user.id; // Harus login
            const catId = req.params.id; // ID kucing dari URL

            const isFavorited = await CatModel.toggleFavorite(userId, catId);

            reply.status(200).send({ 
                message: isFavorited ? 'Added to favorites' : 'Removed from favorites',
                isFavorited: isFavorited 
            });
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Failed to toggle favorite' });
        }
    }

    // Handler baru untuk Hall of Fame
    static async getAdopted(req, reply) {
        try {
            const cats = await CatService.getAdoptedCats();
            reply.send({ 
                status: 'success', 
                data: cats 
            });
        } catch (error) {
            console.error("Error Fetching Adopted Cats:", error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
}

module.exports = CatController;
