import React from 'react'
import { DisplayPrice } from '../utils/DisplayPrice'
import { Link } from 'react-router-dom'
import AddToCartButton from './AddToCartButton'
import { getOptimizedImageUrl } from '../utils/OptimizeImage'

const CardProduct = ({ data }) => {
    const productImg = Array.isArray(data.image) ? data.image[0] : (data.image || "")

    return (
        <Link
            to={`/product/${data._id}`}
            state={{ product: data }}
            className='min-w-[170px] md:min-w-[220px] max-w-[170px] md:max-w-[220px] bg-white group rounded-[2.5rem] p-4 border border-slate-100/50 hover:border-secondary/30 shadow-sm hover:shadow-2xl transition-all duration-500 relative flex flex-col'
        >
            {/* Discount Badge */}
            {data.discount > 0 && (
                <div className='absolute top-4 left-4 z-10 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg'>
                    {data.discount}% OFF
                </div>
            )}

            {/* Image Container */}
            <div className='relative w-full aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100/30 mb-5 p-3 flex items-center justify-center transition-all duration-700 group-hover:bg-slate-100/50'>
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

                <h3 className='text-sm md:text-[17px] font-black text-slate-800 line-clamp-2 leading-[1.3] mb-4 group-hover:text-primary transition-colors h-[2.3rem] md:h-[2.8rem] overflow-hidden'>
                    {data.name}
                </h3>

                <div className='mt-auto flex flex-wrap items-end justify-between gap-y-2 gap-x-1 border-t border-slate-50 pt-4'>
                    <div className='flex flex-col min-w-[60px] flex-1'>
                        {data.discount > 0 && (
                            <span className='text-[10px] text-slate-400 line-through font-bold'>
                                {DisplayPrice(data.price)}
                            </span>
                        )}
                        <span className='text-base md:text-lg font-black text-slate-900 leading-none'>
                            {DisplayPrice(Math.round(data.price * (1 - (data.discount || 0) / 100)))}
                        </span>
                    </div>

                    <div className='flex-shrink-0 ml-auto'>
                        {data.variations?.length > 0 ? (
                            <div className='h-9 px-4 bg-primary border-2 border-primary text-white shadow-lg shadow-primary/20 rounded-2xl flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 group-hover:-translate-y-1 font-black uppercase text-[10px] tracking-wider'>
                                <span>Options</span>
                                <svg className='w-3 h-3' fill='none' stroke='currentColor' strokeWidth={3} viewBox='0 0 24 24'>
                                    <path d='M9 5l7 7-7 7' />
                                </svg>
                            </div>
                        ) : (
                            <AddToCartButton
                                productId={data._id}
                                productData={data}
                                size='sm'
                            />
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default CardProduct
