import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { DisplayPrice } from '../utils/DisplayPrice'
import Loading from '../components/Loading'
import NoData from '../components/NoData'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import DeleteOrderConfirm from '../components/DeleteOrderConfirm'
import { HiOutlineSearch, HiOutlineFilter, HiOutlineExternalLink, HiOutlineUser, HiOutlineCalendar, HiOutlineCreditCard, HiOutlineTrash } from "react-icons/hi"

const AdminOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [updatingId, setUpdatingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        displayId: null
    })

    const fetchAllOrders = async () => {
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getAllOrders
            })
            const { data } = response
            if (data.success) {
                setOrders(data.data)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    const deleteOrder = (orderId, displayId) => {
        setDeleteModal({
            isOpen: true,
            id: orderId,
            displayId: displayId
        })
    }

    const handleDeleteConfirm = async () => {
        const orderId = deleteModal.id
        try {
            setUpdatingId(orderId)
            const response = await Axios({
                ...SummaryApi.deleteOrder,
                url: `${SummaryApi.deleteOrder.url}/${orderId}`
            })
            const { data } = response
            if (data.success) {
                toast.success(data.message)
                // Remove from local state
                setOrders(prev => prev.filter(order => order._id !== orderId))
                setDeleteModal({ isOpen: false, id: null, displayId: null })
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setUpdatingId(null)
        }
    }

    const updateStatus = async (orderId, newStatus) => {
        try {
            setUpdatingId(orderId)
            const response = await Axios({
                ...SummaryApi.updateOrderStatus,
                url: `${SummaryApi.updateOrderStatus.url}/${orderId}`,
                data: { status: newStatus }
            })
            const { data } = response
            if (data.success) {
                toast.success(data.message)
                // Update local state
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? { ...order, orderStatus: newStatus } : order
                ))
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setUpdatingId(null)
        }
    }

    useEffect(() => {
        fetchAllOrders()
    }, [])

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString))
    }

    const getStatusStyles = (status) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'shipped': return 'bg-violet-100 text-violet-700 border-violet-200';
            case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-neutral-100 text-neutral-500 border-neutral-200';
        }
    }

    const filteredOrders = orders.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className='flex items-center justify-center h-[60vh]'>
                <Loading />
            </div>
        )
    }

    return (
        <div className='w-full max-w-7xl mx-auto'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                <div>
                    <h2 className='text-2xl md:text-3xl font-extrabold text-neutral-800 tracking-tight'>Manage Orders</h2>
                    <p className='text-neutral-500 text-sm font-medium mt-1'>Monitor and process store transactions</p>
                </div>
                <div className='flex items-center gap-3'>
                    <div className='bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 shadow-sm'>
                        {orders.length} Total Orders
                    </div>
                </div>
            </div>

            {/* toolbar: Search and Filters */}
            <div className='bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center'>
                <div className='relative flex-grow w-full'>
                    <HiOutlineSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5' />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, or Email..."
                        className='w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl outline-none focus:ring-2 focus:ring-primary-light focus:bg-white transition-all text-sm'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className='flex items-center gap-2 px-6 py-3 bg-neutral-50 text-neutral-600 rounded-xl text-sm font-bold border border-neutral-100 hover:bg-neutral-100 transition-all w-full md:w-auto justify-center'>
                    <HiOutlineFilter className='w-5 h-5' />
                    Filters
                </button>
            </div>

            {filteredOrders.length === 0 ? (
                <div className='mt-20 py-20 bg-white rounded-3xl border border-dashed border-neutral-200'>
                    <NoData />
                    <p className='text-center text-neutral-400 font-medium mt-[-10px]'>
                        {searchTerm ? `No results found for "${searchTerm}"` : "You don't have any orders yet."}
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop View (Table) */}
                    <div className='hidden lg:block overflow-hidden bg-white rounded-2xl border border-neutral-100 shadow-sm'>
                        <table className='w-full text-left border-collapse'>
                            <thead className='bg-neutral-50/80 border-b border-neutral-100'>
                                <tr>
                                    <th className='p-5 text-[11px] font-bold uppercase text-neutral-400 tracking-widest'>Order Reference</th>
                                    <th className='p-5 text-[11px] font-bold uppercase text-neutral-400 tracking-widest'>Customer Details</th>
                                    <th className='p-5 text-[11px] font-bold uppercase text-neutral-400 tracking-widest text-center'>Items</th>
                                    <th className='p-5 text-[11px] font-bold uppercase text-neutral-400 tracking-widest'>Amount / Method</th>
                                    <th className='p-5 text-[11px] font-bold uppercase text-neutral-400 tracking-widest'>Current Status</th>
                                    <th className='p-5 text-[11px] font-bold uppercase text-neutral-400 tracking-widest text-right'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-neutral-50'>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className='hover:bg-neutral-50/50 transition-colors group'>
                                        <td className='p-5'>
                                            <div className='flex flex-col'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-sm font-bold text-neutral-800 group-hover:text-primary-200 transition-colors'>{order.orderId}</span>
                                                    {!order.isAdminSeen && (
                                                        <span className='bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md animate-pulse uppercase tracking-tighter'>New</span>
                                                    )}
                                                </div>
                                                <span className='text-[11px] text-neutral-400 flex items-center gap-1 mt-1'>
                                                    <HiOutlineCalendar className='w-3 h-3' />
                                                    {formatDate(order.createdAt)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='p-5'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold border border-neutral-200'>
                                                    {order.userId?.name?.charAt(0) || <HiOutlineUser />}
                                                </div>
                                                <div className='flex flex-col'>
                                                    <span className='text-sm font-bold text-neutral-700'>{order.userId?.name || 'Deleted User'}</span>
                                                    <span className='text-xs text-neutral-400'>{order.userId?.email || ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='p-5'>
                                            <div className='flex flex-col gap-2'>
                                                {order.products.map((product, pIdx) => (
                                                    <div key={pIdx} className='border-b border-neutral-50 last:border-0 pb-1 last:pb-0'>
                                                        <p className='text-xs font-bold text-neutral-700'>{product.name} <span className='text-neutral-400'>x {product.quantity}</span></p>
                                                        {product.variations?.length > 0 && (
                                                            <div className='flex flex-wrap gap-1 mt-0.5'>
                                                                {product.variations.map((v, vIdx) => (
                                                                    <span key={vIdx} className='text-[9px] px-1 bg-neutral-100 rounded text-neutral-500 font-medium uppercase italic'>
                                                                        {v.name}: {v.value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className='p-5'>
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-bold text-emerald-700'>{DisplayPrice(order.totalAmount)}</span>
                                                <span className='text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1 mt-0.5'>
                                                    <HiOutlineCreditCard className='w-3 h-3' />
                                                    {order.paymentMethod}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='p-5'>
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyles(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className='p-5'>
                                            <div className='flex items-center justify-end gap-3'>
                                                <select
                                                    className='text-xs font-bold border border-neutral-200 rounded-lg px-3 py-2 outline-none bg-white focus:ring-2 focus:ring-primary-light transition-all cursor-pointer hover:border-neutral-300'
                                                    value={order.orderStatus}
                                                    disabled={updatingId === order._id}
                                                    onChange={(e) => updateStatus(order._id, e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <Link
                                                    to={`/dashboard/order-details/${order._id}`}
                                                    className='w-9 h-9 flex items-center justify-center bg-primary-light text-primary-200 rounded-lg hover:bg-primary-200 hover:text-white transition-all shadow-sm'
                                                >
                                                    <HiOutlineExternalLink className='w-5 h-5' />
                                                </Link>
                                                {order.orderStatus === 'cancelled' && (
                                                    <button
                                                        onClick={() => deleteOrder(order._id, order.orderId)}
                                                        disabled={updatingId === order._id}
                                                        className='w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100'
                                                        title="Delete Order"
                                                    >
                                                        <HiOutlineTrash className='w-5 h-5' />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Tablet View (Cards) */}
                    <div className='lg:hidden grid gap-4'>
                        {filteredOrders.map((order) => (
                            <div key={order._id} className='bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col'>
                                {/* Card Header */}
                                <div className='p-4 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50'>
                                    <div className='flex flex-col'>
                                        <span className='text-[10px] font-bold text-neutral-400 uppercase tracking-widest'>Order ID</span>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm font-bold text-neutral-800'>{order.orderId}</span>
                                            {!order.isAdminSeen && (
                                                <span className='bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md animate-pulse uppercase tracking-tighter'>New</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyles(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className='p-4 space-y-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold border border-neutral-200 flex-shrink-0'>
                                            {order.userId?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className='flex flex-col min-w-0'>
                                            <span className='text-sm font-bold text-neutral-700 truncate'>{order.userId?.name || 'Deleted User'}</span>
                                            <span className='text-xs text-neutral-400 truncate'>{order.userId?.email || ''}</span>
                                        </div>
                                    </div>

                                    {/* Products Section in Mobile */}
                                    <div className='bg-neutral-50 rounded-xl p-3 space-y-2'>
                                        {order.products.map((product, pIdx) => (
                                            <div key={pIdx} className='border-b border-neutral-100 last:border-0 pb-2 last:pb-0'>
                                                <div className='flex justify-between items-start'>
                                                    <span className='text-xs font-bold text-neutral-700'>{product.name}</span>
                                                    <span className='text-xs font-bold text-neutral-400'>x{product.quantity}</span>
                                                </div>
                                                {product.variations?.length > 0 && (
                                                    <div className='flex flex-wrap gap-1 mt-1'>
                                                        {product.variations.map((v, vIdx) => (
                                                            <span key={vIdx} className='text-[9px] px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-neutral-500 font-bold uppercase tracking-tight italic'>
                                                                {v.name}: {v.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='flex flex-col'>
                                            <span className='text-[10px] font-bold text-neutral-400 uppercase tracking-widest'>Amount</span>
                                            <span className='text-sm font-bold text-emerald-700'>{DisplayPrice(order.totalAmount)}</span>
                                        </div>
                                        <div className='flex flex-col items-end'>
                                            <span className='text-[10px] font-bold text-neutral-400 uppercase tracking-widest'>Placed On</span>
                                            <span className='text-xs font-medium text-neutral-600'>{formatDate(order.createdAt).split(',')[0]}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer / Actions */}
                                <div className='p-4 bg-neutral-50/30 border-t border-neutral-50 flex items-center justify-between gap-3'>
                                    <select
                                        className='flex-grow text-xs font-bold border border-neutral-200 rounded-xl px-3 py-2.5 outline-none bg-white focus:ring-2 focus:ring-primary-light transition-all'
                                        value={order.orderStatus}
                                        disabled={updatingId === order._id}
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <Link
                                        to={`/dashboard/order-details/${order._id}`}
                                        className='flex items-center justify-center gap-2 bg-primary-light text-primary-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-200 hover:text-white transition-all border border-primary-200/20'
                                    >
                                        Details
                                        <HiOutlineExternalLink className='w-4 h-4' />
                                    </Link>
                                    {order.orderStatus === 'cancelled' && (
                                        <button
                                            onClick={() => deleteOrder(order._id, order.orderId)}
                                            disabled={updatingId === order._id}
                                            className='flex items-center justify-center bg-rose-50 text-rose-600 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100'
                                            title="Delete Order"
                                        >
                                            <HiOutlineTrash className='w-5 h-5' />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {deleteModal.isOpen && (
                <DeleteOrderConfirm
                    close={() => setDeleteModal({ isOpen: false, id: null, displayId: null })}
                    onConfirm={handleDeleteConfirm}
                    loading={updatingId === deleteModal.id}
                    orderId={deleteModal.displayId}
                />
            )}
        </div>
    )
}

export default AdminOrders
