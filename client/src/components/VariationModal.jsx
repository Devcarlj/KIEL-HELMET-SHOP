import React, { useState, useMemo } from 'react'
import { IoMdClose, IoMdAdd, IoMdRemove } from 'react-icons/io'
import { DisplayPrice } from '../utils/DisplayPrice'
import { getOptimizedImageUrl } from '../utils/OptimizeImage'
import { useDispatch, useSelector } from 'react-redux'
import { addCartItem } from '../store/cartSlice'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'

const VariationModal = ({ product, close }) => {
    const [selectedVariations, setSelectedVariations] = useState({})
    const [qty, setQty] = useState(1)
    const [loading, setLoading] = useState(false)
    
    const dispatch = useDispatch()
    const user = useSelector(state => state.user)

    const isOptionAvailable = (variationName, optionValue) => {
        if (!product || !product.variationStocks || product.variationStocks.length === 0) return true
        
        return product.variationStocks.some(vs => {
            if (vs.combinations[variationName] !== optionValue) return false
            for (const [key, val] of Object.entries(selectedVariations)) {
                if (key !== variationName && vs.combinations[key] !== val) return false
            }
            return Number(vs.stock) > 0
        })
    }

    const effectivePrice = useMemo(() => {
        if (!product) return 0
        let base = product.price || 0
        
        if (product.variations && product.variationStocks?.length > 0) {
            if (Object.keys(selectedVariations).length === product.variations.length) {
                const match = product.variationStocks.find(vs => {
                    return Object.entries(vs.combinations).every(([key, value]) => selectedVariations[key] === value)
                })
                if (match && match.price) base = match.price
            }
        }
        const discount = product.discount || 0
        return Math.round(base * (1 - discount / 100))
    }, [product, selectedVariations])

    const currentVariationStock = useMemo(() => {
        if (!product) return 0
        if (!product.variationStocks || product.variationStocks.length === 0) return Number(product.stock) || 0
        
        const matchingStock = product.variationStocks.reduce((sum, vs) => {
            const matches = Object.entries(selectedVariations).every(([name, value]) => vs.combinations[name] === value)
            return matches ? sum + Number(vs.stock) : sum
        }, 0)
        return matchingStock
    }, [product, selectedVariations])

    const handleAddToCart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (Object.keys(selectedVariations).length < (product?.variations?.length || 0)) {
            toast.error("Please select all options")
            return
        }

        if (currentVariationStock === 0) {
            toast.error("Out of stock")
            return
        }

        setLoading(true)
        const variationsArr = Object.entries(selectedVariations).map(([name, value]) => ({ name, value }))

        try {
            if (!user?._id) {
                const guestCartItem = {
                    _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    productId: product,
                    quantity: qty,
                    userId: null,
                    variations: variationsArr
                }
                dispatch(addCartItem(guestCartItem))
                toast.success("Added to cart")
                close()
                return
            }

            const response = await Axios({
                ...SummaryApi.addToCart,
                data: { productId: product._id, variations: variationsArr, quantity: qty }
            })

            if (response.data.success) {
                dispatch(addCartItem({
                    _id: response.data.data._id,
                    productId: product,
                    quantity: response.data.data.quantity,
                    variations: variationsArr
                }))
                toast.success("Added to cart")
                close()
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm' onClick={close}>
            <div 
                className='bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]'
                onClick={e => e.stopPropagation()}
            >
                <button onClick={close} className='absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all z-10'>
                    <IoMdClose size={20} />
                </button>

                <div className='overflow-y-auto p-6 space-y-4'>
                    <div className='flex gap-4 items-center mb-2'>
                        <div className='w-20 h-20 bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center justify-center'>
                            <img 
                                src={getOptimizedImageUrl(Array.isArray(product.image) ? product.image[0] : product.image, { width: 200 })} 
                                alt={product.name} 
                                className='max-w-full max-h-full object-scale-down'
                            />
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-sm font-black text-slate-800 leading-tight line-clamp-2'>{product.name}</h3>
                            <div className='flex items-baseline gap-2 mt-1'>
                                <span className='text-lg font-black text-primary'>{DisplayPrice(effectivePrice)}</span>
                                {product.discount > 0 && (
                                    <span className='text-[10px] text-slate-400 line-through'>{DisplayPrice(product.price)}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='h-px bg-slate-100' />

                    {product.variations?.map((v, i) => (
                        <div key={i} className='space-y-2'>
                            <h4 className='text-[10px] font-black uppercase tracking-widest text-slate-400'>{v.name}</h4>
                            <div className='flex flex-wrap gap-2'>
                                {v.options.map(opt => {
                                    const isSelected = selectedVariations[v.name] === opt
                                    const available = isOptionAvailable(v.name, opt)
                                    return (
                                        <button
                                            key={opt}
                                            disabled={!available}
                                            onClick={() => setSelectedVariations(prev => ({ ...prev, [v.name]: opt }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${
                                                isSelected 
                                                    ? 'bg-primary border-primary text-white' 
                                                    : available 
                                                        ? 'bg-slate-50 border-transparent text-slate-600' 
                                                        : 'bg-slate-50 border-slate-100 text-slate-300 opacity-50 cursor-not-allowed border-dashed'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    <div className='flex items-center justify-between pt-2'>
                        <h4 className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Quantity</h4>
                        <div className='flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100'>
                            <button onClick={() => setQty(prev => Math.max(1, prev - 1))} className='w-8 h-8 flex items-center justify-center text-slate-400'>
                                <IoMdRemove size={14} />
                            </button>
                            <span className='w-8 text-center text-xs font-black text-slate-800'>{qty}</span>
                            <button onClick={() => setQty(prev => prev + 1)} className='w-8 h-8 flex items-center justify-center text-primary'>
                                <IoMdAdd size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className='p-6 pt-2'>
                    <button 
                        onClick={handleAddToCart}
                        disabled={loading || currentVariationStock === 0}
                        className={`w-full h-12 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                            currentVariationStock === 0 
                                ? 'bg-slate-100 text-slate-400' 
                                : 'bg-primary text-white shadow-lg shadow-orange-100 active:scale-95'
                        }`}
                    >
                        {loading ? 'Adding...' : currentVariationStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VariationModal
