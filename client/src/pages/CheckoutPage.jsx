import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedCartItems, selectCartTotal, selectCartTotalSavings, selectCartOriginalTotal, removeSelectedItems } from '../store/cartSlice';
import { setUserDetails, selectUser, deleteAddressAction } from '../store/userSlice';
import { DisplayPrice } from '../utils/DisplayPrice';
import { MdOutlineLocationOn, MdPayment, MdAddCircleOutline, MdCheckCircle, MdEdit, MdDeleteOutline, MdLock } from "react-icons/md";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate, Link } from 'react-router-dom';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
  developerTools: {
    assistant: {
      enabled: false,
    },
  },
});

// ─── Stripe Payment Form Component ───────────────────────────────────────────
const StripePaymentForm = ({ onPaymentSuccess, onPaymentError, placingOrder, setPlacingOrder }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPlacingOrder(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/order-success',
        },
        redirect: 'if_required',
      });

      if (error) {
        onPaymentError(error.message);
        setIsProcessing(false);
        setPlacingOrder(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (err) {
      onPaymentError(err.message || 'Payment failed');
      setIsProcessing(false);
      setPlacingOrder(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="stripe-payment-form">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100 flex items-center gap-2">
          <MdLock className="text-indigo-500 text-lg" />
          <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Secure Card Payment</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <img src="https://cdn.jsdelivr.net/gh/nicepay-dev/visa-logo@main/visa.svg" alt="Visa" loading="lazy" className="h-5 opacity-60" onError={(e) => e.target.style.display = 'none'} />
            <img src="https://cdn.jsdelivr.net/gh/nicepay-dev/mastercard-logo@main/mastercard.svg" alt="Mastercard" loading="lazy" className="h-5 opacity-60" onError={(e) => e.target.style.display = 'none'} />
          </div>
        </div>
        <div className="p-4">
          <PaymentElement
            options={{
              layout: 'tabs',
              style: {
                base: {
                  fontSize: '14px',
                  fontFamily: '"Inter", system-ui, sans-serif',
                }
              }
            }}
          />
        </div>
      </div>
      {/* Submit button is handled externally via the Place Order button */}
    </form>
  );
};


// ─── Main Checkout Page ──────────────────────────────────────────────────────
const CheckoutPage = () => {
  const cartItems = useSelector(selectSelectedCartItems);
  const orderPlacedRef = useRef(false);
  const cartTotal = useSelector(selectCartTotal);
  const cartSavings = useSelector(selectCartTotalSavings);
  const user = useSelector(selectUser);
  const addresses = user.adress_details || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?._id || null);
  const [isAddressFormVisible, setIsAddressFormVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    adress_line: '',
    city: '',
    state: '',
    pincode: '',
    country: 'Philippines',
    mobile: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [comment, setComment] = useState('');

  // Stripe state
  const [clientSecret, setClientSecret] = useState('');
  const [loadingPaymentIntent, setLoadingPaymentIntent] = useState(false);

  // Calculations
  const shippingFee = cartTotal > 1500 ? 0 : 50;
  const finalTotal = cartTotal + shippingFee;

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]._id);
    }
  }, [addresses, selectedAddress]);

  // Create payment intent when switching to online payment
  useEffect(() => {
    if (paymentMethod === 'online' && cartItems.length > 0 && !clientSecret) {
      createPaymentIntent();
    }
  }, [paymentMethod, cartItems.length]);

  // Redirect if no items selected
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlacedRef.current) {
      navigate('/');
      toast.error("No items selected for checkout");
    }
  }, [cartItems.length, navigate]);

  const createPaymentIntent = async () => {
    setLoadingPaymentIntent(true);
    try {
      const response = await Axios({
        ...SummaryApi.createPaymentIntent,
        data: {
          totalAmount: finalTotal,
          shippingFee,
          subTotalAmount: cartTotal,
          products: cartItems.map(item => ({
            productId: item.productId?._id,
            name: item.productId?.name,
            quantity: item.quantity,
            price: Math.round((item.productId?.price || 0) * (1 - (item.productId?.discount || 0) / 100)),
            variations: item.variations
          }))
        }
      });

      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
      }
    } catch (error) {
      toast.error('Failed to initialize payment. Please try again.');
      console.error('Payment intent error:', error);
    } finally {
      setLoadingPaymentIntent(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await Axios({ ...SummaryApi.userDetails });
      if (response.data.success) {
        dispatch(setUserDetails(response.data.data));
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  const handleAddressFormSubmit = async (e) => {
    e.preventDefault();
    if (!newAddress.adress_line || !newAddress.city) {
      toast.error("Please fill in address and city");
      return;
    }

    try {
      let response;
      if (editingAddressId) {
        // Update existing
        response = await Axios({
          ...SummaryApi.updateAddress,
          data: { ...newAddress, _id: editingAddressId }
        });
      } else {
        // Add new
        response = await Axios({
          ...SummaryApi.addAddress,
          data: newAddress
        });
      }

      if (response.data.success) {
        toast.success(response.data.message);
        await refreshUserData();
        setIsAddressFormVisible(false);
        setEditingAddressId(null);
        setNewAddress({ adress_line: '', city: '', state: '', pincode: '', country: 'Philippines', mobile: '' });
        if (!editingAddressId) {
          setSelectedAddress(response.data.data._id);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEditAddress = (e, addr) => {
    e.stopPropagation();
    setEditingAddressId(addr._id);
    setNewAddress({
      adress_line: addr.adress_line,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || 'Philippines',
      mobile: addr.mobile
    });
    setIsAddressFormVisible(true);
  };

  const handleDeleteAddress = async (e, addrId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await Axios({
        ...SummaryApi.deleteAddress,
        data: { _id: addrId }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(deleteAddressAction(addrId));
        await refreshUserData();
        if (selectedAddress === addrId) {
          setSelectedAddress(null);
        }
      }
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  // Place the order (COD or after Stripe payment succeeds)
  const placeOrder = async (paymentId = null) => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    const selectedAddr = addresses.find(a => a._id === selectedAddress);

    const orderPayload = {
      products: cartItems.map(item => ({
        productId: item.productId?._id,
        name: item.productId?.name,
        image: Array.isArray(item.productId?.image) ? item.productId.image : [item.productId?.image],
        quantity: item.quantity,
        price: Math.round((item.productId?.price || 0) * (1 - (item.productId?.discount || 0) / 100)),
        variations: item.variations
      })),
      paymentMethod,
      paymentId: paymentId || undefined,
      deliveryAddress: {
        adress_line: selectedAddr.adress_line,
        city: selectedAddr.city,
        state: selectedAddr.state,
        pincode: selectedAddr.pincode,
        country: selectedAddr.country,
        mobile: selectedAddr.mobile
      },
      subTotalAmount: cartTotal,
      shippingFee,
      totalAmount: finalTotal,
      comment
    };

    try {
      const response = await Axios({
        ...SummaryApi.placeOrder,
        data: orderPayload
      });

      if (response.data.success) {
        toast.success('Salamat! Order placed successfully.');
        sessionStorage.removeItem('pendingOrderPayload');
        orderPlacedRef.current = true;
        dispatch(removeSelectedItems());
        navigate('/order-success', { state: { order: response.data.data } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Handle COD order
  const handlePlaceOrderCOD = async () => {
    setPlacingOrder(true);
    await placeOrder();
  };

  // Handle Stripe payment success
  const handleStripePaymentSuccess = async (paymentIntentId) => {
    await placeOrder(paymentIntentId);
  };

  // Handle Stripe payment error
  const handleStripePaymentError = (errorMessage) => {
    toast.error(errorMessage || 'Payment failed. Please try again.');
  };

  // When user clicks "Place Order" and payment method is online,
  // we submit the Stripe form programmatically
  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    const selectedAddr = addresses.find(a => a._id === selectedAddress);
    if (selectedAddr) {
      const orderPayload = {
        products: cartItems.map(item => ({
          productId: item.productId?._id,
          name: item.productId?.name,
          image: Array.isArray(item.productId?.image) ? item.productId.image : [item.productId?.image],
          quantity: item.quantity,
          price: Math.round((item.productId?.price || 0) * (1 - (item.productId?.discount || 0) / 100)),
          variations: item.variations
        })),
        paymentMethod,
        deliveryAddress: {
          adress_line: selectedAddr.adress_line,
          city: selectedAddr.city,
          state: selectedAddr.state,
          pincode: selectedAddr.pincode,
          country: selectedAddr.country,
          mobile: selectedAddr.mobile
        },
        subTotalAmount: cartTotal,
        shippingFee,
        totalAmount: finalTotal,
        comment
      };
      sessionStorage.setItem('pendingOrderPayload', JSON.stringify(orderPayload));
    }

    if (paymentMethod === 'cod') {
      handlePlaceOrderCOD();
    } else {
      // Submit the Stripe form
      const form = document.getElementById('stripe-payment-form');
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const stripeElementsOptions = clientSecret ? {
    clientSecret,
    assistant: { enabled: false },
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#6366f1',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#ef4444',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSizeBase: '14px',
        borderRadius: '12px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          border: '2px solid #e2e8f0',
          boxShadow: 'none',
          padding: '10px 14px',
        },
        '.Input:focus': {
          border: '2px solid #6366f1',
          boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
        },
        '.Label': {
          fontWeight: '700',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#64748b',
        },
        '.Tab': {
          border: '2px solid #e2e8f0',
          borderRadius: '10px',
        },
        '.Tab--selected': {
          border: '2px solid #6366f1',
          backgroundColor: '#eef2ff',
        },
      },
    },
  } : null;

  return (
    <div className="bg-[#f8fafc] lg:h-[calc(100vh-96px)] flex flex-col overflow-hidden">
      {/* Context Breadcrumb - Compact */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-slate-100 shrink-0">
        <div className="container mx-auto px-4 py-2 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-primary/10 text-slate-500 hover:text-primary transition-all group"
            title="Back to Shop"
          >
            <IoArrowBackOutline className="text-xl group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <span className="text-slate-400">Cart</span>
            <span className="text-slate-200">/</span>
            <span className="text-primary underline decoration-2 underline-offset-4">Checkout</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 h-full py-4 lg:py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full items-stretch">

            {/* Left Side (Scrollable if needed, but compact) */}
            <div className="lg:col-span-7 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6 lg:pb-0">

              {/* 1. Shipping Address */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 shrink-0 overflow-hidden">
                <div className="px-4 py-3 flex justify-between items-center bg-slate-50/50 border-b border-slate-50">
                  <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                    <MdOutlineLocationOn className="text-primary text-xl" />
                    Delivery Details
                  </h2>
                  <button
                    onClick={() => {
                      if (isAddressFormVisible) {
                        setIsAddressFormVisible(false);
                        setEditingAddressId(null);
                        setNewAddress({ adress_line: '', city: '', state: '', pincode: '', country: 'Philippines', mobile: '' });
                      } else {
                        setIsAddressFormVisible(true);
                      }
                    }}
                    className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-all uppercase"
                  >
                    {isAddressFormVisible ? 'CLOSE' : '+ NEW ADDRESS'}
                  </button>
                </div>

                <div className="p-4">
                  {!isAddressFormVisible ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {addresses.length > 0 ? (
                        addresses.map(addr => (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddress(addr._id)}
                            className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer group ${selectedAddress === addr._id
                              ? 'border-primary bg-orange-50/20 shadow-sm'
                              : 'border-slate-50 hover:border-primary/20 bg-slate-50/30'
                              }`}
                          >
                            {selectedAddress === addr._id && (
                              <MdCheckCircle className="absolute top-2 right-2 text-primary text-md" />
                            )}

                            <div className="flex justify-between items-start mb-1.5">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${selectedAddress === addr._id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                {addr.city}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleEditAddress(e, addr)}
                                  className="p-1 rounded bg-white text-slate-400 hover:text-primary border border-slate-100 shadow-sm transition-colors"
                                >
                                  <MdEdit className="text-xs" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteAddress(e, addr._id)}
                                  className="p-1 rounded bg-white text-slate-400 hover:text-red-500 border border-slate-100 shadow-sm transition-colors"
                                >
                                  <MdDeleteOutline className="text-xs" />
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] font-black text-slate-800 truncate leading-none mb-1">{addr.adress_line}</p>
                            <p className="text-[10px] text-slate-500 font-bold truncate leading-none">
                              {addr.city}, {addr.state} {addr.pincode}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-8 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                          <MdOutlineLocationOn className="text-4xl text-slate-200 mb-2" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No shipping addresses found</p>
                          <button
                            onClick={() => setIsAddressFormVisible(true)}
                            className="mt-2 text-[9px] font-black text-primary hover:underline uppercase"
                          >
                            + Add your first address
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleAddressFormSubmit} className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="grid grid-cols-1 gap-3">
                        <input type="text" placeholder="Address Line" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none" value={newAddress.adress_line} onChange={e => setNewAddress({ ...newAddress, adress_line: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="City" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                        <input type="text" placeholder="Province/State" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="text" placeholder="ZIP/Pincode" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                        <input type="text" placeholder="Country" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} required />
                        <input type="text" placeholder="Mobile No." className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none" value={newAddress.mobile} onChange={e => setNewAddress({ ...newAddress, mobile: e.target.value })} required />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors">
                          {editingAddressId ? 'UPDATE ADDRESS' : 'SAVE & SELECT'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddressFormVisible(false);
                            setEditingAddressId(null);
                          }}
                          className="px-4 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase hover:bg-slate-200 transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>

              {/* 2. Payment Method */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 shrink-0 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-50">
                  <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                    <MdPayment className="text-emerald-500 text-xl" />
                    Payment Options
                  </h2>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-50 bg-slate-50/30'
                    }`}>
                    <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-4 h-4 accent-emerald-600" />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-[11px] uppercase tracking-tighter">Online Payment</p>
                      <p className="text-[9px] text-slate-500 font-bold truncate">Credit / Debit Card</p>
                    </div>
                  </label>

                  <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-50 bg-slate-50/30'
                    }`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 accent-emerald-600" />
                    <div className="ml-3">
                      <p className="font-black text-slate-800 text-[11px] uppercase tracking-tighter">Cash On Delivery</p>
                      <p className="text-[9px] text-slate-500 font-bold">Standard Delivery</p>
                    </div>
                  </label>
                </div>
              </section>

              {/* 2.5 Order Comment / Note */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 shrink-0 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-50">
                  <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                    <MdEdit className="text-blue-500 text-xl" />
                    Order Note / Comment
                  </h2>
                </div>
                <div className="p-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any special instructions or comments for your order?"
                    className="w-full min-h-[80px] p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700 resize-y"
                  ></textarea>
                </div>
              </section>

              {/* 3. Stripe Card Form — only when online payment selected */}
              {paymentMethod === 'online' && (
                <section className="shrink-0">
                  {loadingPaymentIntent ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initializing secure payment...</p>
                    </div>
                  ) : clientSecret && stripeElementsOptions ? (
                    <Elements stripe={stripePromise} options={stripeElementsOptions}>
                      <StripePaymentForm
                        onPaymentSuccess={handleStripePaymentSuccess}
                        onPaymentError={handleStripePaymentError}
                        placingOrder={placingOrder}
                        setPlacingOrder={setPlacingOrder}
                      />
                    </Elements>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 flex flex-col items-center justify-center gap-2">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Failed to load payment form</p>
                      <button
                        onClick={createPaymentIntent}
                        className="text-[10px] font-black text-indigo-500 hover:underline uppercase"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Right Side - Summary (Self-Contained Card) */}
            <div className="lg:col-span-5 h-full flex flex-col min-h-0">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-900">
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Summary</h2>
                </div>

                {/* Items List - Scrollable */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar bg-slate-50/30">
                  {cartItems.map((item) => {
                    const product = item.productId;
                    const effectivePrice = Math.round((product?.price || 0) * (1 - (product?.discount || 0) / 100));
                    return (
                      <div key={item._id} className="flex gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                        <Link to={`/product/${product?._id}`} className="w-12 h-12 bg-white rounded-lg flex-shrink-0 border border-slate-50 flex items-center justify-center p-1 hover:border-primary transition-colors">
                          <img src={Array.isArray(product?.image) ? product.image[0] : product?.image} alt={product?.name} loading="lazy" className="w-full h-full object-scale-down" />
                        </Link>
                        <div className="flex-1 min-w-0 py-0.5">
                          <Link to={`/product/${product?._id}`} className="hover:text-primary transition-colors">
                            <p className="text-[10px] font-black text-slate-800 line-clamp-1 mb-0.5 uppercase tracking-tighter">{product?.name}</p>
                          </Link>
                          {/* Selected Variation */}
                          {item.variations?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {item.variations.map((v, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[8px] font-black text-slate-500 uppercase tracking-wider italic">
                                  {v.name}: {v.value}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400">QTY: {item.quantity}</span>
                            <div className="flex items-center gap-2">
                              {product?.discount > 0 && (
                                <span className="text-[9px] text-slate-400 line-through">
                                  {DisplayPrice(product.price * item.quantity)}
                                </span>
                              )}
                              <span className="text-primary font-black text-[11px]">
                                {DisplayPrice(effectivePrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals - Always Visible */}
                <div className="px-5 py-4 border-t border-slate-200 bg-white shrink-0 space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-slate-600">{DisplayPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/50 p-1 px-2 rounded-lg border border-emerald-100/50">
                    <span>Money Saved</span>
                    <span>-{DisplayPrice(cartSavings)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1 px-2">
                    <span>Shipping</span>
                    <span className={shippingFee === 0 ? 'text-emerald-500 font-black' : 'text-slate-600'}>
                      {shippingFee === 0 ? 'FREE' : DisplayPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="pt-3 mt-1 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Final Amount</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{DisplayPrice(finalTotal)}</p>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={cartItems.length === 0 || placingOrder || (paymentMethod === 'online' && !clientSecret)}
                      className="bg-cta-green hover:bg-emerald-600 text-white px-7 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.95] shadow-xl shadow-emerald-100 disabled:bg-slate-200 disabled:shadow-none flex items-center gap-2"
                    >
                      {placingOrder ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                          {paymentMethod === 'online' ? 'PAYING...' : 'PLACING...'}
                        </>
                      ) : (
                        <>
                          {paymentMethod === 'online' && <MdLock className="text-sm" />}
                          {paymentMethod === 'online' ? 'PAY NOW' : 'PLACE ORDER'}
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[8px] text-center text-slate-400 font-bold pt-2 uppercase tracking-tighter">
                    {paymentMethod === 'online' ? '🔒 Secure Payment Powered by Stripe' : 'Secure Checkout Powered by Kiel Helmet Shop'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
