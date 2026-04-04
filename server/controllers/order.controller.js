import mongoose from "mongoose";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import Stripe from "../config/stripe.js";
import sendEmail from "../config/sendEmail.js";
import orderStatusUpdateTemplate from "../utils/orderStatusUpdateTemplate.js";
import orderCancelledAdminTemplate from "../utils/orderCancelledAdminTemplate.js";
import orderReceiptTemplate from "../utils/orderReceiptTemplate.js";
import newOrderAdminTemplate from "../utils/newOrderAdminTemplate.js";

// Generate a unique order ID like "ORD-20260303-XXXXX"
function generateOrderId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${dateStr}-${random}`;
}

export const placeOrderController = async (request, response) => {
    try {
        const userId = request.userId;

        const {
            products,
            paymentMethod,
            paymentId,
            deliveryAddress,
            subTotalAmount,
            shippingFee,
            totalAmount,
            comment
        } = request.body;

        // Validate required fields
        if (!products || products.length === 0) {
            return response.status(400).json({
                message: "No products in order",
                error: true,
                success: false
            });
        }

        if (!deliveryAddress || !deliveryAddress.adress_line) {
            return response.status(400).json({
                message: "Delivery address is required",
                error: true,
                success: false
            });
        }

        // For online payment, verify the payment was actually successful
        let paymentStatus = 'pending';
        if (paymentMethod === 'online') {
            if (!paymentId) {
                return response.status(400).json({
                    message: "Payment ID is required for online payment",
                    error: true,
                    success: false
                });
            }
            // Verify payment intent status with Stripe
            const paymentIntent = await Stripe.paymentIntents.retrieve(paymentId);
            if (paymentIntent.status === 'succeeded') {
                paymentStatus = 'paid';
            } else {
                return response.status(400).json({
                    message: "Payment has not been completed",
                    error: true,
                    success: false
                });
            }
        }

        // Create the order
        const order = new OrderModel({
            userId,
            orderId: generateOrderId(),
            products: products.map(item => ({
                productId: item.productId,
                name: item.name,
                image: item.image,
                quantity: item.quantity,
                price: item.price,
                variations: item.variations || []
            })),
            paymentMethod: paymentMethod || 'cod',
            paymentId: paymentId || '',
            paymentStatus,
            deliveryAddress,
            subTotalAmount,
            shippingFee,
            totalAmount,
            comment: comment || "",
            orderStatus: 'pending',
            statusHistory: [{
                status: 'pending',
                timestamp: new Date(),
                updatedBy: userId
            }]
        });

        const savedOrder = await order.save();

        // ── Reduce product stock for each ordered item ──────────────────────
        for (const item of products) {
            const product = await ProductModel.findById(item.productId);
            if (!product) continue;

            const hasVariations = item.variations && item.variations.length > 0;

            if (hasVariations && product.variationStocks && product.variationStocks.length > 0) {
                // Find the matching variationStocks entry
                const matchIdx = product.variationStocks.findIndex(vs => {
                    const combos = vs.combinations || {};
                    return item.variations.every(v => {
                        // Match by variation name → selected value
                        const comboVal = combos[v.name];
                        return comboVal && comboVal.toString().toLowerCase() === v.value.toString().toLowerCase();
                    });
                });

                if (matchIdx !== -1) {
                    // Decrement the variation stock (floor at 0)
                    product.variationStocks[matchIdx].stock = Math.max(
                        0,
                        (product.variationStocks[matchIdx].stock || 0) - item.quantity
                    );
                }

                // Recalculate overall stock as sum of all variation stocks
                product.stock = product.variationStocks.reduce((sum, vs) => sum + (vs.stock || 0), 0);
            } else {
                // Simple product – just decrement top-level stock
                product.stock = Math.max(0, (product.stock || 0) - item.quantity);
            }

            await product.save();
        }

        // Add to user's order history
        await UserModel.findByIdAndUpdate(userId, {
            $push: { orderHistory: savedOrder._id }
        });

        // Clear the user's shopping cart after placing order
        await UserModel.findByIdAndUpdate(userId, {
            $set: { shopping_cart: [] }
        });

        // ── Send receipt email to customer ─────────────────────────
        try {
            const customer = await UserModel.findById(userId);
            if (customer && customer.email) {
                await sendEmail({
                    sendTo: customer.email,
                    subject: `Order Confirmation – ${savedOrder.orderId}`,
                    html: orderReceiptTemplate({
                        name: customer.name,
                        orderId: savedOrder.orderId,
                        products: savedOrder.products,
                        totalAmount: savedOrder.totalAmount,
                        subTotalAmount: savedOrder.subTotalAmount,
                        shippingFee: savedOrder.shippingFee,
                        paymentMethod: savedOrder.paymentMethod,
                        deliveryAddress: savedOrder.deliveryAddress,
                        frontendUrl: process.env.FRONTEND_URL
                    })
                });
            }
        } catch (emailError) {
            console.error('Failed to send order receipt email:', emailError);
        }

        // ── Notify all admins about new order ──────────────────────────
        try {
            const customer = await UserModel.findById(userId);
            const admins = await UserModel.find({ role: 'ADMIN' });
            for (const admin of admins) {
                if (admin.email) {
                    await sendEmail({
                        sendTo: admin.email,
                        subject: `🔔 New Order Received – ${savedOrder.orderId}`,
                        html: newOrderAdminTemplate({
                            customerName: customer?.name || 'Unknown',
                            customerEmail: customer?.email || 'N/A',
                            orderId: savedOrder.orderId,
                            products: savedOrder.products,
                            totalAmount: savedOrder.totalAmount,
                            subTotalAmount: savedOrder.subTotalAmount,
                            shippingFee: savedOrder.shippingFee,
                            paymentMethod: savedOrder.paymentMethod,
                            deliveryAddress: savedOrder.deliveryAddress,
                            frontendUrl: process.env.FRONTEND_URL
                        })
                    });
                }
            }
        } catch (adminEmailError) {
            console.error('Failed to send new order notification to admin:', adminEmailError);
        }

        return response.json({
            message: "Order placed successfully!",
            data: savedOrder,
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
};


export const createPaymentIntentController = async (request, response) => {
    try {
        const {
            totalAmount,
            shippingFee,
            subTotalAmount,
            products
        } = request.body;

        if (!totalAmount || !products || products.length === 0) {
            return response.status(400).json({
                message: "Missing required order details",
                error: true,
                success: false
            });
        }

        const paymentIntent = await Stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: "php",
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
            metadata: {
                products: JSON.stringify(products.map(p => ({ name: p.name, qty: p.quantity }))),
                shippingFee: String(shippingFee),
                subTotalAmount: String(subTotalAmount),
                totalAmount: String(totalAmount),
            },
        });

        response.json({
            clientSecret: paymentIntent.client_secret,
            success: true,
            error: false,
        });
    } catch (error) {
        response.status(500).json({
            message: error.message,
            error: true,
            success: false,
        });
    }
};


export const webhookStripe = async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET_KEY;

    let event;

    try {
        event = Stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);

            // Here we would typically update the order in the database if it was already created
            // with a 'pending' status. Since placeOrderController is called after payment success
            // in this current frontend-driven flow, the order might already be marked as paid.
            // If the order was created *before* confirming payment, we would update it here.

            // Fallback: If placeOrderController wasn't called (e.g. user closed tab),
            // we could potentially create the order here if metadata contains enough info.

            await OrderModel.findOneAndUpdate(
                { paymentId: paymentIntent.id },
                { paymentStatus: 'paid' }
            );

            break;
        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;
            console.log(`PaymentIntent for ${failedIntent.amount} failed.`);

            await OrderModel.findOneAndUpdate(
                { paymentId: failedIntent.id },
                { paymentStatus: 'failed' }
            );

            break;
        default:
            console.log(`Unhandled event type ${event.type}.`);
    }

    response.json({ received: true });
};

// Get all orders for a user (Order History)
export const getOrderDetailsController = async (request, response) => {
    try {
        const userId = request.userId;

        const orderHistory = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 });

        return response.json({
            message: "Order details fetched",
            error: false,
            success: true,
            data: orderHistory
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get specific order items / details
export const getOrderProductItemsController = async (request, response) => {
    try {
        const userId = request.userId;
        const { orderId } = request.body; // or from params if you prefer

        if (!orderId) {
            return response.status(400).json({
                message: "Order ID is required",
                error: true,
                success: false
            });
        }

        const order = await OrderModel.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Order items fetched",
            error: false,
            success: true,
            data: order.products
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
// Get single order details (for buyer or seller)
export const getOrderDetailsByIdController = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.userId;

        // Fetch user once to check role
        const user = await UserModel.findById(userId);

        // Find the order
        const order = await OrderModel.findById(id).populate('statusHistory.updatedBy', 'name email');

        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Allow if user is order owner or an ADMIN
        if (order.userId.toString() !== userId && user.role !== 'ADMIN') {
            return response.status(403).json({
                message: "Unauthorized access to order details",
                error: true,
                success: false
            });
        }

        // If admin is viewing, mark as seen
        if (user.role === 'ADMIN' && !order.isAdminSeen) {
            order.isAdminSeen = true;
            await order.save();
        }

        return response.json({
            message: "Order details fetched",
            error: false,
            success: true,
            data: order
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Update Order Status (Admin/Seller only)
export const updateOrderStatusController = async (request, response) => {
    try {
        const { id } = request.params;
        const { status, trackingNumber } = request.body;
        const userId = request.userId; // The admin/seller ID

        if (!status) {
            return response.status(400).json({
                message: "Status is required",
                error: true,
                success: false
            });
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return response.status(400).json({
                message: "Invalid status value",
                error: true,
                success: false
            });
        }

        const order = await OrderModel.findById(id);

        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Update the order
        order.orderStatus = status;
        order.isAdminSeen = true; // Mark as seen since admin modified it
        if (trackingNumber !== undefined) {
            order.trackingNumber = trackingNumber;
        }

        if (status === 'delivered' && order.paymentMethod === 'cod') {
            order.paymentStatus = 'paid';
        }

        // Add to history
        order.statusHistory.push({
            status: status,
            timestamp: new Date(),
            updatedBy: userId
        });

        const updatedOrder = await order.save();
        const populatedOrder = await OrderModel.findById(updatedOrder._id).populate('statusHistory.updatedBy', 'name email');

        // ── Send email notification to customer (only if status is not pending) ──
        if (status !== 'pending') {
            try {
                const customer = await UserModel.findById(order.userId);
                if (customer && customer.email) {
                    await sendEmail({
                        sendTo: customer.email,
                        subject: `Order ${order.orderId} – Status Updated to ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                        html: orderStatusUpdateTemplate({
                            name: customer.name,
                            orderId: order.orderId,
                            status,
                            products: order.products,
                            totalAmount: order.totalAmount,
                            trackingNumber: order.trackingNumber || '',
                            frontendUrl: process.env.FRONTEND_URL
                        })
                    });
                }
            } catch (emailError) {
                console.error('Failed to send order status email:', emailError);
            }
        }

        return response.json({
            message: `Order status updated to ${status}`,
            error: false,
            success: true,
            data: populatedOrder
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get All Orders (Admin only)
export const getAllOrdersController = async (request, response) => {
    try {
        const orders = await OrderModel.find({})
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('statusHistory.updatedBy', 'name email');

        return response.json({
            message: "All orders fetched",
            error: false,
            success: true,
            data: orders
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
// Cancel Order (User only)
export const cancelOrderController = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.userId;

        const order = await OrderModel.findById(id);

        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Check if the order belongs to the user
        if (order.userId.toString() !== userId) {
            return response.status(403).json({
                message: "Unauthorized to cancel this order",
                error: true,
                success: false
            });
        }

        // Prevent cancellation if status is not 'pending'
        if (order.orderStatus !== 'pending') {
            return response.status(400).json({
                message: `Order cannot be cancelled. Current status is ${order.orderStatus}`,
                error: true,
                success: false
            });
        }

        order.orderStatus = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date(),
            updatedBy: userId
        });

        await order.save();

        // ── Notify all admins about cancellation ────────────────────────
        try {
            const customer = await UserModel.findById(userId);
            const admins = await UserModel.find({ role: 'ADMIN' });
            for (const admin of admins) {
                if (admin.email) {
                    await sendEmail({
                        sendTo: admin.email,
                        subject: `⚠️ Order ${order.orderId} Cancelled by ${customer?.name || 'Customer'}`,
                        html: orderCancelledAdminTemplate({
                            customerName: customer?.name || 'Unknown',
                            customerEmail: customer?.email || 'N/A',
                            orderId: order.orderId,
                            products: order.products,
                            totalAmount: order.totalAmount,
                            frontendUrl: process.env.FRONTEND_URL
                        })
                    });
                }
            }
        } catch (emailError) {
            console.error('Failed to send cancellation email to admin:', emailError);
        }

        // ── Restore product stock on cancellation ───────────────────────────
        for (const item of order.products) {
            const product = await ProductModel.findById(item.productId);
            if (!product) continue;

            const hasVariations = item.variations && item.variations.length > 0;

            if (hasVariations && product.variationStocks && product.variationStocks.length > 0) {
                const matchIdx = product.variationStocks.findIndex(vs => {
                    const combos = vs.combinations || {};
                    return item.variations.every(v => {
                        const comboVal = combos[v.name];
                        return comboVal && comboVal.toString().toLowerCase() === v.value.toString().toLowerCase();
                    });
                });

                if (matchIdx !== -1) {
                    product.variationStocks[matchIdx].stock =
                        (product.variationStocks[matchIdx].stock || 0) + item.quantity;
                }

                product.stock = product.variationStocks.reduce((sum, vs) => sum + (vs.stock || 0), 0);
            } else {
                product.stock = (product.stock || 0) + item.quantity;
            }

            await product.save();
        }

        return response.json({
            message: "Order cancelled successfully",
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
};
// Delete Order (Admin only)
export const deleteOrderController = async (request, response) => {
    try {
        const { id } = request.params;

        const order = await OrderModel.findById(id);

        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Only allow deleting cancelled orders (as per request, but can be adjusted)
        if (order.orderStatus !== 'cancelled') {
            return response.status(400).json({
                message: "Only cancelled orders can be deleted",
                error: true,
                success: false
            });
        }

        await OrderModel.findByIdAndDelete(id);

        // Also remove from user's orderHistory
        await UserModel.findByIdAndUpdate(order.userId, {
            $pull: { orderHistory: id }
        });

        return response.json({
            message: "Order deleted successfully",
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
};

// Get Count of Unseen Orders (Admin only)
export const getUnseenOrderCountController = async (request, response) => {
    try {
        const count = await OrderModel.countDocuments({ isAdminSeen: false });

        return response.json({
            message: "Unseen order count fetched",
            error: false,
            success: true,
            data: { count }
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Mark All Orders as Seen (Admin only)
export const markAllOrdersAsSeenController = async (request, response) => {
    try {
        await OrderModel.updateMany({ isAdminSeen: false }, { $set: { isAdminSeen: true } });

        return response.json({
            message: "All orders marked as seen",
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
};

