import UserModel from "../models/user.model.js";

const superadmin = async (request, response, next) => {
    try {
        const userId = request.userId;

        const user = await UserModel.findById(userId);

        if (!user || user.role !== 'SUPERADMIN') {
            return response.status(403).json({
                message: "Access denied. Super Admin only.",
                error: true,
                success: false
            });
        }

        next();
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export default superadmin;
