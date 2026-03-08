import CategoryModel from "../models/category.model.js"
import { v2 as cloudinary } from "cloudinary"
import { getPublicIdFromUrl } from "../utils/uploadImageCloudinary.js"

 export const AddCategoryController = async (request, response) => {
    try{
        const { name, image} = request.body 
        
        if (!name || !image) {
            return response.json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const AddCategory = new CategoryModel ({
            name,
            image
        })

        const saveCategory = await AddCategory.save()

        if (!saveCategory) {
            return response.json({
                message : "Failed to add category",
                error : true,
                success : false
            })
        }

        return  response.json ({
            message : "Category Successfuly Added",
            data : saveCategory,
            success : true,
            error : false
        })

    } catch(error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const GetCategoryController = async(request, response) =>{
    try {
        
        const data = await CategoryModel.find()
            return response.json({
                data : data,
                error: false,
                success : true  
            })
        
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


export const UpdateCategoryController = async(request, response) =>{
    try {
        const { categoryId, name, image } = request.body
        const update = await CategoryModel.updateOne({
            _id : categoryId
        },{
            name,
            image
        })

        return response.json({
            message : "Updated Category",
            success : true,
            error : false,
            data : update
        })
        
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const DeleteCategoryController = async (request, response) => {
    try {
        const { categoryId } = request.body
        if (!categoryId) {
            return response.json({
                message: "Category ID is required",
                error: true,
                success: false
            })
        }
        
        const category = await CategoryModel.findById(categoryId)
        if (!category) {
            return response.json({
                message: "Category not found",
                error: true,
                success: false
            })
        }
        // Delete image from Cloudinary if it's a Cloudinary URL
        if (category.image && category.image.includes("cloudinary")) {
            try {
                const publicId = getPublicIdFromUrl(category.image)
                if (publicId) await cloudinary.uploader.destroy(publicId)
            } catch (deleteError) {
                console.log("Cloudinary image delete failed, continuing with category delete:", deleteError)
            }
        }
        await CategoryModel.deleteOne({ _id: categoryId })
        return response.json({
            message: "Category deleted successfully",
            success: true,
            error: false
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


