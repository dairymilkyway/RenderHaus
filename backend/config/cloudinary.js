const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a 3D model file to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The original file name
 * @param {string} folder - The folder to upload to (optional)
 * @returns {Promise} - Cloudinary upload result
 */
const uploadModel = async (fileBuffer, fileName, folder = 'renderhaus/models') => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // For non-image files like .gltf, .glb, .obj
          folder: folder,
          public_id: fileName.split('.')[0], // Use filename without extension as public_id
          use_filename: true,
          unique_filename: false,
          chunk_size: 6000000, // 6MB chunks for large files
          timeout: 300000, // 5 minutes timeout
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise} - Cloudinary deletion result
 */
const deleteModel = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadModel,
  deleteModel
};
