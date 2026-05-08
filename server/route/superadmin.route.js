import { Router } from 'express';
import auth from '../middleware/auth.js';
import superadmin from '../middleware/superadmin.js';
import {
    getEmailSettings,
    updateEmailSettings,
    getAdmins,
    addAdmin,
    removeAdmin,
    checkUserByEmail
} from '../controllers/superadmin.controller.js';

const superadminRouter = Router();

// All routes require authentication + superadmin role
superadminRouter.get('/email-settings', auth, superadmin, getEmailSettings);
superadminRouter.put('/email-settings', auth, superadmin, updateEmailSettings);

superadminRouter.get('/admins', auth, superadmin, getAdmins);
superadminRouter.post('/add-admin', auth, superadmin, addAdmin);
superadminRouter.delete('/remove-admin', auth, superadmin, removeAdmin);
superadminRouter.post('/check-user', auth, superadmin, checkUserByEmail);

export default superadminRouter;
