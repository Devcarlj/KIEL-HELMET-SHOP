import { Router } from 'express'
import {

    deleteUserAvatar,
    forgotPasswordController,
    loginController, logoutController,
    refreshToken,
    registerUserController,
    resetPassword,
    updateUserDetails,
    uploadUserAvatar,
    userDetails,
    verifyEmailController,
    verifyOtpForgotPassword,
    addAddressController,
    updateAddressController,
    deleteAddressController,
    getAddressesController,
    getFavorites,
    toggleFavorite
} from '../controllers/user.controller.js';

import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const userRouter = Router();
userRouter.post('/register', registerUserController);
userRouter.post('/verify-email', verifyEmailController);
userRouter.post('/login', authLimiter, loginController);
userRouter.get('/logout', auth, logoutController);
userRouter.put('/upload-avatar', auth, upload.single('avatar'), uploadUserAvatar);
userRouter.put('/update-user', auth, updateUserDetails);
userRouter.put('/forgot-password', forgotPasswordController);
userRouter.put('/verify-forgot-password-otp', authLimiter, verifyOtpForgotPassword);
userRouter.put('/reset-password', resetPassword);
userRouter.post('/refresh-token', refreshToken);
userRouter.get('/user-details', auth, userDetails);
userRouter.delete('/delete-avatar', deleteUserAvatar);


userRouter.post('/add-address', auth, addAddressController);
userRouter.get('/get-address', auth, getAddressesController);
userRouter.put('/update-address', auth, updateAddressController);
userRouter.delete('/delete-address', auth, deleteAddressController);

userRouter.post('/toggle-favorite', auth, toggleFavorite);
userRouter.get('/get-favorites', auth, getFavorites);


export default userRouter;
