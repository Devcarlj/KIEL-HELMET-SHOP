import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide Name"]
    },

    email: {
        type: String,
        required: [true, "Provide Email"],
        unique: true
    },

    password: {
        type: String,
        required: [true, "Provide Password"],
        unique: true
    },

    avatar: {
        type: String,
        default: ""
    },

    mobile: {
        type: Number,
        default: null
    },

    refresh_token: {
        type: String,
        default: ""
    },

    verify_email: {
        type: Boolean,
        default: false
    },

    last_login_date: {
        type: Date,
        default: ""
    },

    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended"],
        default: "Active"
    },

    adress_details: [
        {
            adress_line: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pincode: { type: String },
            country: { type: String },
            mobile: { type: Number, default: null },
            status: { type: Boolean, default: true }
        }
    ],

    shopping_cart: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: 'product'
            },
            quantity: {
                type: Number,
                default: 1
            },
            variations: [
                {
                    name: { type: String, default: "" },
                    value: { type: String, default: "" }
                }
            ]
        }
    ],

    orderHistory: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'order'
        }
    ],

    forgot_password_otp: {
        type: String,
        default: null
    },

    forgot_password_expiry: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: ["SUPERADMIN", "ADMIN", "USER"],
        default: "USER"
    },

    favorites: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'product'
        }
    ],

    shopInfo: {
        name: { type: String, default: "" },
        phone: { type: String, default: "" },
        addressLine: { type: String, default: "" },
        city: { type: String, default: "" },
        region: { type: String, default: "" },
        barangay: { type: String, default: "" },
        sortCode: { type: String, default: "" }
    },

},
    {
        timestamps: true
    })

const UserModel = mongoose.model("User", userSchema)

export default UserModel