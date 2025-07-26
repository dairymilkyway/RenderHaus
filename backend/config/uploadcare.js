const { uploadFile, deleteFile } = require('@uploadcare/upload-client');

// Configure Uploadcare
const uploadcareConfig = {
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
  secretKey: process.env.UPLOADCARE_SECRET_KEY,
};

/**
 * Upload a 3D model file to Uploadcare
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The original file name
 * @param {Object} options - Additional upload options
 * @returns {Promise} - Uploadcare upload result
 */
const uploadModel = async (fileBuffer, fileName, options = {}) => {
  try {
    console.log('Starting Uploadcare upload for:', fileName);
    
    const result = await uploadFile(fileBuffer, {
      publicKey: uploadcareConfig.publicKey,
      fileName: fileName,
      contentType: 'application/octet-stream',
      metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
        ...options.metadata
      },
    });

    console.log('Uploadcare upload successful:', {
      fileId: result.uuid,
      cdnUrl: result.cdnUrl
    });

    return {
      fileId: result.uuid,
      cdnUrl: result.cdnUrl,
      originalUrl: result.originalUrl,
      fileName: fileName
    };
  } catch (error) {
    console.error('Uploadcare upload error:', error);
    throw new Error(`Uploadcare upload failed: ${error.message}`);
  }
};

/**
 * Delete a file from Uploadcare
 * @param {string} fileId - The file UUID to delete
 * @returns {Promise} - Uploadcare deletion result
 */
const deleteModel = async (fileId) => {
  try {
    console.log('Deleting file from Uploadcare:', fileId);
    
    const result = await deleteFile(
      {
        uuid: fileId,
      },
      {
        publicKey: uploadcareConfig.publicKey,
        secretKey: uploadcareConfig.secretKey,
      }
    );

    console.log('File deleted successfully from Uploadcare');
    return result;
  } catch (error) {
    console.error('Uploadcare deletion error:', error);
    throw new Error(`Uploadcare deletion failed: ${error.message}`);
  }
};

module.exports = {
  uploadModel,
  deleteModel,
  uploadcareConfig
};
