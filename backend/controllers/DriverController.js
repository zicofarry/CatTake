const DriverModel = require('../models/DriverModel');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const bcrypt = require('bcrypt'); 

class DriverController {

    // Helper Hapus File dengan Folder Dinamis
    static deleteFile(folder, filename) {
        if (!filename) return;
        const filePath = path.join(__dirname, `../public/img/${folder}`, filename);
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) { console.error(`Gagal hapus file ${folder}/${filename}:`, err); }
    }

    // GET List
    static async getShelterDrivers(req, reply) {
        try {
            const shelterId = req.user.id;
            const drivers = await DriverModel.getByShelterId(shelterId);
            reply.send(drivers);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    // POST Add Driver
   static async addDriver(req, reply) {
        try {
            const parts = req.parts();
            let fields = {};
            let simUrl = null;
            let photoUrl = null;

            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    if (part.fieldname === 'sim') {
                        const result = await uploadToCloudinary(buffer, 'cattake/license');
                        simUrl = result.secure_url;
                    } else if (part.fieldname === 'photo') {
                        const result = await uploadToCloudinary(buffer, 'cattake/profiles');
                        photoUrl = result.secure_url;
                    }
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            if (!fields.name || !fields.email || !fields.password || !fields.username) {
                return reply.code(400).send({ message: "Data (Nama, Email, Username, Password) wajib diisi!" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(fields.password, salt);

            const userData = {
                username: fields.username,
                email: fields.email,
                password: hashedPassword
            };

            const driverData = {
                shelter_id: req.user.id,
                full_name: fields.name,
                contact_phone: fields.phone || '',
                license_info: simUrl,
                profile_picture: photoUrl
            };

            await DriverModel.create(userData, driverData);
            reply.code(201).send({ message: 'Driver berhasil ditambahkan' });

        } catch (error) {
            console.error("Error Add Driver:", error);
            if (error.code === '23505') return reply.code(400).send({ message: 'Username atau Email sudah terdaftar.' });
            reply.code(500).send({ error: 'Gagal menambah driver' });
        }
    }

    // PUT Update Driver
    static async updateDriver(req, reply) {
        try {
            const { id } = req.params;
            const parts = req.parts();
            let fields = {};
            let newSimUrl = null;
            let newPhotoUrl = null;

            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    if (part.fieldname === 'sim') {
                        const result = await uploadToCloudinary(buffer, 'cattake/license');
                        newSimUrl = result.secure_url;
                    } else if (part.fieldname === 'photo') {
                        const result = await uploadToCloudinary(buffer, 'cattake/profiles');
                        newPhotoUrl = result.secure_url;
                    }
                } else {
                    fields[part.fieldname] = part.value;
                }
            }

            // Hapus file lama di Cloudinary jika ada file baru yang diupload
            const oldDriver = await DriverModel.getById(id);
            if (oldDriver) {
                if (newSimUrl && oldDriver.license_info) await deleteFromCloudinary(oldDriver.license_info);
                if (newPhotoUrl && oldDriver.profile_picture) await deleteFromCloudinary(oldDriver.profile_picture);
            }

            const updateData = {
                full_name: fields.name,
                username: fields.username,
                email: fields.email,
                contact_phone: fields.phone,
                license_info: newSimUrl,
                profile_picture: newPhotoUrl
            };

            await DriverModel.update(id, updateData);
            reply.send({ message: 'Data driver diperbarui' });

        } catch (error) {
            console.error("Error Update Driver:", error);
            reply.code(500).send({ error: 'Gagal update driver' });
        }
    }

    // DELETE Driver
    static async deleteDriver(req, reply) {
        try {
            const { id } = req.params;
            const driver = await DriverModel.getById(id);
            if (!driver) return reply.code(404).send({ message: 'Driver tidak ditemukan' });

            const success = await DriverModel.delete(id);
            if (success) {
                // Hapus foto dari Cloudinary
                if (driver.license_info) await deleteFromCloudinary(driver.license_info);
                if (driver.profile_picture) await deleteFromCloudinary(driver.profile_picture);
            }

            reply.send({ message: 'Driver berhasil dihapus' });
        } catch (error) {
            console.error("Error Delete Driver:", error);
            reply.code(500).send({ error: 'Gagal menghapus driver' });
        }
    }
}

module.exports = DriverController;