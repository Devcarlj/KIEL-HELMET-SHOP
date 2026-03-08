import uploadImageCloudinary, { CLOUDINARY_FOLDERS } from "../utils/uploadImageCloudinary.js";

const uploadImagesController = async (request, response) => {
    try {
        const file = request.file;

        if (!file) {
            return response.status(400).json({
                message: "No file provided",
                error: true,
                success: false
            });
        }

        console.log("Upload Request Body:", request.body);
        const folder = request.body.folder || CLOUDINARY_FOLDERS.CATEGORIES;
        console.log("Saving image to folder:", folder);
        const upload = await uploadImageCloudinary(file, folder);

        return response.json({
            message: "Image uploaded successfully",
            data: upload, // This contains the URL and public_id
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export default uploadImagesController;