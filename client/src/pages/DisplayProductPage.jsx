import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { DisplayPrice } from '../utils/DisplayPrice'
import AddToCartButton from '../components/AddToCartButton'

import minuteDeliveryIcon from '../assets/minute_delivery.png'
import bestPricesIcon from '../assets/Best_Prices_Offers.png'
import wideAssortmentIcon from '../assets/Wide_Assortment.png'

/**
 * Cloudinary Optimization Helper
 * This ensures we use f_auto (format), q_auto (quality) and optional width
 */
const getOptimizedImageUrl = (url, width) => {
  if (!url || typeof url !== 'string' || !url.includes('upload/')) return url
  const [base, rest] = url.split('upload/')
  const transforms = `f_auto,q_auto${width ? `,w_${width}` : ''}`
  return `${base}upload/${transforms}/${rest}`
}

const DisplayProductPage = () => {
  const { productId } = useParams()
  const location = useLocation()

  const [product, setProduct] = useState(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariations, setSelectedVariations] = useState({})

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await Axios({
          ...SummaryApi.getProduct,
          params: {}
        })

        if (response.data.success && Array.isArray(response.data.data)) {
          const found = response.data.data.find(p => p._id === productId)
          if (found) {
            setProduct(found)
          }
        }
      } catch (error) {
        console.log('Error loading product details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!product && productId) {
      fetchProduct()
    }
  }, [product, productId])

  useEffect(() => {
    setActiveImageIndex(0)
    setSelectedVariations({})
  }, [productId])

  const images = useMemo(() => {
    if (!product) return []
    if (Array.isArray(product.image)) return product.image.filter(Boolean)
    return product.image ? [product.image] : []
  }, [product])

  // Automatically scroll to top when the productId changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  }, [productId])

  const activeImage = images[activeImageIndex] || ''

  // Preload principal image for faster discovery with Cloudinary optimizations
  useEffect(() => {
    if (activeImage) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      // Request optimized 800px width for preloading
      link.href = getOptimizedImageUrl(activeImage, 800)
      // Add responsive srcset for mobile discovery (e.g. w_400 for small screens)
      link.setAttribute('imagesrcset', `${getOptimizedImageUrl(activeImage, 400)} 400w, ${getOptimizedImageUrl(activeImage, 800)} 800w`)
      link.setAttribute('imagesizes', '(max-width: 768px) 400px, 800px')
      link.setAttribute('fetchPriority', 'high')
      document.head.appendChild(link)

      return () => {
        document.head.removeChild(link)
      }
    }
  }, [activeImage])

  const effectivePrice = useMemo(() => {
    if (!product) return 0
    const base = product.price || 0
    const discount = product.discount || 0
    return Math.round(base * (1 - discount / 100))
  }, [product])

  if (loading || !product) {
    return (
      <section className='bg-white min-h-[78vh]'>
        <div className='container mx-auto px-4 lg:px-6 py-6 md:py-10'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16'>
            {/* Image Skeleton */}
            <div className='aspect-square w-full bg-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] animate-pulse' />
            {/* Details Skeleton */}
            <div className='space-y-4 md:space-y-6'>
              <div className='h-8 md:h-12 w-3/4 bg-slate-100 rounded-xl animate-pulse' />
              <div className='h-4 w-1/4 bg-slate-100 rounded-md animate-pulse' />
              <div className='h-24 w-full bg-slate-100 rounded-[2rem] animate-pulse' />
              <div className='h-40 w-full bg-slate-100 rounded-xl animate-pulse hidden md:block' />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='bg-white min-h-[78vh]'>
      <div className='container mx-auto px-4 lg:px-6 py-3 md:py-10'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-1 text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-3 md:mb-6'>
          <Link to='/' className='hover:text-primary'>Home</Link>
          <span>/</span>
          <span className='text-slate-500'>Product</span>
          <span>/</span>
          <span className='text-slate-900 line-clamp-1'>{product.name}</span>
        </div>

        {/* Main layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr] gap-4 md:gap-8 lg:gap-16 items-start'>

          {/* Left: Image gallery */}
          <div className='bg-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 p-2 md:p-6 flex flex-col gap-2 md:gap-3 w-full'>

            <div className='relative w-full aspect-square max-h-[280px] md:max-h-[450px] rounded-xl md:rounded-2xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shadow-sm'>
              {activeImage ? (
                <img
                  src={getOptimizedImageUrl(activeImage, 800)}
                  srcSet={`${getOptimizedImageUrl(activeImage, 400)} 400w, ${getOptimizedImageUrl(activeImage, 800)} 800w`}
                  sizes="(max-width: 768px) 400px, 800px"
                  alt={product.name}
                  fetchPriority="high"
                  loading="eager"
                  width={800}
                  height={800}
                  className='w-full h-full object-scale-down p-3 md:p-4 rounded-xl'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium'>
                  No image available
                </div>
              )}

              <div className='absolute inset-0 flex items-center justify-between px-2 md:px-3 pointer-events-none'>
                <button
                  type='button'
                  onClick={() => setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  className='pointer-events-auto w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 active:scale-95 transition z-10'
                >
                  <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' /></svg>
                </button>

                <button
                  type='button'
                  onClick={() => setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                  className='pointer-events-auto w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 active:scale-95 transition z-10'
                >
                  <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' /></svg>
                </button>
              </div>

              {images.length > 1 && (
                <div className='absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/40 text-[9px] md:text-[10px] font-semibold text-white'>
                  {activeImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className='flex gap-2 overflow-x-auto no-scrollbar justify-center pb-1'>
                {images.map((img, index) => (
                  <button
                    key={img + index}
                    type='button'
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-2xl border-2 overflow-hidden shrink-0 transition-all ${index === activeImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-white bg-white hover:border-slate-200'
                      }`}
                  >
                    <img src={getOptimizedImageUrl(img, 200)} alt='thumb' className='w-full h-full object-scale-down p-1' />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className='space-y-4 md:space-y-6 lg:pl-4'>
            <div>
              <h1 className='text-xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-1'>
                {product.name}
              </h1>
              <p className='text-[10px] md:text-sm font-semibold text-slate-500 uppercase tracking-[0.25em]'>
                {product.unit || 'Standard Unit'}
              </p>
            </div>

            <div className='bg-slate-50/50 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 flex items-center justify-between md:flex-col md:items-start gap-4'>
              <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl md:text-4xl font-black text-slate-900 tracking-tight'>
                    {DisplayPrice(effectivePrice)}
                  </span>
                  {product.discount > 0 && (
                    <span className='px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] md:text-xs font-black uppercase tracking-wider'>
                      {product.discount}% OFF
                    </span>
                  )}
                </div>

                {product.discount > 0 && (
                  <div className='flex flex-wrap items-center gap-2 mt-0.5'>
                    <span className='text-[11px] md:text-base text-slate-400 line-through font-medium'>
                      {DisplayPrice(product.price)}
                    </span>
                    <span className='text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-tight'>
                      Save {DisplayPrice(product.price - effectivePrice)}
                    </span>
                  </div>
                )}
              </div>

              <AddToCartButton
                productId={product._id}
                productData={product}
                size='md'
                variations={Object.entries(selectedVariations).map(([name, value]) => ({ name, value }))}
                disabled={product.variations?.length > 0 && Object.keys(selectedVariations).length < product.variations.length}
              />
            </div>

            {/* Variations Selection */}
            {product.variations?.length > 0 && (
              <div className='bg-white p-4 md:p-6 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-4'>
                {product.variations.map((v, index) => (
                  <div key={index} className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-xs font-black text-slate-500 uppercase tracking-[0.2em]'>{v.name}</h3>
                      {!selectedVariations[v.name] && <span className='text-[10px] text-red-500 font-bold'>* Required</span>}
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {v.options.map((opt) => {
                        const isSelected = selectedVariations[v.name] === opt
                        return (
                          <button
                            key={opt}
                            type='button'
                            onClick={() => setSelectedVariations(prev => ({ ...prev, [v.name]: opt }))}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${isSelected
                              ? 'bg-primary border-primary text-white shadow-md shadow-orange-100'
                              : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 hover:border-slate-200'
                              }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}


          </div>
        </div>

        {/* Description Section */}
        {product.description && (
          <div className='mt-10 md:mt-12 pt-6 md:pt-8 border-t border-slate-200'>
            <h2 className='text-xs font-black text-slate-500 uppercase tracking-[0.25em] mb-3'>
              Description
            </h2>
            <div className='rounded-2xl bg-slate-50/80 border border-slate-100 p-5 md:p-6'>
              <p className='text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base'>
                {product.description}
              </p>
            </div>
          </div>
        )}

        {/* More Details Section */}
        {product.more_details && (
          <div className='mt-8 pt-6 border-t border-slate-200'>
            <h2 className='text-xs font-black text-slate-500 uppercase tracking-[0.25em] mb-0 mt-3'>
              More Details
            </h2>
            <div className='rounded-2xl bg-slate-50/80 border border-slate-100 p-5 md:p-6'>
              {typeof product.more_details === 'string' ? (
                <p className='text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base'>
                  {product.more_details}
                </p>
              ) : (
                <div className='space-y-0 text-sm'>
                  {Object.entries(product.more_details).map(([key, value], i, arr) => {
                    const displayValue = value != null && value !== '' ? String(value) : '-'
                    const isLast = i === arr.length - 1
                    return (
                      <div
                        key={key}
                        className={`flex flex-col gap-1 py-4 ${!isLast ? 'border-b border-slate-200' : ''}`}
                      >
                        <span className='text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]'>{key}</span>
                        <span className='text-slate-700 leading-relaxed'>{displayValue}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benefits Section - Visible on all devices (After More Details) */}
        <div className='mt-12 md:mt-16 pt-10 md:pt-14 border-t border-slate-200'>
          <h2 className='text-[11px] md:text-sm font-black text-slate-500 uppercase tracking-[0.25em] mb-6 md:mb-12 text-center'>
            Why shop from Kiel Helmet Shop?
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8'>
            <div className='flex flex-col md:items-center md:text-center gap-4 p-5 md:p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group'>
              <div className='w-12 h-12 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform'>
                <img src={minuteDeliveryIcon} alt='Delivery' className='w-7 h-7 md:w-10 md:h-10 object-contain' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight mb-1 md:mb-2'>Super fast delivery</p>
                <p className='text-xs md:text-sm text-slate-600 leading-relaxed'>To your doorstep in minutes, ensuring you get your gear exactly when you need it.</p>
              </div>
            </div>
            <div className='flex flex-col md:items-center md:text-center gap-4 p-5 md:p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group'>
              <div className='w-12 h-12 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform'>
                <img src={bestPricesIcon} alt='Prices' className='w-7 h-7 md:w-10 md:h-10 object-contain' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight mb-1 md:mb-2'>Best prices & offers</p>
                <p className='text-xs md:text-sm text-slate-600 leading-relaxed'>The most competitive prices and exclusive deals on all premium helmets and accessories.</p>
              </div>
            </div>
            <div className='flex flex-col md:items-center md:text-center gap-4 p-5 md:p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group'>
              <div className='w-12 h-12 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform'>
                <img src={wideAssortmentIcon} alt='Assortment' className='w-7 h-7 md:w-10 md:h-10 object-contain' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight mb-1 md:mb-2'>Wide assortment</p>
                <p className='text-xs md:text-sm text-slate-600 leading-relaxed'>A massive collection of styles, brands, and safety-certified gear for every rider.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section >
  )
}

export default DisplayProductPage