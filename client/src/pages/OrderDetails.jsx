import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { DisplayPrice } from '../utils/DisplayPrice'
import Loading from '../components/Loading'
import { HiOutlineChevronLeft, HiOutlineExternalLink, HiOutlineCheckCircle, HiOutlineTruck, HiOutlineClock, HiOutlineBan, HiOutlineCog, HiOutlineDocumentDownload, HiOutlineClipboardList } from "react-icons/hi";
import toast from 'react-hot-toast'
import CancelOrderConfirm from '../components/CancelOrderConfirm'
import { useSelector } from 'react-redux'
import isAdmin from '../utils/isAdmin'
import ReviewModal from '../components/ReviewModal'
import DownloadPreviewModal from '../components/DownloadPreviewModal'
import { generateOrderSummary } from '../utils/generateOrderSummary'
import { generateWaybill } from '../utils/generateWaybill'
import useSWR from 'swr'

const OrderDetails = () => {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(false)
    const [cancelOrderModal, setCancelOrderModal] = useState({
        isOpen: false,
        loading: false
    })
    const user = useSelector(state => state.user)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [trackingInput, setTrackingInput] = useState("")
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [existingReview, setExistingReview] = useState(null)
    const [downloadModal, setDownloadModal] = useState({ isOpen: false, type: null })

    const { data: reviewsData, mutate: mutateReviews } = useSWR(user?._id ? SummaryApi.getUserReviews : null)
    const userReviews = reviewsData?.success ? reviewsData.data : []

    const handleCancelOrder = async (reason) => {
        try {
            setCancelOrderModal(prev => ({ ...prev, loading: true }))
            const response = await Axios({
                ...SummaryApi.cancelOrder,
                url: `${SummaryApi.cancelOrder.url}/${order._id}`,
                data: { reason }
            })

            if (response.data.success) {
                toast.success(response.data.message);
                fetchOrderDetails(); // Refresh order details
                setCancelOrderModal({ isOpen: false, loading: false });
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setCancelOrderModal(prev => ({ ...prev, loading: false }))
        }
    }

    const openReviewModal = (product, review = null) => {
        setExistingReview(review)
        setSelectedProduct(product)
        setReviewModalOpen(true)
    }

    const fetchOrderDetails = async () => {
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getOrderDetails,
                url: `${SummaryApi.getOrderDetails.url}/${orderId}`
            })
            const { data } = response
            if (data.success) {
                setOrder(data.data)
                setTrackingInput(data.data.trackingNumber || "")
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (status) => {
        try {
            setUpdatingStatus(true)
            const response = await Axios({
                ...SummaryApi.updateOrderStatus,
                url: `${SummaryApi.updateOrderStatus.url}/${order._id}`,
                data: { 
                    status,
                    trackingNumber: trackingInput
                }
            })

            if (response.data.success) {
                toast.success(response.data.message)
                fetchOrderDetails()
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setUpdatingStatus(false)
        }
    }

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails()
        }
    }, [orderId])

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString))
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <HiOutlineClock className="w-5 h-5" />;
            case 'processing': return <HiOutlineCog className="w-5 h-5" />;
            case 'shipped': return <HiOutlineTruck className="w-5 h-5" />;
            case 'delivered': return <HiOutlineCheckCircle className="w-5 h-5" />;
            case 'cancelled': return <HiOutlineBan className="w-5 h-5" />;
            default: return null;
        }
    }

    const journeySteps = ['pending', 'processing', 'shipped', 'delivered']
    if (order?.orderStatus === 'cancelled') {
        journeySteps.push('cancelled')
    }
    const currentIndex = journeySteps.indexOf(order?.orderStatus)

    if (loading) {
        return (
            <div className='flex items-center justify-center h-[70vh]'>
                <Loading />
            </div>
        )
    }

    if (!order) {
        return (
            <div className='flex flex-col items-center justify-center h-[70vh] gap-4'>
                <p className='text-neutral-500 font-medium font-bold text-xl'>Order not found.</p>
                <Link to="/dashboard/my-orders" className='text-primary-200 hover:underline font-bold transition-all'>Back to My Orders</Link>
            </div>
        )
    }

    return (
        <div className='max-w-4xl mx-auto'>
            <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div className='flex items-center justify-between w-full md:w-auto'>
                    <Link to={-1} className='flex items-center gap-2 text-neutral-500 hover:text-neutral-800 font-bold transition-colors'>
                        <HiOutlineChevronLeft className='w-5 h-5' />
                        Go Back
                    </Link>
                    {/* On mobile, show Order ID here to keep top row balanced */}
                    <div className='flex flex-col items-end md:hidden'>
                        <span className='text-[10px] uppercase font-bold text-neutral-400 tracking-widest leading-none'>Order ID</span>
                        <span className='text-sm font-bold text-neutral-800'>{order.orderId}</span>
                    </div>
                </div>

                <div className='flex items-center justify-between md:justify-end gap-4'>
                    {/* ── Admin Download Buttons ── */}
                    {isAdmin(user.role) && (
                        <div className='flex items-center gap-2'>
                            <button
                                onClick={() => setDownloadModal({ isOpen: true, type: 'summary' })}
                                className='flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[11px] font-bold border border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm'
                                title='Download Order Summary'
                            >
                                <HiOutlineClipboardList className='w-4 h-4' />
                                Summary
                            </button>
                            <button
                                onClick={() => setDownloadModal({ isOpen: true, type: 'waybill' })}
                                className='flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-bold border border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm'
                                title='Download J&T Express Waybill'
                            >
                                <HiOutlineDocumentDownload className='w-4 h-4' />
                                Waybill
                            </button>
                        </div>
                    )}
                    {/* On desktop, show Order ID here */}
                    <div className='hidden md:flex flex-col items-end'>
                        <span className='text-[10px] uppercase font-bold text-neutral-400 tracking-widest'>Order ID</span>
                        <span className='text-sm font-bold text-neutral-800'>{order.orderId}</span>
                    </div>
                </div>
            </div>

            {/* Order Status Visualization */}
            <div className='bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 md:p-8 mb-8'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                    <h2 className='text-xl font-bold text-neutral-700 whitespace-nowrap'>Order Journey</h2>
                    <div className='flex items-center gap-3'>
                        {isAdmin(user.role) ? (
                            <div className='flex items-center gap-2'>
                                <select 
                                    className='px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold outline-none bg-white focus:ring-2 focus:ring-primary-light transition-all'
                                    value={order.orderStatus}
                                    onChange={(e) => updateOrderStatus(e.target.value)}
                                    disabled={updatingStatus}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        ) : (
                            <>
                                {order.orderStatus === 'pending' && (
                                    <button
                                        onClick={() => setCancelOrderModal({ ...cancelOrderModal, isOpen: true })}
                                        className='px-4 py-1.5 rounded-xl border border-rose-200 text-rose-600 font-bold text-[11px] uppercase tracking-wider hover:bg-rose-50 transition-colors'
                                    >
                                        Cancel
                                    </button>
                                )}
                            </>
                        )}
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest ${order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                            order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-primary-light text-primary-200'
                            }`}>
                            {order.orderStatus}
                        </span>
                    </div>
                </div>

                <div className='relative'>
                    {/* Progress Bar Background */}
                    <div className='absolute top-4 left-0 w-full h-1 bg-neutral-100 rounded-full hidden md:block' />
                    {/* Progress Bar Foreground */}
                    <div
                        className={`absolute top-4 left-0 h-1 rounded-full transition-all duration-1000 hidden md:block ${order.orderStatus === 'cancelled' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(currentIndex / Math.max(1, journeySteps.length - 1)) * 100}%` }}
                    />

                    <div className='flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative'>
                        {journeySteps.map((step, idx) => {
                            const isCompleted = order.statusHistory.some(h => h.status === step) && order.orderStatus !== step
                            const isActive = order.orderStatus === step
                            const isCancelledStep = step === 'cancelled'

                            return (
                                <div key={step} className='flex md:flex-col items-center gap-4 md:gap-2 flex-1'>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${isCancelledStep ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' :
                                        isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                                            isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-neutral-100 text-neutral-400'
                                        }`}>
                                        {getStatusIcon(step)}
                                    </div>
                                    <div className='flex flex-col md:items-center'>
                                        <span className={`text-xs font-bold uppercase tracking-wide ${isCompleted || isActive || isCancelledStep ? 'text-neutral-800' : 'text-neutral-400'} ${isCancelledStep ? 'text-rose-500' : ''}`}>
                                            {step}
                                        </span>
                                        {/* Look for existing history entry to show timestamp */}
                                        {order.statusHistory.filter(h => h.status === step).map((h, i) => (
                                            <span key={i} className='text-[10px] text-neutral-400 font-medium'>
                                                {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(h.timestamp))}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className='grid md:grid-cols-[1fr_320px] gap-8'>
                <div className='space-y-8'>
                    {/* Order Items */}
                    <div className='bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden'>
                        <div className='p-6 border-b border-neutral-50 bg-neutral-50/30'>
                            <h3 className='font-bold text-neutral-800'>Order Items ({order.products.length})</h3>
                        </div>
                        <div className='divide-y divide-neutral-50'>
                            {order.products.map((product, idx) => (
                                <div key={idx} className='p-6 flex gap-4'>
                                    <div className='w-20 h-20 rounded-xl bg-neutral-100 flex-shrink-0 overflow-hidden border border-neutral-50'>
                                        <img src={product.image[0]} alt={product.name} loading='lazy' className='w-full h-full object-scale-down' />
                                    </div>
                                    <div className='flex-grow'>
                                        <h4 className='font-bold text-neutral-800 text-base mb-1'>{product.name}</h4>
                                        {product.variations?.length > 0 && (
                                            <div className='flex flex-wrap items-center gap-2 mb-2'>
                                                {product.variations.map((v, i) => (
                                                    <span key={i} className='px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-bold text-neutral-500 uppercase tracking-wider italic'>
                                                        {v.name}: {v.value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className='flex justify-between items-center'>
                                            <p className='text-sm text-neutral-500'>Qty: <span className='font-bold text-neutral-700'>{product.quantity}</span></p>
                                            <div className='flex flex-col items-end gap-2'>
                                                <p className='font-bold text-neutral-800'>{DisplayPrice(product.price * product.quantity)}</p>
                                                {order.orderStatus === 'delivered' && !isAdmin(user.role) && (
                                                    (() => {
                                                        const rvw = userReviews.find(r => r.productId === product.productId && r.orderId === order._id);
                                                        if (rvw) {
                                                            return (
                                                                <button 
                                                                    onClick={() => openReviewModal(product, rvw)} 
                                                                    className='px-3 py-1 rounded border border-neutral-300 bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors'
                                                                >
                                                                    Edit Review
                                                                </button>
                                                            )
                                                        }
                                                        return (
                                                            <button 
                                                                onClick={() => openReviewModal(product)} 
                                                                className='px-3 py-1 rounded border border-amber-400 text-amber-600 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-50 transition-colors'
                                                            >
                                                                Rate Product
                                                            </button>
                                                        )
                                                    })()
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className='p-6 bg-neutral-50/50 border-t border-neutral-50'>
                            <div className='flex flex-col gap-2'>
                                <div className='flex justify-between text-sm text-neutral-500'>
                                    <span>Subtotal</span>
                                    <span className='font-medium'>{DisplayPrice(order.subTotalAmount)}</span>
                                </div>
                                <div className='flex justify-between text-sm text-neutral-500'>
                                    <span>Shipping</span>
                                    <span className='font-medium'>{DisplayPrice(order.shippingFee)}</span>
                                </div>
                                <div className='flex justify-between text-lg font-bold text-neutral-800 mt-2 pt-2 border-t border-neutral-100'>
                                    <span>Total</span>
                                    <span className='text-emerald-700'>{DisplayPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Status History */}
                    <div className='bg-white rounded-2xl border border-neutral-100 shadow-sm p-6'>
                        <h3 className='font-bold text-neutral-800 mb-6'>Order Activity</h3>
                        <div className='space-y-6'>
                            {order.statusHistory.slice().reverse().map((history, idx) => (
                                <div key={idx} className='flex gap-4 relative'>
                                    {idx !== order.statusHistory.length - 1 && (
                                        <div className='absolute left-[11px] top-6 w-0.5 h-full bg-neutral-100' />
                                    )}
                                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 z-10 bg-white ${idx === 0 ? 'border-primary-200' : 'border-neutral-200'
                                        }`} />
                                    <div className='flex flex-col'>
                                        <span className={`text-sm font-bold uppercase tracking-wide ${idx === 0 ? 'text-neutral-800' : 'text-neutral-500'}`}>
                                            Order {history.status}
                                        </span>
                                        <span className='text-xs text-neutral-400 font-medium'>
                                            {formatDate(history.timestamp)}
                                        </span>
                                        <span className='text-[10px] text-neutral-300 italic'>
                                            Updated by: {history.updatedBy?.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='space-y-8'>
                    {/* Shipping Address */}
                    <div className='bg-white rounded-2xl border border-neutral-100 shadow-sm p-6'>
                        <h3 className='font-bold text-neutral-800 mb-4'>Shipping Details</h3>
                        <div className='space-y-3'>
                            <div className='flex flex-col'>
                                <span className='text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1'>Delivery Address</span>
                                <p className='text-sm text-neutral-700 font-medium leading-relaxed'>
                                    {order.deliveryAddress.adress_line},<br />
                                    {order.deliveryAddress.city}, {order.deliveryAddress.state},<br />
                                    {order.deliveryAddress.country} - {order.deliveryAddress.pincode}
                                </p>
                            </div>
                            <div className='flex flex-col pt-3 border-t border-neutral-50'>
                                <span className='text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1'>Contact Number</span>
                                <p className='text-sm text-neutral-700 font-bold'>+63 {order.deliveryAddress.mobile}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className='bg-white rounded-2xl border border-neutral-100 shadow-sm p-6'>
                        <h3 className='font-bold text-neutral-800 mb-4'>Payment Info</h3>
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs text-neutral-500 font-medium'>Method</span>
                                <span className='text-xs font-bold text-neutral-800 uppercase'>{order.paymentMethod}</span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs text-neutral-500 font-medium'>Status</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            {order.paymentId && (
                                <div className='pt-3 border-t border-neutral-50'>
                                    <span className='text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block'>Transaction ID</span>
                                    <span className='text-[10px] font-mono text-neutral-500 break-all'>{order.paymentId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Comment / Note */}
                    {order.comment && (
                        <div className='bg-white rounded-2xl border border-amber-100 shadow-sm p-6 bg-amber-50/10'>
                            <h3 className='font-bold text-amber-800 mb-2 flex items-center gap-2'>
                                <HiOutlineCog className="w-5 h-5" /> 
                                Order Note
                            </h3>
                            <p className='text-sm text-neutral-700 italic'>{order.comment}</p>
                        </div>
                    )}

                    {/* Tracking Info */}
                    {order.orderStatus !== 'pending' && order.orderStatus !== 'cancelled' && (
                        <div className='bg-gradient-to-br from-primary-200 to-indigo-700 rounded-2xl shadow-lg p-6 text-white'>
                            <h3 className='font-bold mb-4 opacity-90'>Shipment Tracking</h3>
                            <div className='space-y-4'>
                                <div className='flex flex-col'>
                                    <span className='text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1'>Courier</span>
                                    <p className='text-sm font-bold'>SF Express / Global Logistics</p>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1'>Tracking Number</span>
                                    {isAdmin(user.role) ? (
                                        <div className='flex gap-2'>
                                            <input 
                                                type="text"
                                                className='flex-grow bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:bg-white/20 transition-all text-white placeholder:text-white/40'
                                                placeholder="Enter tracking ID..."
                                                value={trackingInput}
                                                onChange={(e) => setTrackingInput(e.target.value)}
                                            />
                                            <button 
                                                onClick={() => updateOrderStatus(order.orderStatus)}
                                                className='px-4 bg-white text-primary-200 rounded-lg text-xs font-bold hover:bg-neutral-100 transition-colors'
                                                disabled={updatingStatus}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <p className='text-base font-mono font-bold tracking-wider'>
                                            {order.trackingNumber || 'PENDING_ASSIGNMENT'}
                                        </p>
                                    )}
                                </div>
                                {order.trackingNumber && (
                                    <a
                                        href={`https://example-tracking.com/track/${order.trackingNumber}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className='flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-lg text-sm font-bold'
                                    >
                                        Track Shipment
                                        <HiOutlineExternalLink className='w-4 h-4' />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {cancelOrderModal.isOpen && (
                <CancelOrderConfirm
                    close={() => setCancelOrderModal({ ...cancelOrderModal, isOpen: false })}
                    onConfirm={handleCancelOrder}
                    loading={cancelOrderModal.loading}
                    orderId={order.orderId}
                />
            )}

            {reviewModalOpen && (
                <ReviewModal 
                    close={() => {
                        setReviewModalOpen(false)
                        setExistingReview(null)
                    }}
                    product={selectedProduct}
                    orderId={order._id}
                    existingReview={existingReview}
                    onSuccess={mutateReviews}
                />
            )}

            {downloadModal.isOpen && (
                <DownloadPreviewModal
                    close={() => setDownloadModal({ isOpen: false, type: null })}
                    order={order}
                    downloadType={downloadModal.type}
                    onConfirm={(buyerInfo, sellerInfo, shipmentInfo) => {
                        if (downloadModal.type === 'summary') {
                            generateOrderSummary(order, buyerInfo, sellerInfo, shipmentInfo)
                        } else {
                            generateWaybill(order, buyerInfo, sellerInfo, shipmentInfo)
                        }
                    }}
                />
            )}
        </div>
    )
}

export default OrderDetails
