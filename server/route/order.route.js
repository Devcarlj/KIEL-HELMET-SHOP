import { Router } from 'express';
import {
    placeOrderController,
    createPaymentIntentController,
    getOrderDetailsController,
    getOrderProductItemsController,
    updateOrderStatusController,
    getAllOrdersController,
    getOrderDetailsByIdController,
    cancelOrderController,
    deleteOrderController,
    getUnseenOrderCountController,
    markAllOrdersAsSeenController
} from '../controllers/order.controller.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const orderRouter = Router();

orderRouter.post('/place', auth, placeOrderController);
orderRouter.post('/create-payment-intent', auth, createPaymentIntentController);
orderRouter.get('/order-list', auth, getOrderDetailsController);
orderRouter.post('/order-product', auth, getOrderProductItemsController);

// New Routes
orderRouter.get('/all-orders', auth, admin, getAllOrdersController);
orderRouter.put('/update-status/:id', auth, admin, updateOrderStatusController);
orderRouter.get('/order-details/:id', auth, getOrderDetailsByIdController);
orderRouter.put('/cancel-order/:id', auth, cancelOrderController);
orderRouter.get('/unseen-count', auth, admin, getUnseenOrderCountController);
orderRouter.put('/mark-as-seen', auth, admin, markAllOrdersAsSeenController);
orderRouter.delete('/delete-order/:id', auth, admin, deleteOrderController);

export default orderRouter;

