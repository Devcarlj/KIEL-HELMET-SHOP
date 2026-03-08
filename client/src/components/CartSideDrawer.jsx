import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { DisplayPrice } from '../utils/DisplayPrice'
import {
    selectCart,
    selectCartTotal,
    selectCartOriginalTotal,
    selectCartTotalSavings,
    selectCartItemCount,
    updateCartItemQty,
    removeCartItem,
} from '../store/cartSlice'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { GrCart } from "react-icons/gr"

const CartSideDrawer = ({ isOpen, onClose }) => {
    const cart = useSelector(selectCart)
    const cartTotal = useSelector(selectCartTotal)
    const cartOriginalTotal = useSelector(selectCartOriginalTotal)
    const cartTotalSavings = useSelector(selectCartTotalSavings)
    const cartItemCount = useSelector(selectCartItemCount)
    const user = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // Prevent body scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleUpdateQty = async (cartItemId, newQty) => {
        const isGuest = String(cartItemId).startsWith('guest_')
        if (isGuest) {
            if (newQty < 1) {
                dispatch(removeCartItem(cartItemId))
                toast.success("Removed from cart")
            } else {
                dispatch(updateCartItemQty({ _id: cartItemId, quantity: newQty }))
            }
            return
        }

        try {
            if (newQty < 1) {
                // Remove item
                const response = await Axios({
                    ...SummaryApi.deleteCartItem,
                    data: { _id: cartItemId }
                })
                if (response.data.success) {
                    dispatch(removeCartItem(cartItemId))
                    toast.success("Removed from cart")
                }
            } else {
                const response = await Axios({
                    ...SummaryApi.updateCartItem,
                    data: { _id: cartItemId, quantity: newQty }
                })
                if (response.data.success) {
                    dispatch(updateCartItemQty({ _id: cartItemId, quantity: newQty }))
                }
            }
        } catch (error) {
            toast.error("Failed to update cart")
        }
    }

    const handleRemoveItem = async (cartItemId) => {
        const isGuest = String(cartItemId).startsWith('guest_')
        if (isGuest) {
            dispatch(removeCartItem(cartItemId))
            toast.success("Removed from cart")
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.deleteCartItem,
                data: { _id: cartItemId }
            })
            if (response.data.success) {
                dispatch(removeCartItem(cartItemId))
                toast.success("Removed from cart")
            }
        } catch (error) {
            toast.error("Failed to remove item")
        }
    }

    const handleProceedToPayment = () => {
        if (!user?._id) {
            onClose()
            toast.error("Please login to proceed with checkout")
            navigate('/login')
            return
        }
        onClose()
        navigate('/checkout') // Checking if /checkout-address exists or just /checkout
        toast.success("Proceeding to checkout...")
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-brand-cream shadow-2xl z-[70] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className='flex items-center justify-between px-5 py-4 border-b border-brand-cream-dark bg-gradient-to-r from-brand-primary/10 to-brand-secondary/5'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center'>
                            <GrCart className='text-xl text-brand-primary' />
                        </div>
                        <div>
                            <h2 className='text-lg font-black text-slate-900'>Your Cart</h2>
                            <p className='text-xs text-slate-500 font-medium'>
                                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className='w-9 h-9 rounded-xl bg-brand-cream-dark hover:bg-brand-secondary/20 flex items-center justify-center transition-colors active:scale-90'
                    >
                        <svg className='w-5 h-5 text-brand-primary' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>

                {/* Cart Items */}
                <div className='flex-1 overflow-y-auto px-5 py-4'>
                    {cart.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-full text-center py-16'>
                            <div className='w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-5'>
                                <GrCart className='text-4xl text-slate-300' />
                            </div>
                            <h3 className='text-lg font-black text-slate-800 mb-1'>Your cart is empty</h3>
                            <p className='text-sm text-slate-500 mb-6 max-w-[200px]'>
                                Looks like you haven't added anything to your cart yet.
                            </p>
                            <button
                                onClick={onClose}
                                className='px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-brand-cream rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-brand-primary/10'
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {cart.map((item) => {
                                const product = item.productId
                                if (!product) return null

                                const productImg = Array.isArray(product.image)
                                    ? product.image[0]
                                    : (product.image || '')
                                const effectivePrice = Math.round((product.price || 0) * (1 - (product.discount || 0) / 100))
                                const lineTotal = effectivePrice * item.quantity

                                return (
                                    <div
                                        key={item._id}
                                        className='flex gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group/item'
                                    >
                                        {/* Product Image */}
                                        <div className='w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden'>
                                            {productImg ? (
                                                <img
                                                    src={productImg}
                                                    alt={product.name}
                                                    className='w-full h-full object-scale-down p-1.5'
                                                />
                                            ) : (
                                                <div className='text-[10px] text-slate-400 font-medium'>No img</div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className='flex-1 min-w-0 flex flex-col justify-between'>
                                            <div>
                                                <h4 className='text-sm font-bold text-slate-800 line-clamp-1 leading-tight'>
                                                    {product.name}
                                                </h4>
                                                <div className='flex items-center gap-2 mt-0.5'>
                                                    <span className='text-xs font-bold text-slate-900'>
                                                        {DisplayPrice(effectivePrice)}
                                                    </span>
                                                    {product.discount > 0 && (
                                                        <span className='text-[10px] text-slate-400 line-through'>
                                                            {DisplayPrice(product.price)}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Selected Variation */}
                                                {item.variation?.value && (
                                                    <div className='flex items-center gap-1.5 mt-1'>
                                                        <span className='px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-wider'>
                                                            {item.variation.name}: {item.variation.value}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className='flex items-center justify-between mt-2'>
                                                {/* Quantity Selector */}
                                                <div className='flex items-center h-9 bg-white border border-slate-200 rounded-xl overflow-hidden p-0.5 gap-1 shadow-sm'>
                                                    <button
                                                        onClick={() => handleUpdateQty(item._id, item.quantity - 1)}
                                                        className={`w-8 h-full flex items-center justify-center rounded-lg transition-all duration-200 
                                                             ${item.quantity === 1
                                                                ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-200'
                                                            } 
                                                             active:scale-90`}
                                                        title={item.quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                                                    >
                                                        <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' strokeWidth={3} viewBox='0 0 24 24'>
                                                            {item.quantity === 1 ? (
                                                                <path strokeLinecap='round' strokeLinejoin='round' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                            ) : (
                                                                <path d='M5 12h14' />
                                                            )}
                                                        </svg>
                                                    </button>

                                                    <span className='px-1 text-sm font-black text-slate-800 min-w-[24px] text-center select-none'>
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() => handleUpdateQty(item._id, item.quantity + 1)}
                                                        className='w-8 h-full flex items-center justify-center bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary hover:text-brand-cream rounded-lg transition-all duration-200 active:scale-90'
                                                        title='Increase quantity'
                                                    >
                                                        <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' strokeWidth={3} viewBox='0 0 24 24'>
                                                            <path d='M12 5v14M5 12h14' />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Line Total */}
                                                <span className='text-sm font-black text-slate-900'>
                                                    {DisplayPrice(lineTotal)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveItem(item._id)}
                                            className='self-start p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/item:opacity-100'
                                            title='Remove'
                                        >
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                            </svg>
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer - Subtotal & Proceed to Payment */}
                {cart.length > 0 && (
                    <div className='border-t border-slate-100 px-5 py-4 bg-white'>
                        {/* Subtotal breakdown */}
                        <div className='flex items-center justify-between mb-1'>
                            <span className='text-sm text-slate-500 font-medium'>Items Total</span>
                            <span className='text-sm font-bold text-slate-700'>{DisplayPrice(cartOriginalTotal)}</span>
                        </div>
                        {cartTotalSavings > 0 && (
                            <div className='flex items-center justify-between mb-1'>
                                <span className='text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded'>Product Discount</span>
                                <span className='text-xs font-bold text-emerald-600'>-{DisplayPrice(cartTotalSavings)}</span>
                            </div>
                        )}
                        <div className='flex items-center justify-between mb-4'>
                            <span className='text-xs text-slate-400'>Delivery</span>
                            <span className='text-xs font-semibold text-cta-green'>FREE</span>
                        </div>

                        {/* Grand Total */}
                        <div className='flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4'>
                            <span className='text-base font-black text-slate-900'>Total</span>
                            <span className='text-xl font-black text-slate-900'>{DisplayPrice(cartTotal)}</span>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={handleProceedToPayment}
                            className='w-full py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-brand-cream font-black text-sm uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 shadow-lg shadow-brand-primary/10 active:scale-[0.98] flex items-center justify-center gap-2'
                        >
                            <span>Proceed to Payment</span>
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={2.5} viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M13 7l5 5m0 0l-5 5m5-5H6' />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default CartSideDrawer
