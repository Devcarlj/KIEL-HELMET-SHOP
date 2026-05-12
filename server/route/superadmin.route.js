import { Router } from 'express';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import superadmin from '../middleware/superadmin.js';
import {
    getEmailSettings,
    updateEmailSettings,
    getAdmins,
    addAdmin,
    removeAdmin,
    checkUserByEmail,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
} from '../controllers/superadmin.controller.js';

const superadminRouter = Router();

// All routes require authentication + superadmin role
superadminRouter.get('/email-settings', auth, superadmin, getEmailSettings);
superadminRouter.put('/email-settings', auth, superadmin, updateEmailSettings);

superadminRouter.get('/admins', auth, superadmin, getAdmins);
superadminRouter.post('/add-admin', auth, superadmin, addAdmin);
superadminRouter.delete('/remove-admin', auth, superadmin, removeAdmin);
superadminRouter.post('/check-user', auth, superadmin, checkUserByEmail);

// ── Customer Management (Admin + SuperAdmin can view/edit; only SuperAdmin can delete) ──
superadminRouter.get('/customers',        auth, admin,       getAllUsers);
superadminRouter.get('/customers/:id',    auth, admin,       getUserById);
superadminRouter.put('/customers/:id',    auth, admin,       updateUserById);
superadminRouter.delete('/customers/:id', auth, superadmin,  deleteUserById);

export default superadminRouter;
