import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ddcmwjqzd',
    api_key: process.env.CLOUDINARY_API_KEY || '358482767857551',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'b9D34mg2zKHRV5XwKDoDTjGVTfc',
});

/**
 * Upload a base64 image to Cloudinary
 * @param {string} base64Image - Base64 encoded image data
 * @param {string} folder - Folder name in Cloudinary
 * @param {string} publicId - Custom public ID for the image
 * @param {object} dimensions - Optional target dimensions { width, height }
 * @returns {Promise<{url: string, publicId: string, width: number, height: number}>}
 */
export const uploadImage = async (base64Image, folder = 'app_images', publicId = null, dimensions = null) => {
    try {
        const uploadOptions = {
            folder,
            resource_type: 'image',
            format: 'png',
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        // Add transformation for specific dimensions if provided
        if (dimensions && dimensions.width && dimensions.height) {
            uploadOptions.transformation = [
                {
                    width: dimensions.width,
                    height: dimensions.height,
                    crop: 'fill',
                    gravity: 'center'
                }
            ];
        }

        // Handle both base64 with prefix and raw base64
        let imageData = base64Image;
        if (!base64Image.startsWith('data:')) {
            imageData = `data:image/png;base64,${base64Image}`;
        }

        const result = await cloudinary.uploader.upload(imageData, uploadOptions);

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
};

/**
 * Upload image from URL to Cloudinary
 * @param {string} imageUrl - URL of the image
 * @param {string} folder - Folder name in Cloudinary
 * @param {string} publicId - Custom public ID for the image
 * @returns {Promise<{url: string, publicId: string, width: number, height: number}>}
 */
export const uploadImageFromUrl = async (imageUrl, folder = 'app_images', publicId = null) => {
    try {
        const uploadOptions = {
            folder,
            resource_type: 'image',
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<boolean>}
 */
export const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
};

/**
 * Get image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {object} options - Transformation options
 * @returns {string}
 */
export const getTransformedUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...options,
    });
};

export default cloudinary;
