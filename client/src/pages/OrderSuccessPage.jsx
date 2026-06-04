import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MdCheckCircle, MdLocalShipping, MdShoppingBag, MdReceipt, MdHome } from 'react-icons/md';
import { IoSparkles } from 'react-icons/io5';
import { DisplayPrice } from '../utils/DisplayPrice';
import { useDispatch } from 'react-redux';
import { removeSelectedItems } from '../store/cartSlice';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';

const OrderSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [showContent, setShowContent] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const handleOrderInitialization = async () => {
            if (order) {
                setLoading(false);
                setShowContent(true);
                return;
            }

            // Extract query parameters (for Stripe redirect)
            const searchParams = new URLSearchParams(location.search);
            const paymentIntentId = searchParams.get('payment_intent');
            const redirectStatus = searchParams.get('redirect_status');

            try {
                if (paymentIntentId && redirectStatus === 'succeeded') {
                    // Try to place the order if we have the pending payload in sessionStorage
                    const pendingPayloadStr = sessionStorage.getItem('pendingOrderPayload');
                    if (pendingPayloadStr) {
                        const payload = JSON.parse(pendingPayloadStr);
                        payload.paymentId = paymentIntentId;
                        payload.paymentStatus = 'paid';

                        const response = await Axios({
                            ...SummaryApi.placeOrder,
                            data: payload
                        });

                        if (response.data.success) {
                            sessionStorage.removeItem('pendingOrderPayload');
                            dispatch(removeSelectedItems());
                            setOrder(response.data.data);
                            setLoading(false);
                            setTimeout(() => setShowContent(true), 100);
                            return;
                        }
                    }

                    // Fallback or if already placed (e.g. concurrent webhook/refresh): retrieve from order history
                    const historyResponse = await Axios({ ...SummaryApi.getOrderHistory });
                    if (historyResponse.data.success) {
                        const matchedOrder = historyResponse.data.data.find(
                            (o) => o.paymentId === paymentIntentId
                        );
                        if (matchedOrder) {
                            setOrder(matchedOrder);
                            setLoading(false);
                            setTimeout(() => setShowContent(true), 100);
                            return;
                        }
                    }
                } else {
                    // Refresh fallback: fetch the user's latest order
                    const historyResponse = await Axios({ ...SummaryApi.getOrderHistory });
                    if (historyResponse.data.success && historyResponse.data.data.length > 0) {
                        const latestOrder = historyResponse.data.data[0]; // Sorted by newest first on backend
                        setOrder(latestOrder);
                        setLoading(false);
                        setTimeout(() => setShowContent(true), 100);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error retrieving order:", error);
                toast.error("Failed to load order details.");
            }

            // If we couldn't resolve any order, go back to home page
            toast.error("No valid order found.");
            navigate('/');
        };

        handleOrderInitialization();
    }, [location.search, navigate, dispatch, order]);

    useEffect(() => {
        if (order) {
            const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(confettiTimer);
        }
    }, [order]);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-96px)] bg-gradient-to-br from-emerald-50/50 via-white to-orange-50/30 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-4 max-w-sm w-full text-center">
                    <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Verifying Order...</h2>
                    <p className="text-xs text-slate-400 font-bold">Please wait while we confirm your payment and secure your order.</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-[calc(100vh-96px)] bg-gradient-to-br from-emerald-50/50 via-white to-orange-50/30 relative overflow-hidden">
            {/* Confetti / Sparkle Particles */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 60}%`,
                                width: `${4 + Math.random() * 8}px`,
                                height: `${4 + Math.random() * 8}px`,
                                backgroundColor: ['#f97316', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6'][i % 6],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${1 + Math.random() * 2}s`,
                                opacity: 0.7
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="container mx-auto px-4 py-8 max-w-2xl relative z-20">

                {/* Success Icon and Title */}
                <div className={`text-center mb-8 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200 animate-pulse">
                            <MdCheckCircle className="text-5xl text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <IoSparkles className="text-2xl text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-sm text-slate-500 font-bold">
                        Salamat sa pag-order! Your order has been placed successfully.
                    </p>
                </div>

                {/* Order ID Card */}
                <div className={`bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-5 transition-all duration-700 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MdReceipt className="text-xl text-emerald-400" />
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Order ID</p>
                                <p className="text-white font-black text-sm tracking-wider">{order.orderId}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</p>
                            <span className="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                {order.orderStatus || 'Pending'}
                            </span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-5">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <MdShoppingBag className="text-primary text-sm" />
                            Items Ordered ({order.products?.length || 0})
                        </h3>
                        <div className="space-y-3">
                            {order.products?.map((item, index) => (
                                <div key={index} className="flex items-start sm:items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                    <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 border border-slate-100 flex items-center justify-center p-1 shadow-sm">
                                        <img
                                            src={Array.isArray(item.image) ? item.image[0] : item.image}
                                            alt={item.name}
                                            className="w-full h-full object-scale-down"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-800 line-clamp-2 md:line-clamp-none md:truncate uppercase tracking-tighter">{item.name}</p>
                                        {item.variations?.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 mb-1">
                                                {item.variations.map((v, i) => (
                                                    <span key={i} className="px-1 py-0.5 rounded bg-white border border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-wider italic">
                                                        {v.name}: {v.value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-black text-primary">{DisplayPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="px-5 pb-5">
                        <div className="bg-gradient-to-r from-slate-50 to-emerald-50/30 rounded-xl p-4 border border-slate-100 space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-slate-600">{DisplayPrice(order.subTotalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Shipping</span>
                                <span className={order.shippingFee === 0 ? 'text-emerald-500' : 'text-slate-600'}>
                                    {order.shippingFee === 0 ? 'FREE' : DisplayPrice(order.shippingFee)}
                                </span>
                            </div>
                            <div className="pt-2 mt-2 border-t-2 border-dashed border-slate-200 flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</span>
                                <span className="text-2xl font-black text-slate-900 tracking-tighter">{DisplayPrice(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Info Card */}
                <div className={`bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-5 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="px-5 py-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <MdLocalShipping className="text-blue-500 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Delivering To</h3>
                            <p className="text-xs font-black text-slate-800">{order.deliveryAddress?.adress_line}</p>
                            <p className="text-[11px] text-slate-500 font-bold">
                                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.pincode}
                            </p>
                            {order.deliveryAddress?.mobile && (
                                <p className="text-[10px] text-slate-400 font-bold mt-1">📱 {order.deliveryAddress.mobile}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className={`bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-8 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="px-5 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">💳</span>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Payment Method</h3>
                            <p className="text-xs font-black text-slate-800 capitalize">
                                {order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'Online Payment'}
                            </p>
                        </div>
                        <span className={`ml-auto text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${order.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-amber-100 text-amber-600'
                            }`}>
                            {order.paymentStatus || 'Pending'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-[400ms] ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <Link
                        to="/dashboard/my-orders"
                        className="flex-1 bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 shadow-lg"
                    >
                        <MdShoppingBag className="text-base" />
                        View My Orders
                    </Link>
                    <Link
                        to="/"
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-800 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 border-2 border-slate-200 shadow-sm"
                    >
                        <MdHome className="text-base" />
                        Continue Shopping
                    </Link>
                </div>

                {/* Footer Note */}
                <p className={`text-center text-[9px] text-slate-400 font-bold mt-6 uppercase tracking-widest transition-all duration-700 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                    An email confirmation has been sent to your registered email address
                </p>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
