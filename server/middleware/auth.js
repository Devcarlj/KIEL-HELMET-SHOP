import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const auth = async (request, response, next) => {
    try {
        const token = request.cookies.accessToken || request?.header?.authorization?.split(" ")[1];

        if (!token) {
            return response.status(401).json({
                message: "Provide token"
            });
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)
        if (!decode) {
            return response.status(401).json({
                message: "Unauthorize access",
                error: true,
                success: false
            });
        }

        request.userId = decode.id;

        next()
    } catch (error) {
        return response.status(401).json({
            message: "Invalid or expired token",
            error: true,
            success: false
        });
    }
}

/** 
 * Try to identify the user if a token is present, but don't fail for guests 
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers?.authorization?.split(" ")[1];
        if (token) {
            const decoded = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            if (decoded) {
                req.userId = decoded.id;
            }
        }
        next();
    } catch (error) {
        // Silent fail for optional auth
        next();
    }
};

/** 
 * If a userId is present, fetch the user and attach to req.user
 */
export const optionalUserDetails = async (req, res, next) => {
    try {
        if (req.userId) {
            const user = await UserModel.findById(req.userId).select('role email');
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        next();
    }
};

export default auth;