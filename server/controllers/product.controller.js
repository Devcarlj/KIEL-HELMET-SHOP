import ProductModel from "../models/product.model.js"
import { deleteImageCloudinary, getPublicIdFromUrl } from "../utils/uploadImageCloudinary.js"

export const createProductController = async (request, response) => {
    try {
        const { name, image, category, subCategory, unit, stock, price, discount, description, more_details, variations, variationStocks, badges } = request.body

        if (!name || !image || !category || !description) {
            return response.status(400).json({
                message: "Please provide complete details",
                error: true,
                success: false
            })
        }

        const newProduct = new ProductModel({
            name,
            image,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            variations,
            variationStocks,
            badges
        })

        const saveProduct = await newProduct.save()

        return response.json({
            message: "Product created successfully",
            data: saveProduct,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const getProductController = async (request, response) => {
    try {
        const { search, _id } = request.query
        let query = {}
        if (_id) {
            query._id = _id
        } else if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ]
            }
        }

        // Fetch products based on query
        const products = await ProductModel.find(query).sort({ createdAt: -1 })

        return response.json({
            message: "Products fetched successfully",
            data: products,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const updateProductController = async (request, response) => {
    try {
        const { _id, ...updateData } = request.body

        if (!_id) {
            return response.status(400).json({
                message: "Provide product _id",
                error: true,
                success: false
            })
        }

        const updateProduct = await ProductModel.findByIdAndUpdate(_id, updateData, { new: true })

        return response.json({
            message: "Product updated successfully",
            data: updateProduct,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const deleteProductController = async (request, response) => {
    try {
        const { _id } = request.body

        if (!_id) {
            return response.status(400).json({
                message: "Provide product _id",
                error: true,
                success: false
            })
        }

        const product = await ProductModel.findById(_id)

        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            })
        }

        // Delete images from Cloudinary if they exist
        if (product.image && Array.isArray(product.image)) {
            for (const imageUrl of product.image) {
                const publicId = getPublicIdFromUrl(imageUrl)
                if (publicId) {
                    await deleteImageCloudinary(publicId)
                }
            }
        }

        const deleteProduct = await ProductModel.findByIdAndDelete(_id)

        return response.json({
            message: "Product deleted successfully",
            data: deleteProduct,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
export const getProductsByCategoryController = async (request, response) => {
    try {
        const { id, limit } = request.body

        if (!id) {
            return response.status(400).json({
                message: "Provide Category ID",
                error: true,
                success: false
            })
        }

        let query = ProductModel.find({
            category: {
                $elemMatch: {
                    _id: id
                }
            }
        }).sort({ createdAt: -1 })

        if (limit) {
            query = query.limit(Number(limit))
        }

        const products = await query

        return response.json({
            message: "Products fetched successfully",
            data: products,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
