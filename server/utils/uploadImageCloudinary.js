import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
    secure: true
})

/** Folder names under kielHelmetShop in Cloudinary */
export const CLOUDINARY_FOLDERS = {
    AVATAR: 'kielHelmetShop/avatar',
    CATEGORIES: 'kielHelmetShop/categories',
};

/**
 * Get Cloudinary public_id from a Cloudinary image URL.
 * Works with any folder depth (e.g. kielHelmetShop/avatar/xyz or kielHelmetShop/categories/xyz).
 */
export const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary')) return null;
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // After "upload" comes version (e.g. v123), then path with extension
    const pathWithExt = parts.slice(uploadIndex + 2).join('/');
    return decodeURIComponent(pathWithExt.replace(/\.[^/.]+$/, '')); // remove extension and decode
};

const uploadImageCloudinary = async (image, folder = CLOUDINARY_FOLDERS.CATEGORIES) => {
    const buffer = image?.buffer || Buffer.from(await image.arrayBuffer());

    const uploadImage = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder }, (error, uploadResult) => {
            if (error) {
                return reject(error);
            }
            return resolve(uploadResult);
        }).end(buffer);
    });

    return uploadImage;
};

export const deleteImageCloudinary = async (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error("Cloudinary Error:", error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

export const deleteFolderCloudinary = async (folderPath) => {
    return new Promise((resolve, reject) => {
        cloudinary.api.delete_folder(folderPath, (error, result) => {
            if (error) {
                console.error("Cloudinary Folder Error:", error);
                // Sometimes deleting a folder fails if it's not totally empty yet due to caching delays
                resolve(error);
            } else {
                resolve(result);
            }
        });
    });
};

export default uploadImageCloudinary;
