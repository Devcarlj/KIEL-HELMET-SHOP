import { Router } from 'express';
import {
    addToCartController,
    getCartItemsController,
    updateCartItemController,
    deleteCartItemController
} from '../controllers/cart.controller.js';
import auth from '../middleware/auth.js';

const cartRouter = Router();

cartRouter.post('/add', auth, addToCartController);
cartRouter.get('/get', auth, getCartItemsController);
cartRouter.put('/update', auth, updateCartItemController);
cartRouter.delete('/delete', auth, deleteCartItemController);

export default cartRouter;
