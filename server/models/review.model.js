import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'order',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ""
    },
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// Ensure a user can only review a product once per order
reviewSchema.index({ productId: 1, orderId: 1, userId: 1 }, { unique: true });

const ReviewModel = mongoose.model('review', reviewSchema)

export default ReviewModel
