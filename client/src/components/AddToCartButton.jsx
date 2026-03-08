import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import {
    addCartItem,
    updateCartItemQty,
    removeCartItem,
    selectProductQtyInCart
} from '../store/cartSlice'

const AddToCartButton = ({ productId, productData, size = 'md', variations = [], disabled = false }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)
    const cartInfo = useSelector(selectProductQtyInCart(productId, variations))
    const [loading, setLoading] = useState(false)

    const qty = cartInfo?.qty || 0
    const cartItemId = cartInfo?.cartItemId

    const handleAddToCart = async (e) => {
        e.stopPropagation()
        e.preventDefault()

        if (!user?._id) {
            // Guest mode: Add to local cart only
            const guestCartItem = {
                _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                productId: productData,
                quantity: 1,
                userId: null,
                variations: variations
            }
            dispatch(addCartItem(guestCartItem))
            toast.success("Added to cart")
            return
        }

        if (loading) return
        setLoading(true)

        try {
            const response = await Axios({
                ...SummaryApi.addToCart,
                data: { productId, variations }
            })

            if (response.data.success) {
                // Build the full cart item object for Redux
                const cartItem = response.data.data
                dispatch(addCartItem({
                    _id: cartItem._id,
                    productId: productData,
                    quantity: cartItem.quantity,
                    variations: variations
                }))
                toast.success("Added to cart")
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add to cart")
        } finally {
            setLoading(false)
        }
    }

    const handleIncrement = async (e) => {
        e.stopPropagation()
        e.preventDefault()

        const isGuest = !user?._id || (cartItemId && String(cartItemId).startsWith('guest_'))

        if (isGuest) {
            dispatch(updateCartItemQty({ _id: cartItemId, quantity: qty + 1 }))
            return
        }

        setLoading(true)
        try {
            const newQty = qty + 1
            const response = await Axios({
                ...SummaryApi.updateCartItem,
                data: { _id: cartItemId, quantity: newQty }
            })

            if (response.data.success) {
                dispatch(updateCartItemQty({ _id: cartItemId, quantity: newQty }))
            }
        } catch (error) {
            toast.error("Failed to update quantity")
        } finally {
            setLoading(false)
        }
    }

    const handleDecrement = async (e) => {
        e.stopPropagation()
        e.preventDefault()

        const isGuest = !user?._id || (cartItemId && String(cartItemId).startsWith('guest_'))

        if (isGuest) {
            if (qty <= 1) {
                dispatch(removeCartItem(cartItemId))
                toast.success("Removed from cart")
            } else {
                dispatch(updateCartItemQty({ _id: cartItemId, quantity: qty - 1 }))
            }
            return
        }

        setLoading(true)
        try {
            if (qty <= 1) {
                // Remove from cart
                const response = await Axios({
                    ...SummaryApi.deleteCartItem,
                    data: { _id: cartItemId }
                })

                if (response.data.success) {
                    dispatch(removeCartItem(cartItemId))
                    toast.success("Removed from cart")
                }
            } else {
                const newQty = qty - 1
                const response = await Axios({
                    ...SummaryApi.updateCartItem,
                    data: { _id: cartItemId, quantity: newQty }
                })

                if (response.data.success) {
                    dispatch(updateCartItemQty({ _id: cartItemId, quantity: newQty }))
                }
            }
        } catch (error) {
            toast.error("Failed to update quantity")
        } finally {
            setLoading(false)
        }
    }

    // Sizing classes
    const isSmall = size === 'sm'
    const btnH = isSmall ? 'h-9' : 'h-10 md:h-12'
    const btnPx = isSmall ? 'px-2' : 'px-4 md:px-6'
    const textSize = isSmall ? 'text-[10px]' : 'text-xs md:text-[13px]'
    const counterTextSize = isSmall ? 'text-xs' : 'text-sm md:text-base'

    if (qty === 0) {
        return (
            <button
                onClick={handleAddToCart}
                disabled={loading || disabled}
                className={`${btnH} ${btnPx} ${disabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-orange-500 text-white shadow-lg shadow-orange-200/50'} rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-90 active:translate-y-0.5 group-hover:-translate-y-1 border-2 border-transparent hover:border-white/20 flex-shrink-0`}
            >
                <div className='flex items-center gap-1.5'>
                    {loading ? (
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    ) : (
                        <>
                            <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' strokeWidth={3} viewBox='0 0 24 24'>
                                <path d='M12 5v14M5 12h14' />
                            </svg>
                            <span className={`${textSize} font-black uppercase tracking-[0.1em]`}>
                                Add
                            </span>
                        </>
                    )}
                </div>
            </button>
        )
    }

    // If in cart, show the quantity selector
    return (
        <div
            className={`${btnH} flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-1 gap-1 flex-shrink-0`}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
        >
            <button
                onClick={handleDecrement}
                disabled={loading}
                className={`h-full aspect-square flex items-center justify-center rounded-xl transition-all duration-200 
                    ${qty === 1
                        ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } 
                    active:scale-90 disabled:opacity-40`}
                title={qty === 1 ? 'Remove from cart' : 'Decrease quantity'}
            >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth={3} viewBox='0 0 24 24'>
                    {qty === 1 ? (
                        <path strokeLinecap='round' strokeLinejoin='round' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                    ) : (
                        <path d='M5 12h14' />
                    )}
                </svg>
            </button>

            <div className={`flex-1 flex items-center justify-center ${isSmall ? 'min-w-[24px]' : 'min-w-[32px]'}`}>
                {loading ? (
                    <div className='w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                ) : (
                    <span className={`${counterTextSize} font-black text-slate-800 select-none animate-in fade-in zoom-in duration-300`}>
                        {qty}
                    </span>
                )}
            </div>

            <button
                onClick={handleIncrement}
                disabled={loading}
                className='h-full aspect-square flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-200 active:scale-90 disabled:opacity-40'
                title='Increase quantity'
            >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth={3} viewBox='0 0 24 24'>
                    <path d='M12 5v14M5 12h14' />
                </svg>
            </button>
        </div>
    )
}

export default AddToCartButton
