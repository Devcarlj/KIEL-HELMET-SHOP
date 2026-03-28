import ReviewModel from "../models/review.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";

export const addReview = async (request, response) => {
    try {
        const userId = request.userId;
        const { productId, orderId, rating, comment } = request.body;

        if (!productId || !orderId || !rating) {
            return response.status(400).json({
                message: "Please provide product, order and rating",
                error: true,
                success: false
            })
        }

        const order = await OrderModel.findOne({ _id: orderId, userId: userId });
        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            })
        }

        if (order.orderStatus !== 'delivered') {
            return response.status(400).json({
                message: "Can only review delivered orders",
                error: true,
                success: false
            })
        }

        const review = new ReviewModel({
            productId,
            userId,
            orderId,
            rating,
            comment
        });

        const saveReview = await review.save();

        return response.json({
            message: "Review added successfully",
            data: saveReview,
            success: true,
            error: false
        })

    } catch (error) {
        if (error.code === 11000) {
            return response.status(400).json({
                message: "You have already reviewed this product from this order",
                error: true,
                success: false
            });
        }
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const getProductReviews = async (request, response) => {
    try {
        const { productId } = request.params;

        const reviews = await ReviewModel.find({ productId }).populate('userId', 'name avatar').sort({ createdAt: -1 });

        return response.json({
            message: "Reviews fetched",
            data: reviews,
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

export const editReview = async (request, response) => {
    try {
        const userId = request.userId;
        const { reviewId } = request.params;
        const { rating, comment } = request.body;

        const review = await ReviewModel.findOne({ _id: reviewId, userId: userId });
        if (!review) {
            return response.status(404).json({ message: "Review not found or unauthorized", error: true, success: false });
        }

        review.rating = rating || review.rating;
        review.comment = comment !== undefined ? comment : review.comment;
        review.isEdited = true;

        const updatedReview = await review.save();

        return response.json({ message: "Review updated successfully", data: updatedReview, success: true, error: false });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export const deleteReview = async (request, response) => {
    try {
        const userId = request.userId;
        const { reviewId } = request.params;

        const user = await UserModel.findById(userId);
        const isAdmin = user && user.role === 'ADMIN';

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return response.status(404).json({ message: "Review not found", error: true, success: false });
        }

        if (review.userId.toString() !== userId.toString() && !isAdmin) {
             return response.status(403).json({ message: "Unauthorized to delete this review", error: true, success: false });
        }

        await ReviewModel.findByIdAndDelete(reviewId);

        return response.json({ message: "Review deleted successfully", success: true, error: false });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export const getUserReviews = async (request, response) => {
     try {
         const userId = request.userId;
         const reviews = await ReviewModel.find({ userId });
         return response.json({ message: "User reviews fetched", data: reviews, success: true, error: false });
     } catch(error) {
         return response.status(500).json({ message: error.message || error, error: true, success: false });
     }
}
