import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    orderId: {
        type: String,
        required: [true, "Provide orderID"],
        unique: true
    },

    products: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: 'product'
            },
            name: String,
            image: [String],
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: Number,
                default: 0
            },
            variations: [
                {
                    name: { type: String, default: "" },
                    value: { type: String, default: "" }
                }
            ]
        }
    ],

    paymentMethod: {
        type: String,
        enum: ['online', 'cod'],
        default: 'cod'
    },

    paymentId: {
        type: String,
        default: ""
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },

    deliveryAddress: {
        adress_line: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
        mobile: Number
    },

    subTotalAmount: {
        type: Number,
        default: 0
    },

    shippingFee: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        default: 0
    },

    isAdminSeen: {
        type: Boolean,
        default: false
    },

    trackingNumber: {
        type: String,
        default: ""
    },

    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },

    statusHistory: [
        {
            status: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            updatedBy: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        }
    ],

    comment: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
})

const OrderModel = mongoose.model('order', orderSchema)

export default OrderModel