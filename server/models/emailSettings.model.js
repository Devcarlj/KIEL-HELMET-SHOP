import mongoose from "mongoose";

const emailSettingsSchema = new mongoose.Schema({
    // Only one document will ever exist (singleton pattern)
    registration: {
        type: Boolean,
        default: true
    },
    emailVerification: {
        type: Boolean,
        default: true
    },
    forgotPassword: {
        type: Boolean,
        default: true
    },
    orderCheckout: {
        type: Boolean,
        default: true
    },
    orderStatusUpdate: {
        type: Boolean,
        default: true
    },
    orderCancellation: {
        type: Boolean,
        default: true
    },
    newOrderAdminAlert: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const EmailSettingsModel = mongoose.model("EmailSettings", emailSettingsSchema);

export default EmailSettingsModel;
