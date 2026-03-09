import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import generatedRefereshToken from '../utils/generatedRefreshToken.js';
import uploadImageCloudinary, { CLOUDINARY_FOLDERS, getPublicIdFromUrl } from '../utils/uploadImageCloudinary.js';
import generatedOtp from '../utils/generatedOtp.js';
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';


// register controller
export async function registerUserController(request, response) {
    try {
        const { name, email, password } = request.body
        console.log("Checking email:", email)

        if (!name || !email || !password) {
            return response.status(400).json({
                message: "Provide email, name, pasword",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });

        if (user) {
            console.log("User found in DB:", user.email)
            return response.json({
                message: "Email is already registered",
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        const payLoad = {
            name,
            email,
            password: hashPassword
        }

        const newUser = new UserModel(payLoad);
        const save = await newUser.save();

        const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`
        sendEmail({
            sendTo: email,
            subject: "Verify email from Kiel Helmet Shop",
            html: verifyEmailTemplate({ name, url: verifyEmailUrl })
        }).catch(err => console.log("Email failed to send in background:", err));

        // Return response immediately
        return response.json({
            message: "User Register Successfully. Please check your email to verify before logging in.",
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

export async function verifyEmailController(request, response) {
    try {
        const { code } = request.body

        const user = await UserModel.findOne({ _id: code })

        if (!user) {
            return response.status(400).json({
                message: "Invalid code",
                error: true,
                success: false
            })
        }

        const accessToken = await generatedAccessToken(user._id);
        const refreshToken = await generatedRefereshToken(user._id);

        await UserModel.findByIdAndUpdate(user._id, {
            verify_email: true,
            last_login_date: new Date()
        });

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', accessToken, cookiesOption);
        response.cookie('refreshToken', refreshToken, cookiesOption);

        return response.json({
            message: "Email verified successfully",
            success: true,
            error: false,
            data: {
                accessToken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// login controller 
export async function loginController(request, response) {

    try {
        const { email, password } = request.body


        if (!email || !password) {
            return response.status(500).json({
                message: "Please Provide email and password",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return response.status(500).json({
                message: "User not registered",
                error: true,
                success: false
            });
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Please Contact the Admin",
                error: true,
                success: false
            });
        }

        if (!user.verify_email) {
            return response.status(400).json({
                message: "Please verify your email before logging in",
                error: true,
                success: false
            });
        }

        const checkPassword = await bcryptjs.compare(password, user.password)

        if (!checkPassword) {
            return response.status(500).json({
                message: "Check your password",
                error: true,
                success: false
            });
        }

        const accessToken = await generatedAccessToken(user._id);
        const refreshToken = await generatedRefereshToken(user._id);

        const updateUser = await UserModel.findByIdAndUpdate(user._id, {
            last_login_date: new Date()
        })
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', accessToken, cookiesOption);
        response.cookie('refreshToken', refreshToken, cookiesOption);

        return response.json({
            message: "Login successfully",
            error: false,
            success: true,

            data: {
                accessToken,
                refreshToken
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

//log out controller 
export async function logoutController(request, response) {
    try {

        const userid = request.userId //middleware

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.clearCookie("accessToken", cookiesOption);
        response.clearCookie("refreshToken", cookiesOption);

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return response.json({
            message: "Logout successfully",
            error: false,
            success: true

        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            sucess: false
        })
    }
}

//upload user avater 
export async function uploadUserAvatar(request, response) {
    try {
        const userId = request.userId;
        const image = request.file;

        // 1. Find the current user to see if they already have an avatar
        const user = await UserModel.findById(userId);

        // 2. If they have an old avatar, delete it from Cloudinary first
        if (user?.avatar && user.avatar.includes("cloudinary")) {
            try {
                const publicId = getPublicIdFromUrl(user.avatar);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                    console.log("Deleted old image:", publicId);
                }
            } catch (deleteError) {
                console.log("Old image delete failed, moving on...", deleteError);
            }
        }

        // 3. Now upload the NEW image to kielHelmetShop/avatar
        const upload = await uploadImageCloudinary(image, CLOUDINARY_FOLDERS.AVATAR);

        // 4. Update the database
        const updateUser = await UserModel.findByIdAndUpdate(userId, {
            avatar: upload.url
        }, { new: true });

        return response.json({
            message: "Profile updated and old image cleaned up",
            success: true,
            data: updateUser
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

//delete user avater
export async function deleteUserAvatar(request, response) {
    try {
        const userId = request.userId; // Ensure your auth middleware sets this
        const user = await UserModel.findById(userId);

        if (!user) {
            return response.status(400).json({ message: "User not found", error: true });
        }

        if (!user.avatar) {
            return response.status(400).json({ message: "No avatar exists to delete", error: true });
        }

        if (user.avatar.includes("cloudinary")) {
            const publicId = getPublicIdFromUrl(user.avatar);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        user.avatar = "";
        await user.save();

        return response.json({ message: "Deleted", success: true });
    } catch (error) {
        console.log(error); // This will show you exactly what failed in your terminal
        return response.status(500).json({ message: error.message });
    }
}

// update user details
export async function updateUserDetails(request, response) {
    try {

        const userId = request.userId; // auth middleware
        const { name, email, mobile, password } = request.body

        let hashPassword = "";

        if (password) {

            const salt = await bcryptjs.genSalt(10);
            hashPassword = await bcryptjs.hash(password, salt);
        }

        const updateUser = await UserModel.updateOne({ _id: userId }, {
            ...(name && { name: name }),
            ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            ...(password && { password: hashPassword })
        });

        return response.json({
            message: "Updated Sucessfully",
            error: false,
            success: true,
            data: updateUser
        })

    } catch (error) {
        return response.status(500).json({
            messaage: error.message || error,
            error: true,
            success: false
        });
    }
}

// forgot password not login
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return response.status(400).json({
                message: "Email not registered",
                error: true,
                success: false
            });
        }

        const otp = generatedOtp();

        const expireTime = Date.now() + 60 * 60 * 1000;

        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: new Date(expireTime).toISOString()
        });


        sendEmail({
            sendTo: email,
            subject: "Forgot password from Kiel Helmet Shop",
            html: forgotPasswordTemplate({
                name: user.name,
                otp: otp
            })
        }).catch(err => console.error("Email failed:", err));

        return response.json({
            message: "Check your email",
            error: false,
            success: true,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// verify otp forgot password
export async function verifyOtpForgotPassword(request, response) {
    try {

        const { email, otp } = request.body;

        if (!email || !otp) {
            return response.status(400).json({
                message: "Please provide email and otp.",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return response.status(400).json({
                message: "Email not registered",
                error: true,
                success: false
            });
        }

        const currentTime = new Date();


        if (user.forgot_password_expiry < currentTime) {
            return response.status(400).json({
                message: "OTP expired",
                error: true,
                success: false
            });
        }


        if (String(otp) !== String(user.forgot_password_otp)) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            });
        }

        const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
            forgot_password_otp: "",
            forgot_password_expiry: ""
        })

        return response.json({
            message: "OTP Verification Successful",
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

// reset the password
export async function resetPassword(request, response) {

    try {
        const { email, newPassword, confirmPassword } = request.body

        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                message: "Provide required fields email, newPassword, confirmPassword"

            })
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return response.status(400).json({
                mwessage: "Email is not registered",
                error: true,
                sucess: false
            })
        }

        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "Password do not match",
                error: true,
                sucess: false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword, salt)
        const update = await UserModel.findByIdAndUpdate(user._id, {
            password: hashPassword
        })

        return response.json({
            message: "Password updated sucessfully",
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

// Add Address
export async function addAddressController(request, response) {
    try {
        const userId = request.userId;
        const { adress_line, city, state, pincode, country, mobile } = request.body;

        const newAddress = {
            adress_line, city, state, pincode, country, mobile
        };

        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            $push: { adress_details: newAddress }
        }, { new: true });

        const savedAddress = updatedUser.adress_details[updatedUser.adress_details.length - 1];

        return response.json({
            message: "Address created successfully",
            success: true,
            error: false,
            data: savedAddress
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Update Address
export async function updateAddressController(request, response) {
    try {
        const userId = request.userId;
        const { _id, adress_line, city, state, pincode, country, mobile } = request.body;

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: userId, "adress_details._id": _id },
            {
                $set: {
                    "adress_details.$.adress_line": adress_line,
                    "adress_details.$.city": city,
                    "adress_details.$.state": state,
                    "adress_details.$.pincode": pincode,
                    "adress_details.$.country": country,
                    "adress_details.$.mobile": mobile
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return response.status(404).json({ message: "Address not found sequence or unauthorized user", error: true, success: false });
        }

        const updatedAddress = updatedUser.adress_details.id(_id);

        return response.json({
            message: "Address updated successfully",
            success: true,
            error: false,
            data: updatedAddress
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Delete Address
export async function deleteAddressController(request, response) {
    try {
        const userId = request.userId;
        const { _id } = request.body;

        if (!_id) {
            return response.status(400).json({
                message: "Address ID is required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const initialLength = user.adress_details.length;
        user.adress_details.pull({ _id: _id });

        if (user.adress_details.length === initialLength) {
            return response.status(404).json({
                message: "Address not found or already deleted",
                error: true,
                success: false
            });
        }

        await user.save();

        return response.json({
            message: "Address deleted successfully",
            success: true,
            error: false
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Get Addresses
export async function getAddressesController(request, response) {
    try {
        const userId = request.userId;
        const user = await UserModel.findById(userId);

        if (!user) {
            return response.status(404).json({ message: "User not found", error: true, success: false });
        }

        return response.json({
            message: "Addresses fetched successfully",
            success: true,
            error: false,
            data: user.adress_details
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// refresh token controller
export async function refreshToken(request, response) {
    try {

        const refreshToken = request.cookies.refreshToken || request.headers?.authorization?.split(" ")[1];

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid Token",
                error: true,
                sucess: false
            });
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);

        if (!verifyToken) ({
            message: "Token expired",
            error: true,
            success: false
        });

        console.log("verifyToken", verifyToken);
        const userId = verifyToken?._id;

        const newAccessToken = await generatedAccessToken(userId);

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', newAccessToken, cookiesOption);

        return response.json({
            message: "New access token generated",
            error: false,
            sucess: true,
            data: {
                accessToken: newAccessToken
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

// get login user deatils 
export async function userDetails(request, response) {
    try {
        const userId = request.userId
        const user = await UserModel.findById(userId)
            .select('-password -refresh_token')
            .populate('shopping_cart.productId')

        return response.json({
            message: 'user details',
            data: user,
            error: false,
            success: true
        })
    } catch (error) {

        return response.status(500).json({
            message: "Something went wrong",
            error: true,
            success: false
        })
    }
}