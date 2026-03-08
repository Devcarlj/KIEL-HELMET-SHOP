import SubCategoryModel from '../models/subCategory.model.js';
import uploadImageCloudinary, { CLOUDINARY_FOLDERS, getPublicIdFromUrl, deleteImageCloudinary } from '../utils/uploadImageCloudinary.js';

// Add sub-category
export async function AddSubCategoryController(request, response) {
    try {
        const { name, image, category } = request.body;

        if (!name || !image) {
            return response.status(400).json({
                message: "Name and image are required",
                error: true,
                success: false
            });
        }

        const newSubCategory = new SubCategoryModel({ name, image, category: category || [] });
        const saved = await newSubCategory.save();

        const populatedSaved = await SubCategoryModel.findById(saved._id).populate('category');

        return response.json({
            message: "Sub Category added successfully",
            error: false,
            success: true,
            data: populatedSaved
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Get all sub-categories
export async function GetSubCategoryController(request, response) {
    try {
        const data = await SubCategoryModel.find().sort({ createdAt: -1 }).populate('category');

        return response.json({
            message: "Sub categories fetched successfully",
            error: false,
            success: true,
            data
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Update sub-category
export async function UpdateSubCategoryController(request, response) {
    try {
        const { subCategoryId, name, image, category } = request.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (image) updateData.image = image;
        if (category) updateData.category = category;

        const updated = await SubCategoryModel.findByIdAndUpdate(
            subCategoryId,
            updateData,
            { new: true }
        ).populate('category');

        return response.json({
            message: "Sub Category updated successfully",
            error: false,
            success: true,
            data: updated
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Delete sub-category
export async function DeleteSubCategoryController(request, response) {
    try {
        const { subCategoryId } = request.body;

        const subCategory = await SubCategoryModel.findById(subCategoryId);
        if (!subCategory) {
            return response.status(404).json({
                message: "Sub Category not found",
                error: true,
                success: false
            });
        }

        // Delete image from cloudinary if it exists
        if (subCategory.image) {
            const publicId = getPublicIdFromUrl(subCategory.image);
            if (publicId) {
                await deleteImageCloudinary(publicId);
            }
        }

        await SubCategoryModel.findByIdAndDelete(subCategoryId);

        return response.json({
            message: "Sub Category deleted successfully",
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
