import UserModel from "../models/user.model.js";
import EmailSettingsModel from "../models/emailSettings.model.js";
import mongoose from "mongoose";

// ─── Helper: get or create the singleton email settings document ────────────
async function getOrCreateEmailSettings() {
    let settings = await EmailSettingsModel.findOne({});
    if (!settings) {
        settings = await EmailSettingsModel.create({});
    }
    return settings;
}

// ─── GET /api/superadmin/email-settings ─────────────────────────────────────
export async function getEmailSettings(request, response) {
    try {
        const settings = await getOrCreateEmailSettings();
        return response.json({
            message: "Email settings fetched",
            error: false,
            success: true,
            data: settings
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ─── PUT /api/superadmin/email-settings ─────────────────────────────────────
export async function updateEmailSettings(request, response) {
    try {
        const {
            registration,
            emailVerification,
            forgotPassword,
            orderCheckout,
            orderStatusUpdate,
            orderCancellation,
            newOrderAdminAlert
        } = request.body;

        const settings = await getOrCreateEmailSettings();

        if (registration !== undefined) settings.registration = registration;
        if (emailVerification !== undefined) settings.emailVerification = emailVerification;
        if (forgotPassword !== undefined) settings.forgotPassword = forgotPassword;
        if (orderCheckout !== undefined) settings.orderCheckout = orderCheckout;
        if (orderStatusUpdate !== undefined) settings.orderStatusUpdate = orderStatusUpdate;
        if (orderCancellation !== undefined) settings.orderCancellation = orderCancellation;
        if (newOrderAdminAlert !== undefined) settings.newOrderAdminAlert = newOrderAdminAlert;

        await settings.save();

        return response.json({
            message: "Email settings updated successfully",
            error: false,
            success: true,
            data: settings
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ─── GET /api/superadmin/admins ─────────────────────────────────────────────
export async function getAdmins(request, response) {
    try {
        const admins = await UserModel.find({ role: 'ADMIN' })
            .select('_id name email avatar createdAt last_login_date status')
            .sort({ createdAt: -1 });

        return response.json({
            message: "Admins fetched",
            error: false,
            success: true,
            data: admins
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ─── POST /api/superadmin/add-admin ─────────────────────────────────────────
export async function addAdmin(request, response) {
    try {
        const { email } = request.body;

        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return response.status(404).json({
                message: "No user found with that email address",
                error: true,
                success: false
            });
        }

        if (user.role === 'SUPERADMIN') {
            return response.status(400).json({
                message: "Cannot modify a Super Admin account",
                error: true,
                success: false
            });
        }

        if (user.role === 'ADMIN') {
            return response.status(400).json({
                message: `${user.name} is already an Admin`,
                error: true,
                success: false
            });
        }

        user.role = 'ADMIN';
        await user.save();

        return response.json({
            message: `${user.name} has been promoted to Admin successfully`,
            error: false,
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ─── DELETE /api/superadmin/remove-admin ────────────────────────────────────
export async function removeAdmin(request, response) {
    try {
        const { email } = request.body;

        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return response.status(404).json({
                message: "No user found with that email address",
                error: true,
                success: false
            });
        }

        if (user.role === 'SUPERADMIN') {
            return response.status(400).json({
                message: "Cannot remove Super Admin privileges",
                error: true,
                success: false
            });
        }

        if (user.role !== 'ADMIN') {
            return response.status(400).json({
                message: `${user.name} is not an Admin`,
                error: true,
                success: false
            });
        }

        user.role = 'USER';
        await user.save();

        return response.json({
            message: `${user.name} has been demoted to regular user`,
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

// ─── POST /api/superadmin/check-user ─────────────────────────────────────────
export async function checkUserByEmail(request, response) {
    try {
        const { email } = request.body;

        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email })
            .select('_id name email role avatar status');

        if (!user) {
            return response.status(404).json({
                message: "No user found with that email",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "User found",
            error: false,
            success: true,
            data: user
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ─── GET /api/superadmin/customers ──────────────────────────────────────────
export async function getAllUsers(request, response) {
    try {
        const page   = Math.max(1, parseInt(request.query.page)  || 1);
        const limit  = Math.min(50, parseInt(request.query.limit) || 20);
        const search = (request.query.search || '').trim();
        const status = request.query.status || '';

        const query = {
            role: { $in: ['USER', 'ADMIN'] }  // never expose SUPERADMIN
        };

        if (search) {
            query.$or = [
                { name:  { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status && ['Active', 'Inactive', 'Suspended'].includes(status)) {
            query.status = status;
        }

        const total = await UserModel.countDocuments(query);
        const users = await UserModel.find(query)
            .select('_id name email avatar role status mobile verify_email last_login_date createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return response.json({
            message: 'Users fetched',
            error: false,
            success: true,
            data: { users, total, page, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

// ─── GET /api/superadmin/customers/:id ──────────────────────────────────────
export async function getUserById(request, response) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid user ID', error: true, success: false });
        }

        const user = await UserModel.findById(id)
            .select('-password -refresh_token -forgot_password_otp -forgot_password_expiry');

        if (!user) {
            return response.status(404).json({ message: 'User not found', error: true, success: false });
        }

        if (user.role === 'SUPERADMIN') {
            return response.status(403).json({ message: 'Cannot view Super Admin accounts', error: true, success: false });
        }

        return response.json({ message: 'User fetched', error: false, success: true, data: user });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

// ─── PUT /api/superadmin/customers/:id ──────────────────────────────────────
export async function updateUserById(request, response) {
    try {
        const { id } = request.params;
        const { name, mobile, status } = request.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid user ID', error: true, success: false });
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return response.status(404).json({ message: 'User not found', error: true, success: false });
        }

        if (user.role === 'SUPERADMIN') {
            return response.status(403).json({ message: 'Cannot edit Super Admin accounts', error: true, success: false });
        }

        if (name   !== undefined) user.name   = name;
        if (mobile !== undefined) user.mobile = mobile;
        if (status !== undefined && ['Active', 'Inactive', 'Suspended'].includes(status)) {
            user.status = status;
        }

        await user.save();

        return response.json({
            message: `${user.name}'s profile updated successfully`,
            error: false,
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, mobile: user.mobile, status: user.status, role: user.role }
        });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

// ─── DELETE /api/superadmin/customers/:id  (Super Admin only) ───────────────
export async function deleteUserById(request, response) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid user ID', error: true, success: false });
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return response.status(404).json({ message: 'User not found', error: true, success: false });
        }

        if (user.role === 'SUPERADMIN') {
            return response.status(403).json({ message: 'Cannot delete Super Admin accounts', error: true, success: false });
        }

        await UserModel.findByIdAndDelete(id);

        return response.json({
            message: `Account for ${user.name} has been permanently deleted`,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}
