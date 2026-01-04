// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readableStream = new Readable();
    readableStream._read = () => {}; 
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// HELPER BARU: Hapus gambar dari Cloudinary berdasarkan URL
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary')) return;
  try {
    const parts = imageUrl.split('/');
    const folderIndex = parts.indexOf('cattake');
    const publicIdWithExtension = parts.slice(folderIndex).join('/');
    const publicId = publicIdWithExtension.split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Gagal hapus di Cloudinary:`, err);
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };