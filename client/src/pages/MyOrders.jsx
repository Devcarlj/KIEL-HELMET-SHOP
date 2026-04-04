import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { DisplayPrice } from '../utils/DisplayPrice'
import NoData from '../components/NoData'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'
import CancelOrderConfirm from '../components/CancelOrderConfirm'
import useSWR from 'swr'
import ReviewModal from '../components/ReviewModal'

const MyOrders = () => {
  const { data: ordersData, isLoading: loading, mutate } = useSWR(SummaryApi.getOrderHistory)
  const orders = ordersData?.success ? ordersData.data : []
  
  const { data: reviewsData, mutate: mutateReviews } = useSWR(SummaryApi.getUserReviews)
  const userReviews = reviewsData?.success ? reviewsData.data : []
  
  const [cancelOrderModal, setCancelOrderModal] = useState({
    isOpen: false,
    orderId: null,
    loading: false
  })

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [existingReview, setExistingReview] = useState(null)

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const openCancelModal = (orderId) => {
    setCancelOrderModal({
      ...cancelOrderModal,
      isOpen: true,
      orderId: orderId
    })
  }

  const closeCancelModal = () => {
    setCancelOrderModal({
      isOpen: false,
      orderId: null,
      loading: false
    })
  }

  const handleCancelOrder = async (reason) => {
    try {
      setCancelOrderModal(prev => ({ ...prev, loading: true }))
      const response = await Axios({
        ...SummaryApi.cancelOrder,
        url: `${SummaryApi.cancelOrder.url}/${cancelOrderModal.orderId}`,
        data: { reason }
      })

      if (response.data.success) {
        toast.success(response.data.message);
        mutate(); // 👈 Use SWR mutate to refresh the list
        closeCancelModal();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setCancelOrderModal(prev => ({ ...prev, loading: false }))
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>
        <Loading />
      </div>
    )
  }

  return (
    <div className='p-4 md:p-8 w-full max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <h2 className='text-2xl font-bold text-neutral-800'>Your Orders</h2>
        <p className='text-neutral-500 font-medium'>{orders.length} orders found</p>
      </div>

      {orders.length === 0 ? (
        <div className='mt-20'>
          <NoData />
          <p className='text-center text-neutral-400 mt-[-20px]'>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className='grid gap-8'>
          {orders.map((order, index) => (
            <div
              key={order._id || index}
              className='bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow'
            >
              {/* Order Header */}
              <div className='bg-neutral-50/50 p-4 border-b border-neutral-100 flex flex-wrap gap-4 items-center justify-between'>
                <div className='flex flex-wrap gap-x-8 gap-y-2'>
                  <div>
                    <p className='text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-0.5'>Order ID</p>
                    <p className='text-sm font-semibold text-neutral-700'>{order.orderId}</p>
                  </div>
                  <div>
                    <p className='text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-0.5'>Date Placed</p>
                    <p className='text-sm font-medium text-neutral-700'>{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className='text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-0.5'>Total Amount</p>
                    <p className='text-sm font-bold text-green-700'>{DisplayPrice(order.totalAmount)}</p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    order.paymentStatus === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {order.paymentStatus}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${order.orderStatus === 'delivered' ? 'bg-blue-100 text-blue-700' :
                    order.orderStatus === 'cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-primary-light text-primary-200'
                    }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className='p-4 md:p-6'>
                <div className='grid gap-6'>
                  {order.products.map((product, pIdx) => (
                    <div key={product._id || pIdx} className='flex gap-4 items-start md:items-center'>
                      <div className='w-20 h-20 bg-neutral-100 rounded-lg flex-shrink-0 overflow-hidden border border-neutral-50 shadow-inner'>
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className='w-full h-full object-scale-down p-1 hover:scale-110 transition-transform'
                        />
                      </div>
                      <div className='flex-grow min-w-0'>
                        <h4 className='text-sm md:text-base font-bold md:font-semibold text-neutral-800 line-clamp-2 md:line-clamp-none md:truncate mb-1'>{product.name}</h4>
                        {product.variations?.length > 0 && (
                          <div className='flex flex-wrap items-center gap-1.5 mb-2'>
                            {product.variations.map((v, i) => (
                              <span key={i} className='px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[9px] font-bold text-neutral-500 uppercase tracking-wide italic'>
                                {v.name}: {v.value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className='flex items-center gap-4 text-sm text-neutral-500 font-medium'>
                          <p>Qty: <span className='text-neutral-700'>{product.quantity}</span></p>
                          <p>Price: <span className='text-neutral-700'>{DisplayPrice(product.price)}</span></p>
                        </div>
                        {order.orderStatus === 'delivered' && (
                          <div className='mt-3'>
                            {(() => {
                              const rvw = userReviews.find(r => r.productId === product.productId && r.orderId === order._id);
                              if (rvw) {
                                return (
                                  <button
                                    onClick={() => {
                                      setSelectedProduct(product)
                                      setSelectedOrderId(order._id)
                                      setExistingReview(rvw)
                                      setReviewModalOpen(true)
                                    }}
                                    className='px-3 py-1.5 rounded-lg border border-neutral-300 bg-neutral-100 text-neutral-600 text-xs font-bold shadow-sm hover:bg-neutral-200 transition-colors inline-block'
                                  >
                                    Edit Review
                                  </button>
                                );
                              }
                              return (
                                <button
                                  onClick={() => {
                                    setSelectedProduct(product)
                                    setSelectedOrderId(order._id)
                                    setExistingReview(null)
                                    setReviewModalOpen(true)
                                  }}
                                  className='px-3 py-1.5 rounded-lg border border-amber-400 text-amber-600 text-xs font-bold shadow-sm hover:bg-amber-50 transition-colors inline-block'
                                >
                                  Rate Product
                                </button>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer for single order */}
              <div className='px-6 py-4 bg-neutral-50/30 border-t border-neutral-100 flex justify-between items-center'>
                <p className='text-xs text-neutral-400 italic font-medium'>Payment via {order.paymentMethod.toUpperCase()}</p>
                <div className='flex items-center gap-4'>
                  {order.orderStatus === 'pending' && (
                    <button
                      onClick={() => openCancelModal(order._id)}
                      className='text-rose-600 hover:text-rose-700 text-sm font-bold transition-colors'
                    >
                      Cancel Order
                    </button>
                  )}
                  <Link
                    to={`/dashboard/order-details/${order._id}`}
                    className='text-primary-200 hover:text-primary-100 text-sm font-bold transition-colors'
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelOrderModal.isOpen && (
        <CancelOrderConfirm
          close={closeCancelModal}
          onConfirm={handleCancelOrder}
          loading={cancelOrderModal.loading}
          orderId={orders.find(o => o._id === cancelOrderModal.orderId)?.orderId}
        />
      )}

      {reviewModalOpen && (
        <ReviewModal
          close={() => {
            setReviewModalOpen(false)
            setExistingReview(null)
          }}
          product={selectedProduct}
          orderId={selectedOrderId}
          existingReview={existingReview}
          onSuccess={mutateReviews}
        />
      )}
    </div>
  )
}

export default MyOrders
