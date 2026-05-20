import React from 'react'
import { DisplayPrice } from '../utils/DisplayPrice'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { setFavorites } from '../store/userSlice'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { getOptimizedImageUrl } from '../utils/OptimizeImage'
import { useState } from 'react'
import VariationModal from './VariationModal'
import { IoMdAdd } from 'react-icons/io'

const CardProduct = ({ data, isFavoritePage = false }) => {
    const dispatch = useDispatch()
    const favorites = useSelector(state => state.user.favorites)
    const userId = useSelector(state => state.user._id)
    const [openVariationModal, setOpenVariationModal] = useState(false)
    
    // Check if current product is favorited
    const isFavorite = Array.isArray(favorites) && favorites.some(fav => (fav._id || fav) === data._id)

    const handleToggleFavorite = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!userId) {
            toast.error("Please login first!")
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.toggleFavorite,
                data: { productId: data._id }
            })

            if (response.data.success) {
                const userResponse = await Axios(SummaryApi.userDetails)
                if (userResponse.data.success) {
                    dispatch(setFavorites(userResponse.data.data.favorites))
                }
                toast.success(response.data.message)
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }
    const productImg = Array.isArray(data.image) ? data.image[0] : (data.image || "")
    const totalStock = (!data.variationStocks || data.variationStocks.length === 0) 
        ? Number(data.stock) || 0 
        : data.variationStocks.reduce((sum, vs) => sum + Number(vs.stock), 0);

    return (
        <>
            <Link
                to={`/product/${data._id}`}
                state={{ product: data }}
                className={`w-full bg-white group border border-slate-100/50 hover:border-secondary/30 shadow-sm hover:shadow-2xl transition-all duration-500 relative flex flex-col ${isFavoritePage 
                    ? 'rounded-2xl md:rounded-[2.5rem] p-2 md:p-4' 
                    : 'rounded-3xl md:rounded-[2.5rem] p-3 md:p-4'
                }`}
            >
                {/* Badges & Actions Overlay */}
                <div className={`absolute z-20 flex justify-between items-start pointer-events-none ${isFavoritePage 
                    ? 'top-2 left-2 right-2 md:top-4 md:left-4 md:right-4' 
                    : 'top-4 left-4 right-4'
                }`}>
                    {/* Discount Badge */}
                    {data.discount > 0 ? (
                        <div className={`bg-red-500/90 backdrop-blur-md text-white font-black rounded-full shadow-lg pointer-events-auto ${isFavoritePage 
                            ? 'text-[8px] md:text-[10px] px-2 py-0.5 md:px-3 md:py-1.5' 
                            : 'text-[10px] px-3 py-1.5'
                        }`}>
                            {data.discount}% {isFavoritePage ? '' : 'OFF'}
                        </div>
                    ) : (
                        totalStock <= 0 ? (
                            <div className={`bg-slate-800/90 backdrop-blur-md text-white font-black rounded-full shadow-lg pointer-events-auto ${isFavoritePage 
                                ? 'text-[8px] md:text-[10px] px-2 py-0.5 md:px-3 md:py-1.5' 
                                : 'text-[10px] px-3 py-1.5'
                            }`}>
                                OUT OF STOCK
                            </div>
                        ) : <div></div>
                    )}

                    <button
                        onClick={handleToggleFavorite}
                        className={`flex items-center justify-center transition-all duration-300 pointer-events-auto active:scale-90 shadow-lg ${isFavorite
                            ? 'bg-red-500/90 text-white backdrop-blur-md'
                            : 'bg-white/80 text-slate-400 hover:text-red-500 backdrop-blur-md'
                            } ${isFavoritePage 
                                ? 'w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl' 
                                : 'w-9 h-9 rounded-xl'}`}
                    >
                        {isFavorite 
                            ? <FaHeart className={isFavoritePage ? 'text-[12px] md:text-base' : 'text-base'} size={isFavoritePage ? undefined : 16} /> 
                            : <FaRegHeart className={isFavoritePage ? 'text-[12px] md:text-base' : 'text-base'} size={isFavoritePage ? undefined : 16} />
                        }
                    </button>
                </div>

                {/* Image Container */}
                <div className={`relative w-full aspect-square overflow-hidden bg-slate-50 border border-slate-100/30 flex items-center justify-center transition-all duration-700 group-hover:bg-slate-100/50 ${isFavoritePage 
                    ? 'rounded-xl md:rounded-[2rem] mb-2 md:mb-5 p-1 md:p-3' 
                    : 'rounded-[2rem] mb-5 p-3'
                }`}>
                    <img
                        src={getOptimizedImageUrl(productImg, { width: 400 })}
                        alt={data.name}
                        loading='lazy'
                        className='w-full h-full object-scale-down transform transition-transform duration-1000 group-hover:scale-110 ease-out'
                    />
                </div>

                {/* Info Section */}
                <div className='flex flex-col flex-grow'>
                    <div className='flex items-center gap-1.5 mb-2'>
                        <div className='w-1.5 h-1.5 rounded-full bg-secondary'></div>
                        <span className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>
                            {data.unit || 'Standard Unit'}
                        </span>
                    </div>

                    <h3 className={`font-black text-slate-800 line-clamp-2 transition-colors overflow-hidden ${isFavoritePage 
                        ? 'text-xs md:text-[17px] leading-tight md:leading-[1.3] mb-2 md:mb-4 h-[2rem] md:h-[2.8rem]' 
                        : 'text-sm md:text-[17px] leading-[1.3] mb-4 h-[2.3rem] md:h-[2.8rem]'
                    }`}>
                        {data.name}
                    </h3>

                    <div className={`mt-auto flex items-center justify-between border-t border-slate-50 ${isFavoritePage 
                        ? 'gap-1 md:gap-x-2 pt-2 md:pt-4' 
                        : 'gap-x-1 sm:gap-x-2 pt-4'
                    }`}>
                        <div className='flex flex-col min-w-[60px]'>
                            {data.discount > 0 && (
                                <span className='text-[10px] text-slate-400 line-through font-bold'>
                                    {DisplayPrice(data.price)}
                                </span>
                            )}
                            <span className={`font-black text-slate-900 leading-none ${isFavoritePage 
                                ? 'text-xs md:text-lg' 
                                : 'text-sm md:text-lg'
                            }`}>
                                {DisplayPrice(Math.round(data.price * (1 - (data.discount || 0) / 100)))}
                            </span>
                        </div>

                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenVariationModal(true); }}
                            className={`flex-shrink-0 bg-primary border-2 border-primary text-white shadow-lg shadow-primary/20 transition-all duration-300 active:scale-90 group-hover:-translate-y-0.5 font-black uppercase tracking-tight md:tracking-wider flex items-center justify-center ${isFavoritePage 
                                ? 'h-6.5 md:h-8 px-1 md:px-3 text-[8.5px] md:text-[10px] rounded-lg md:rounded-xl gap-0.5 md:gap-1' 
                                : 'h-7 md:h-8 px-2 md:px-3 text-[9px] md:text-[10px] rounded-lg md:rounded-xl gap-1'
                            }`}
                        >
                            <IoMdAdd className={isFavoritePage ? 'text-[12px] md:text-[14px]' : 'text-[14px]'} size={isFavoritePage ? undefined : 14} />
                            <span>Add</span>
                        </button>
                    </div>
                </div>
            </Link>

            {openVariationModal && (
                <VariationModal 
                    product={data} 
                    close={() => setOpenVariationModal(false)} 
                />
            )}
        </>
    )
}

export default CardProduct
