import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { DisplayPrice } from '../utils/DisplayPrice'
import AddToCartButton from '../components/AddToCartButton'
import { useDispatch, useSelector } from 'react-redux'
import isAdmin from '../utils/isAdmin'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import ReviewModal from '../components/ReviewModal'
import { addCartItem } from '../store/cartSlice'
import { FaStar, FaEdit, FaTrash, FaShoppingBag, FaBolt, FaArrowRight, FaChevronLeft, FaShareAlt, FaEllipsisH, FaCommentDots, FaHeart, FaRegHeart } from 'react-icons/fa'
import { setFavorites } from '../store/userSlice'
import { IoMdAdd, IoIosClose } from "react-icons/io";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { MdOutlineAddShoppingCart } from "react-icons/md";

import deliveryIcon from '../assets/delivery.png'
import moneyIcon from '../assets/money.png'
import assortmentIcon from '../assets/assortment.png'

import { getOptimizedImageUrl } from '../utils/OptimizeImage'
import { DisplayProductPageSkeleton } from '../components/Skeletons'

const DisplayProductPage = () => {
  const { productId } = useParams()
  const dispatch = useDispatch()
  const favorites = useSelector(state => state.user.favorites)
  const userId = useSelector(state => state.user._id)

  const isFavorite = Array.isArray(favorites) && favorites.some(fav => (fav._id || fav) === productId)

  const handleToggleFavorite = async () => {
    if (!userId) {
      toast.error("Please login first!")
      return
    }

    try {
      const response = await Axios({
        ...SummaryApi.toggleFavorite,
        data: { productId: productId }
      })

      if (response.data.success) {
        // Synchronize favorites by fetching user details
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
  const location = useLocation()

  const [product, setProduct] = useState(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariations, setSelectedVariations] = useState({})
  const [reviews, setReviews] = useState([])
  const user = useSelector(state => state.user)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [newBadge, setNewBadge] = useState('')
  const [isUpdatingBadges, setIsUpdatingBadges] = useState(false)
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false)

  const handleAddBadge = async () => {
    if (!newBadge.trim()) return
    const updatedBadges = [...(product.badges || []), newBadge.trim()]
    await updateBadges(updatedBadges)
    setNewBadge('')
  }

  const handleDeleteBadge = async (index) => {
    const currentBadges = product.badges || []
    const updatedBadges = currentBadges.filter((_, i) => i !== index)
    await updateBadges(updatedBadges)
  }

  const updateBadges = async (updatedBadges) => {
    try {
      setIsUpdatingBadges(true)
      const response = await Axios({
        ...SummaryApi.updateProduct,
        data: {
          _id: product._id,
          badges: updatedBadges
        }
      })
      if (response.data.success) {
        setProduct(prev => ({ ...prev, badges: updatedBadges }))
        toast.success("Badges updated")
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setIsUpdatingBadges(false)
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await Axios({
          ...SummaryApi.getProduct,
          params: { _id: productId }
        })

        if (response.data.success && response.data.data.length > 0) {
          setProduct(response.data.data[0])
        }
      } catch (error) {
        console.log('Error loading product details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!product || product._id !== productId) {
      fetchProduct()
    }
  }, [product, productId])

  useEffect(() => {
    setActiveImageIndex(0)
    setSelectedVariations({})
  }, [productId])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await Axios({
          ...SummaryApi.getProductReviews,
          url: `${SummaryApi.getProductReviews.url}/${productId}`
        })
        if (response.data.success) {
          setReviews(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching reviews", error)
      }
    }
    if (productId) {
      fetchReviews()
    }
  }, [productId])

  const fetchReviewsDirectly = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProductReviews,
        url: `${SummaryApi.getProductReviews.url}/${productId}`
      })
      if (response.data.success) {
        setReviews(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching reviews", error)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const response = await Axios({
        ...SummaryApi.deleteReview,
        url: `${SummaryApi.deleteReview.url}/${reviewId}`
      })
      if (response.data.success) {
        toast.success(response.data.message)
        fetchReviewsDirectly()
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  const openEditModal = (review) => {
    setEditingReview(review)
    setReviewModalOpen(true)
  }

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
      link.href = getOptimizedImageUrl(activeImage, { width: 800 })
      // Add responsive srcset for mobile discovery (e.g. w_400 for small screens)
      link.setAttribute('imagesrcset', `${getOptimizedImageUrl(activeImage, { width: 400 })} 400w, ${getOptimizedImageUrl(activeImage, { width: 800 })} 800w`)
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
    let base = product.price || 0

    // Check if variations are selected and have a specific price
    if (product.variations && product.variationStocks?.length > 0) {
      if (Object.keys(selectedVariations).length === product.variations.length) {
        const match = product.variationStocks.find(vs => {
          return Object.entries(vs.combinations).every(([key, value]) => selectedVariations[key] === value)
        })
        if (match && match.price) {
          base = match.price
        }
      }
    }

    const discount = product.discount || 0
    return Math.round(base * (1 - discount / 100))
  }, [product, selectedVariations])

  const currentVariationStock = useMemo(() => {
    if (!product) return 0
    if (!product.variationStocks || product.variationStocks.length === 0) {
      return Number(product.stock) || 0
    }

    // Sum stock of all variations that match current (possibly partial) selection
    const matchingStock = product.variationStocks.reduce((sum, vs) => {
      const matches = Object.entries(selectedVariations).every(([name, value]) =>
        vs.combinations[name] === value
      )
      return matches ? sum + Number(vs.stock) : sum
    }, 0)

    return matchingStock
  }, [product, selectedVariations])

  const totalStock = useMemo(() => {
    if (!product) return 0
    if (!product.variationStocks || product.variationStocks.length === 0) {
      return Number(product.stock) || 0
    }
    return product.variationStocks.reduce((sum, vs) => sum + Number(vs.stock), 0)
  }, [product])

  const navigate = useNavigate()
  const variationsRef = useRef(null)

  const [buyingNow, setBuyingNow] = useState(false)
  const [highlightVariations, setHighlightVariations] = useState(false)
  const [showVariationDrawer, setShowVariationDrawer] = useState(false)
  const [drawerMode, setDrawerMode] = useState('add') // 'add' or 'buy'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [drawerQty, setDrawerQty] = useState(1)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)

  const isOptionAvailable = (variationName, optionValue) => {
    if (!product || !product.variationStocks || product.variationStocks.length === 0) return true

    return product.variationStocks.some(vs => {
      if (vs.combinations[variationName] !== optionValue) return false

      // Check if it matches other already selected variations
      for (const [key, val] of Object.entries(selectedVariations)) {
        if (key !== variationName && vs.combinations[key] !== val) {
          return false
        }
      }

      return Number(vs.stock) > 0
    })
  }

  const getDeliveryDateRange = () => {
    const today = new Date()
    const addBusinessDays = (date, days) => {
      let result = new Date(date)
      let count = 0
      while (count < days) {
        result.setDate(result.getDate() + 1)
        if (result.getDay() !== 0 && result.getDay() !== 6) {
          count++
        }
      }
      return result
    }

    const start = addBusinessDays(today, 2)
    const end = addBusinessDays(today, 3)

    const options = { day: 'numeric', month: 'short' }
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
  }

  const deliveryRange = useMemo(() => getDeliveryDateRange(), [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    if (isLeftSwipe) {
      setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
    }
    if (isRightSwipe) {
      setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
    }
  }

  const validateVariations = () => {
    if (product.variations?.length > 0 && Object.keys(selectedVariations).length < product.variations.length) {
      setHighlightVariations(true)
      variationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.error("Please pick your options first!")

      // Reset highlight after animation
      setTimeout(() => setHighlightVariations(false), 2000)
      return false
    }
    return true
  }

  const handleBuyNow = async () => {
    if (isMobile && product.variations?.length > 0 && !showVariationDrawer) {
      setDrawerMode('buy')
      setDrawerQty(1)
      setShowVariationDrawer(true)
      return
    }

    if (!validateVariations()) return

    setBuyingNow(true)
    const variationsArr = Object.entries(selectedVariations).map(([name, value]) => ({ name, value }))

    try {
      if (!user?._id) {
        // Guest Buy Now
        const guestCartItem = {
          _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          productId: product,
          quantity: drawerQty,
          userId: null,
          variations: variationsArr
        }
        dispatch(addCartItem(guestCartItem))
        navigate('/checkout')
        toast.success("Proceeding to checkout")
        return
      }

      const response = await Axios({
        ...SummaryApi.addToCart,
        data: { productId: product._id, variations: variationsArr, quantity: drawerQty }
      })

      if (response.data.success) {
        dispatch(addCartItem({
          _id: response.data.data._id,
          productId: product,
          quantity: response.data.data.quantity,
          variations: variationsArr
        }))
        navigate('/checkout')
        toast.success("Proceeding to checkout")
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setBuyingNow(false)
      setShowVariationDrawer(false)
    }
  }

  const handleAddToCartUnified = async () => {
    if (isMobile && product.variations?.length > 0 && !showVariationDrawer) {
      setDrawerMode('add')
      setDrawerQty(1)
      setShowVariationDrawer(true)
      return
    }

    if (!isMobile && !validateVariations()) return;

    if (currentVariationStock === 0) {
      toast.error("Out of stock")
      return;
    }

    setDrawerLoading(true)
    const variationsArr = Object.entries(selectedVariations).map(([name, value]) => ({ name, value }))
    
    try {
      if (!user?._id) {
        const guestCartItem = {
          _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          productId: product,
          quantity: isMobile ? drawerQty : 1,
          userId: null,
          variations: variationsArr
        }
        dispatch(addCartItem(guestCartItem))
        toast.success("Added to cart")
      } else {
        const response = await Axios({
          ...SummaryApi.addToCart,
          data: { productId: product._id, variations: variationsArr, quantity: isMobile ? drawerQty : 1 }
        })
        if (response.data.success) {
          dispatch(addCartItem({
            _id: response.data.data._id,
            productId: product,
            quantity: response.data.data.quantity,
            variations: variationsArr
          }))
          toast.success("Added to cart")
        }
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setDrawerLoading(false)
    }
  }

  const handleDrawerAddToCart = async () => {
    if (Object.keys(selectedVariations).length < (product?.variations?.length || 0)) {
      toast.error("Please select all options")
      return;
    }

    if (currentVariationStock === 0) {
      toast.error("Out of stock")
      return;
    }

    setDrawerLoading(true)
    const variationsArr = Object.entries(selectedVariations).map(([name, value]) => ({ name, value }))

    try {
      if (!user?._id) {
        const guestCartItem = {
          _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          productId: product,
          quantity: drawerQty,
          userId: null,
          variations: variationsArr
        }
        dispatch(addCartItem(guestCartItem))
        toast.success("Added to cart")
        setShowVariationDrawer(false)
        return
      }

      const response = await Axios({
        ...SummaryApi.addToCart,
        data: { productId: product._id, variations: variationsArr, quantity: drawerQty }
      })

      if (response.data.success) {
        dispatch(addCartItem({
          _id: response.data.data._id,
          productId: product,
          quantity: response.data.data.quantity,
          variations: variationsArr
        }))
        toast.success("Added to cart")
        setShowVariationDrawer(false)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setDrawerLoading(false)
    }
  }

  if (loading || !product) {
    return <DisplayProductPageSkeleton />
  }

  return (
    <section className='bg-white min-h-[78vh] pb-10'>
      <div className='w-full px-0 md:px-10 lg:px-16 py-0 md:py-10'>
        {/* Breadcrumb - Restored on Mobile */}
        <div className='flex items-center gap-1 text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-3 md:mb-6 px-4 md:px-0 mt-2 md:mt-0'>
          <Link to='/' className='hover:text-primary'>Home</Link>
          <span>/</span>
          <span className='text-slate-500'>Product</span>
          <span>/</span>
          <span className='text-slate-900 line-clamp-1'>{product.name}</span>
        </div>

        {/* Main layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr] gap-2 md:gap-8 lg:gap-16 items-start'>

          {/* Left: Image gallery */}
          <div className='relative md:bg-slate-50 md:rounded-[1.5rem] md:rounded-[2.5rem] md:border md:border-slate-100 p-0 md:p-6 flex flex-col gap-2 md:gap-3 w-full'>

            {/* Mobile Header Icons Overlay on Image - Removed as requested */}

            <div
              className='relative w-full aspect-[4/3] max-h-[280px] md:aspect-square md:max-h-[450px] md:rounded-2xl bg-white md:border md:border-slate-100 overflow-hidden flex items-center justify-center shadow-sm touch-pan-y'
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {activeImage ? (
                <img
                  src={getOptimizedImageUrl(activeImage, { width: 800 })}
                  srcSet={`${getOptimizedImageUrl(activeImage, { width: 400 })} 400w, ${getOptimizedImageUrl(activeImage, { width: 800 })} 800w`}
                  sizes="(max-width: 768px) 100vw, 800px"
                  alt={product.name}
                  fetchPriority="high"
                  loading="eager"
                  width={800}
                  height={800}
                  className='w-full h-full object-scale-down p-0 md:p-4 pointer-events-none'
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
                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] md:text-[11px] font-black text-white'>
                  {activeImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className='md:flex hidden gap-2 overflow-x-auto no-scrollbar justify-center pb-1'>
                {images.map((img, index) => (
                  <button
                    key={img + index}
                    type='button'
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-2xl border-2 overflow-hidden shrink-0 transition-all ${index === activeImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-white bg-white hover:border-slate-200'
                      }`}
                  >
                    <img src={getOptimizedImageUrl(img, { width: 200 })} alt='thumb' loading='lazy' className='w-full h-full object-scale-down p-1' />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className='space-y-3 md:space-y-2 lg:pl-4'>
            <div className='hidden md:block'>
              <div className='flex items-start justify-between gap-4'>
                <h1 className='text-xl md:text-xl lg:text-2xl font-black text-slate-900 mb-0.5 leading-tight flex items-center flex-wrap gap-2'>
                  <span className='bg-red-600 text-white text-[9px] md:text-[11px] px-2 py-0.5 rounded-md font-black shadow-sm'>Secured</span>
                  {product.name}
                </h1>
                <button
                  onClick={handleToggleFavorite}
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 shadow-sm border ${isFavorite
                    ? 'bg-red-50 border-red-100 text-red-500'
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md'
                    }`}
                >
                  {isFavorite ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                </button>
              </div>
              <p className='text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-[0.25em]'>
                {product.unit || 'Standard Unit'}
              </p>
            </div>

            <div className='md:bg-slate-50/50 p-4 md:p-4 md:rounded-[1.5rem] md:rounded-[2rem] md:border md:border-slate-100 flex flex-col gap-1 md:gap-3'>
              {/* Variations Available Row - Removed as requested */}

              <div className='flex items-center justify-between px-4 md:px-0 mt-0 md:mt-0'>
                <div className='flex flex-col'>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-2xl md:text-3xl lg:text-4xl font-black text-primary tracking-tight'>
                      {DisplayPrice(effectivePrice)}
                    </span>
                    <span className='text-[10px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-full md:hidden'>After Voucher</span>

                    {product.discount > 0 && (
                      <span className='hidden md:block px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] md:text-xs font-black uppercase tracking-wider'>
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>

                  {product.discount > 0 && (
                    <div className='flex flex-wrap items-center gap-2 mt-0.5'>
                      <span className='text-[11px] md:text-base text-slate-400 line-through font-medium'>
                        {DisplayPrice(product.price)}
                      </span>
                      <span className='hidden md:inline text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-tight'>
                        Save {DisplayPrice(product.price - effectivePrice)}
                      </span>
                    </div>
                  )}

                  <div className='flex items-center gap-1 mt-1 md:mt-1'>
                    <span className='text-[11px] md:text-[12px] font-bold text-slate-500 line-clamp-1'>
                      Ships in 24 hours
                    </span>
                    <span className='text-[11px] md:text-[12px] text-green-600 font-black ml-1 md:ml-2 tracking-wide'>Free Delivery</span>
                  </div>

                  {/* Dynamic Badges Row */}
                  <div className='flex flex-wrap gap-2 mt-1 md:mt-1 items-center'>
                    {(product.badges || []).map((badge, index) => (
                      <div key={index} className='relative px-2 py-0.5 md:px-2 md:py-0.5 border border-primary text-primary text-[9px] md:text-[10px] font-black rounded-sm md:rounded-md flex items-center gap-1 bg-primary/5 uppercase tracking-wider group'>
                        {badge}
                        {isAdmin(user.role) && (
                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBadge(index);
                            }}
                            className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center shadow-sm hover:bg-black transition-all z-10'
                            title="Remove Badge"
                          >
                            <IoIosClose size={12} />
                          </button>
                        )}
                      </div>
                    ))}

                    {isAdmin(user.role) && (
                      <button
                        onClick={() => setIsBadgeModalOpen(true)}
                        className='w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm'
                        title="Manage Badges"
                      >
                        <IoMdAdd size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className='md:hidden flex flex-col items-end'>
                  <span className='text-[11px] font-bold text-slate-500'>
                    {totalStock > 0
                      ? `${totalStock} units left`
                      : "Out of Stock"}
                  </span>
                  <button
                    onClick={handleToggleFavorite}
                    className={`mt-1 active:scale-90 transition-all ${isFavorite ? 'text-red-500' : 'text-slate-400'}`}
                  >
                    {isFavorite ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
                  </button>
                </div>
              </div>

              {/* Variation Selection - Desktop */}
              {product.variations?.length > 0 && (
                <div
                  ref={variationsRef}
                  className={`hidden md:block transition-all duration-500 space-y-3 px-4 md:px-0 ${highlightVariations ? 'animate-shake' : ''}`}
                >
                  <div className='flex items-center justify-between mb-1'>
                    <h3 className='text-[11px] font-black text-slate-400 uppercase tracking-widest'>Selection</h3>
                    <span className={`text-[11px] font-bold transition-all duration-300 ${currentVariationStock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {Object.keys(selectedVariations).length === product.variations.length
                        ? (currentVariationStock > 0 ? `Stock: ${currentVariationStock} pieces available` : "Out of Stock")
                        : (totalStock > 0 ? `${totalStock} units available` : "Out of Stock")
                      }
                    </span>
                  </div>
                  <style>
                    {`
                      @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-4px); }
                        75% { transform: translateX(4px); }
                      }
                      .animate-shake { animation: shake 0.2s ease-in-out 0s 3; }
                    `}
                  </style>
                  {product.variations.map((v, index) => (
                    <div key={index} className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <h3 className='text-[10px] font-black text-slate-500 uppercase tracking-wider'>{v.name}</h3>
                        {!selectedVariations[v.name] && <span className='text-[9px] text-red-500 font-bold'>* Required</span>}
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {v.options.map((opt) => {
                          const isSelected = selectedVariations[v.name] === opt
                          const isAvailable = isOptionAvailable(v.name, opt)
                          return (
                            <button
                              key={opt}
                              type='button'
                              onClick={() => setSelectedVariations(prev => ({ ...prev, [v.name]: opt }))}
                              className={`min-w-[45px] h-9 px-4 rounded-md text-xs font-bold transition-all border ${isSelected
                                  ? 'bg-primary/5 border-primary text-primary shadow-sm'
                                  : isAvailable
                                    ? 'bg-white border-slate-200 text-slate-600 hover:border-primary/30'
                                    : 'bg-slate-50 border-slate-100 text-slate-300 opacity-60 cursor-not-allowed border-dashed'
                                }`}
                            >
                              <span className={!isAvailable && !isSelected ? 'line-through' : ''}>{opt}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile Title */}
              <div className='md:hidden px-4'>
                <h1 className='text-sm font-bold text-slate-900 leading-tight line-clamp-2'>
                  <span className='bg-red-600 text-white text-[9px] px-1 py-0.5 rounded-sm mr-1 font-black'>Secured</span>
                  {product.name}
                </h1>
              </div>

              {/* Unified CTA Buttons Section */}
              <div className='flex items-center justify-center gap-2 md:gap-4 px-4 md:px-0 py-2 md:py-0 w-full'>
                <a 
                  href="https://www.facebook.com/people/KIEL-Helmet-SHOP/100092575211604/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className='w-[48px] md:w-[60px] h-[48px] md:h-[60px] flex items-center justify-center bg-slate-50 md:bg-white border border-slate-200 shadow-sm rounded-sm md:rounded-xl active:scale-95 transition-all group shrink-0'
                >
                  <HiOutlineChatAlt2 size={24} className='text-primary group-active:scale-90 transition-transform md:w-7 md:h-7' />
                </a>

                <button
                  onClick={handleAddToCartUnified}
                  disabled={currentVariationStock === 0}
                  className={`w-[48px] md:w-[150px] h-[48px] md:h-[60px] flex items-center justify-center border rounded-sm md:rounded-xl transition-all shrink-0 ${currentVariationStock === 0 ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : 'bg-primary/5 text-primary border-primary/30 active:scale-95 md:bg-primary/5 md:hover:bg-primary/10 shadow-sm'}`}
                >
                  {drawerLoading ? (
                      <div className='w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                  ) : (
                      <>
                        <MdOutlineAddShoppingCart size={24} className='md:w-6 md:h-6' />
                        <span className='hidden md:block ml-2 text-xs font-black uppercase tracking-widest'>Add To Cart</span>
                      </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={currentVariationStock === 0}
                  className={`flex-1 md:w-auto md:min-w-[200px] h-[48px] md:h-[60px] rounded-sm md:rounded-xl flex flex-col md:flex-row md:gap-3 items-center justify-center transition-all overflow-hidden relative border ${currentVariationStock === 0 ? 'bg-slate-300 border-slate-300 text-slate-100 cursor-not-allowed' : 'bg-primary text-white border-primary shadow-xl shadow-primary/20 hover:bg-black hover:border-black active:scale-95'}`}
                >
                  {buyingNow ? (
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  ) : (
                    <>
                      <span className='text-[13px] md:text-[14px] font-black leading-none tracking-widest uppercase'>{currentVariationStock === 0 ? "Sold Out" : "Buy Now"}</span>
                      <span className='text-[10px] md:text-xs font-bold opacity-90 leading-none mt-1 md:mt-0'>{DisplayPrice(effectivePrice)}</span>
                    </>
                  )}
                </button>
              </div>



              {/* Mobile Trust Sections */}
              <div className='md:hidden flex flex-col border-t border-slate-100'>
                <div
                  className='flex items-center justify-between p-4 py-3 cursor-pointer active:bg-slate-50 transition-colors'
                  onClick={() => setShowDeliveryModal(true)}
                >
                  <div className='flex items-center gap-3'>
                    <img src={deliveryIcon} className='w-5 h-5 grayscale opacity-70' alt='del' />
                    <div className='flex flex-col'>
                      <span className='text-[11px] font-bold text-slate-700'>Guaranteed to get by {deliveryRange}</span>
                      <span className='text-[10px] text-slate-400'>Get a ₱50 voucher if your order arrives late.</span>
                    </div>
                  </div>
                  <FaArrowRight size={10} className='text-slate-300' />
                </div>
                <div
                  className='flex items-center justify-between p-4 py-1 border-t border-slate-50 cursor-pointer active:bg-slate-50 transition-colors'
                  onClick={() => setShowReturnModal(true)}
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 rounded-full border border-red-500 flex items-center justify-center'>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className='text-red-500'><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-[11px] font-bold text-slate-700'>100% Authentic</span>
                      <div className='w-1 h-1 bg-slate-300 rounded-full' />
                      <span className='text-[11px] font-bold text-slate-700'>Free & Easy Returns</span>
                    </div>
                  </div>
                  <FaArrowRight size={10} className='text-slate-300' />
                </div>
              </div>

              {/* Desktop Trust Sections */}
              <div className='hidden md:grid grid-cols-2 gap-4 mt-2'>
                <div
                  className='group flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer'
                  onClick={() => setShowDeliveryModal(true)}
                >
                  <div className='w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors'>
                    <img src={deliveryIcon} className='w-6 h-6 group-hover:invert transition-all' alt='del' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-xs font-black text-slate-800 uppercase tracking-wider mb-1'>Fast Delivery</span>
                    <span className='text-[11px] font-bold text-slate-500'>Guaranteed by {deliveryRange}</span>
                  </div>
                </div>

                <div
                  className='group flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer'
                  onClick={() => setShowReturnModal(true)}
                >
                  <div className='w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors'>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className='text-orange-600 group-hover:text-white transition-colors'><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-xs font-black text-slate-800 uppercase tracking-wider mb-1'>Easy Returns</span>
                    <span className='text-[11px] font-bold text-slate-500'>7-Day Satisfaction Policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {product.description && (
          <div className='mt-2 md:mt-8 pt-6 md:pt-8 border-t border-slate-200 px-4 md:px-0'>
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
          <div className='mt-8 pt-6 border-t border-slate-200 px-4 md:px-0'>
            <h2 className='text-xs font-black text-slate-500 uppercase tracking-[0.25em] mb-0 mt-3'>
              More Details
            </h2>
            <div className='rounded-2xl bg-slate-50/80 border border-slate-100 p-5 md:p-6 mt-3'>
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

        {/* Product Reviews Section */}
        <div className='mt-8 pt-6 border-t border-slate-200 px-4 md:px-0'>
          <h2 className='text-xs font-black text-slate-500 uppercase tracking-[0.25em] mb-4 flex items-center gap-2'>
            Product Reviews <span className='bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]'>{reviews.length}</span>
          </h2>

          {reviews.length > 0 ? (
            <div className='space-y-4'>
              {reviews.map((review, idx) => (
                <div key={idx} className='bg-slate-50/50 border border-slate-100 p-4 md:p-6 rounded-[1.5rem] hover:shadow-lg hover:bg-white transition-all'>
                  <div className='flex items-center gap-3 mb-0'>
                    <div className='w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100'>
                      {review.userId?.avatar ? (
                        <img src={review.userId.avatar} alt={review.userId.name} className='w-full h-full object-cover' />
                      ) : (
                        <span className='text-xs font-bold text-slate-500'>{(review.userId?.name || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className='text-sm font-bold text-slate-800 flex items-center gap-2'>
                        {review.userId?.name || 'Customer'}
                        {review.isEdited && (
                          <span className='text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-medium tracking-wider uppercase'>(Edited)</span>
                        )}
                      </p>
                      <div className='flex text-amber-400 text-xs mt-0.5'>
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} color={i < review.rating ? "#fbbf24" : "#e5e7eb"} />
                        ))}
                      </div>
                    </div>
                    <div className='ml-auto flex flex-col items-end gap-2'>
                      <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      {((user?._id && review.userId?._id === user._id) || isAdmin(user?.role)) && (
                        <div className='flex items-center gap-2'>
                          {review.userId?._id === user._id && (
                            <button onClick={() => openEditModal(review)} className='text-slate-400 hover:text-blue-500 transition-colors p-1'>
                              <FaEdit size={12} />
                            </button>
                          )}
                          <button onClick={() => handleDeleteReview(review._id)} className='text-slate-400 hover:text-red-500 transition-colors p-1'>
                            <FaTrash size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {review.comment && (
                    <p className='text-sm text-slate-600 pl-[3.25rem] leading-relaxed italic'>"{review.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 bg-slate-50/50 border border-slate-100 rounded-[1.5rem]'>
              <FaStar className='text-slate-300 mb-3 drop-shadow-sm' size={40} />
              <p className='text-sm text-slate-500 font-bold'>No reviews yet</p>
              <p className='text-xs text-slate-400 mt-1'>Be the first to review this product after purchase.</p>
            </div>
          )}
        </div>

        {/* Benefits Section - Visible on all devices (After More Details) */}
        <div className='mt-12 md:mt-16 pt-10 md:pt-14 border-t border-slate-200 px-4 md:px-0'>
          <h2 className='text-[11px] md:text-sm font-black text-slate-500 uppercase tracking-[0.25em] mb-6 md:mb-12 text-center'>
            Why shop from Kiel Helmet Shop?
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8'>
            <div className='flex flex-row md:flex-col md:items-center md:text-center gap-4 p-5 md:p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group'>
              <div className='w-14 h-14 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform'>
                <img src={deliveryIcon} alt='Delivery' loading='lazy' className='w-9 h-9 md:w-14 md:h-14 object-contain' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight mb-1 md:mb-2'>Secured delivery</p>
                <p className='text-xs md:text-sm text-slate-600 leading-relaxed'>We bring your gear straight to you with care, secure, and ready when you are.</p>
              </div>
            </div>
            <div className='flex flex-row md:flex-col md:items-center md:text-center gap-4 p-5 md:p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group'>
              <div className='w-14 h-14 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform'>
                <img src={moneyIcon} alt='Prices' loading='lazy' className='w-9 h-9 md:w-14 md:h-14 object-contain' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight mb-1 md:mb-2'>Best prices & offers</p>
                <p className='text-xs md:text-sm text-slate-600 leading-relaxed'>The most competitive prices and exclusive deals on all premium helmets and accessories.</p>
              </div>
            </div>
            <div className='flex flex-row md:flex-col md:items-center md:text-center gap-4 p-5 md:p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group'>
              <div className='w-14 h-14 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform'>
                <img src={assortmentIcon} alt='Assortment' loading='lazy' className='w-9 h-9 md:w-14 md:h-14 object-contain' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight mb-1 md:mb-2'>Wide assortment</p>
                <p className='text-xs md:text-sm text-slate-600 leading-relaxed'>A massive collection of styles, brands, and safety-certified gear for every rider.</p>
              </div>
            </div>
          </div>
        </div>

      </div>      {/* Mobile Variation Drawer */}
      <div className={`fixed inset-0 z-[100] flex items-end justify-center transition-all duration-300 ${showVariationDrawer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${showVariationDrawer ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setShowVariationDrawer(false)}
        />
        <div className={`relative w-full max-w-lg bg-white rounded-t-[2.5rem] shadow-2xl transition-transform duration-500 flex flex-col h-[85vh] overflow-hidden ${showVariationDrawer ? 'translate-y-0' : 'translate-y-full'}`}>
          {/* Drawer Handle */}
          <div className='w-full flex justify-center py-4 shrink-0' onClick={() => setShowVariationDrawer(false)}>
            <div className='w-12 h-1.5 bg-slate-200 rounded-full' />
          </div>

          {/* Header */}
          <div className='px-5 flex gap-4 mb-4 items-start relative'>
            <div className='w-28 h-28 bg-white rounded-xl border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm'>
              <img src={getOptimizedImageUrl(activeImage, { width: 300 })} alt='product' className='w-full h-full object-contain p-2' />
            </div>
            <div className='flex flex-col pt-2'>
              <p className='text-2xl font-black text-primary leading-tight'>{DisplayPrice(effectivePrice)}</p>
              <div className='mt-1 flex flex-col'>
                <p className='text-[11px] text-slate-400 font-bold uppercase tracking-wider'>Selected Variation:</p>
                <p className='text-[13px] text-slate-800 font-black line-clamp-1'>
                  {Object.keys(selectedVariations).length > 0
                    ? Object.values(selectedVariations).join(", ")
                    : "Select Options"}
                </p>
              </div>
              <p className={`text-[11px] font-bold mt-1 ${currentVariationStock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {currentVariationStock > 0 ? `Stock: ${currentVariationStock} pieces available` : "Out of Stock"}
              </p>
            </div>
            <button
              onClick={() => setShowVariationDrawer(false)}
              className='absolute top-0 right-5 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-transform'
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className='flex-1 overflow-y-auto min-h-0 no-scrollbar px-5 space-y-4'>
            {/* Variation Options */}
            {product?.variations?.map((v, index) => (
              <div key={index} className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-[11px] font-black text-slate-400 uppercase tracking-widest'>{v.name}</h3>
                  {!selectedVariations[v.name] && <span className='text-[10px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-full'>Required</span>}
                </div>
                <div className='flex flex-wrap gap-3'>
                  {v.options.map((opt) => {
                    const isSelected = selectedVariations[v.name] === opt
                    const isAvailable = isOptionAvailable(v.name, opt)
                    return (
                      <button
                        key={opt}
                        type='button'
                        onClick={() => setSelectedVariations(prev => ({ ...prev, [v.name]: opt }))}
                        className={`min-w-[45px] h-9 px-3 rounded-md text-xs font-bold transition-all border ${isSelected
                            ? 'bg-primary/5 border-primary text-primary'
                            : isAvailable
                              ? 'bg-slate-50 border-slate-50 text-slate-600'
                              : 'bg-slate-50 border-slate-100 text-slate-300 opacity-60 border-dashed'
                          }`}
                      >
                        <span className={!isAvailable && !isSelected ? 'line-through' : ''}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}



          </div>

          {/* Action Button Footer - Sticky at bottom */}
          <div className='px-5 py-4 pb-8 bg-white border-t border-slate-50 shadow-[0_-15px_30px_-10px_rgba(0,0,0,0.08)] shrink-0 space-y-4'>
            {/* Quantity Selector inside Footer */}
            <div className='flex items-center justify-between'>
              <h3 className='text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]'>Quantity</h3>
              <div className='flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100'>
                <button
                  onClick={() => setDrawerQty(prev => Math.max(1, prev - 1))}
                  className='w-9 h-9 flex items-center justify-center text-slate-400 active:scale-90 transition-transform'
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <span className='w-10 text-center text-xs font-black text-slate-800'>{drawerQty}</span>
                <button
                  onClick={() => setDrawerQty(prev => prev + 1)}
                  className='w-9 h-9 flex items-center justify-center text-primary active:scale-90 transition-transform'
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>

            <button
              onClick={drawerMode === 'buy' ? handleBuyNow : handleDrawerAddToCart}
              disabled={currentVariationStock === 0 || Object.keys(selectedVariations).length < (product?.variations?.length || 0) || drawerLoading || buyingNow}
              className={`w-full h-14 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center transition-all shadow-xl ${(currentVariationStock === 0 || Object.keys(selectedVariations).length < (product?.variations?.length || 0))
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-primary text-white shadow-primary/20 active:scale-95'
                }`}
            >
              {drawerLoading || buyingNow ? (
                <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                currentVariationStock === 0 ? "Out of Stock" : (drawerMode === 'buy' ? "Buy Now" : "Add to Cart")
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Badge Management Modal */}
      {isBadgeModalOpen && (
        <div className='fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overscroll-none'>
          <div className='bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200'>
            <div className='p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between'>
              <h2 className='font-black text-slate-800 text-sm md:text-base uppercase tracking-widest'>Manage Badges</h2>
              <button 
                  onClick={() => setIsBadgeModalOpen(false)} 
                  className='p-1.5 hover:bg-slate-200 rounded-full transition-colors'
              >
                <IoIosClose size={24} />
              </button>
            </div>

            <div className='p-5 space-y-4'>
              {/* Added Badges */}
              <div className='flex flex-wrap gap-2 max-h-[150px] overflow-y-auto no-scrollbar'>
                {(product.badges || []).length > 0 ? (
                    (product.badges || []).map((badge, index) => (
                        <div key={index} className='flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 border border-primary/30 text-primary text-[10px] md:text-[11px] font-black rounded-lg shadow-sm group'>
                            {badge}
                            <button
                                onClick={() => handleDeleteBadge(index)}
                                className='text-red-500 hover:text-red-700 transition-colors ml-1'
                                title="Remove Badge"
                            >
                                <IoIosClose size={18} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className='w-full py-4 text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 rounded-xl'>
                        No badges added yet.
                    </div>
                )}
              </div>

              {/* Add Badge Input */}
              <div className='flex items-center gap-2'>
                <input
                  type="text"
                  placeholder='Add new badge (e.g. Sale)'
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBadge()}
                  className='flex-1 bg-slate-50 p-3 border border-slate-200 rounded-xl outline-none focus:border-primary text-xs font-bold'
                />
                <button
                  onClick={handleAddBadge}
                  disabled={isUpdatingBadges || !newBadge.trim()}
                  className='bg-primary w-10 h-10 flex items-center justify-center text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-black transition-all disabled:opacity-50'
                >
                  <IoMdAdd size={20} />
                </button>
              </div>
            </div>

            <div className='px-5 pb-5'>
              <button
                onClick={async () => {
                    if (newBadge.trim()) {
                        await handleAddBadge();
                    }
                    setIsBadgeModalOpen(false);
                }}
                className='w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-[0.98]'
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModalOpen && (
        <ReviewModal
          close={() => {
            setReviewModalOpen(false)
            setEditingReview(null)
          }}
          product={product}
          orderId={editingReview?.orderId}
          existingReview={editingReview}
          onSuccess={fetchReviewsDirectly}
        />
      )}

      {/* Info Modals */}
      {showDeliveryModal && (
        <div className='fixed inset-0 bg-neutral-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in'>
          <div className='bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl' />

            <button
              onClick={() => setShowDeliveryModal(false)}
              className='absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all z-10 border border-slate-100'
            >
              <IoMdAdd size={24} className='rotate-45' />
            </button>

            <div className='flex flex-col items-center text-center space-y-6 pt-4'>
              <div className='w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner'>
                <img src={deliveryIcon} className='w-10 h-10' alt='delivery' />
              </div>

              <div className='space-y-2'>
                <h3 className='text-2xl font-black text-slate-900 tracking-tight'>Guaranteed Delivery</h3>
                <p className='text-xs font-black text-primary uppercase tracking-[0.2em]'>Kiel Helmet Shop Exclusive</p>
              </div>

              <div className='bg-slate-50/80 rounded-3xl p-6 border border-slate-100 w-full space-y-4'>
                <div className='flex flex-col items-center'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>Estimated Arrival</span>
                  <span className='text-lg font-black text-slate-800'>{deliveryRange}</span>
                </div>

                <div className='h-px bg-slate-200 w-full' />

                <p className='text-sm text-slate-600 leading-relaxed font-medium px-2'>
                  We prioritize your order to ensure it reaches you within the specified range. Please note that actual delivery dates may <span className='text-slate-900 font-bold'>still vary depending on your location</span> and courier workload.
                </p>

                <div className='bg-green-50 rounded-2xl p-4 border border-green-100 flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 font-bold text-xs'>₱</div>
                  <p className='text-[11px] text-green-700 font-bold text-left leading-tight'>
                    Get a ₱50 voucher if your order arrives beyond the guaranteed date!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDeliveryModal(false)}
                className='w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200'
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className='fixed inset-0 bg-neutral-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in'>
          <div className='bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl' />

            <button
              onClick={() => setShowReturnModal(false)}
              className='absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-all z-10 border border-slate-100'
            >
              <IoMdAdd size={24} className='rotate-45' />
            </button>

            <div className='flex flex-col items-center text-center space-y-6 pt-4'>
              <div className='w-20 h-20 rounded-[2rem] bg-orange-50 border border-orange-100 flex items-center justify-center shadow-inner'>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className='text-orange-600'><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>

              <div className='space-y-2'>
                <h3 className='text-2xl font-black text-slate-900 tracking-tight'>Free & Easy Returns</h3>
                <p className='text-xs font-black text-orange-500 uppercase tracking-[0.2em]'>7-Day Satisfaction Guarantee</p>
              </div>

              <div className='bg-slate-50/80 rounded-3xl p-6 border border-slate-100 w-full space-y-4'>
                <div className='flex flex-col items-center'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>Return Policy</span>
                  <span className='text-lg font-black text-slate-800'>7 Business Days</span>
                </div>

                <div className='h-px bg-slate-200 w-full' />

                <p className='text-sm text-slate-600 leading-relaxed font-medium px-2'>
                  Not satisfied with your purchase? You can return your item <span className='text-slate-900 font-bold'>within 7 days</span> of receipt for a full refund or exchange.
                </p>

                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-3 text-left p-3 rounded-2xl bg-white border border-slate-100'>
                    <div className='w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500'>1</div>
                    <span className='text-[11px] font-bold text-slate-700'>Keep original packaging & tags</span>
                  </div>
                  <div className='flex items-center gap-3 text-left p-3 rounded-2xl bg-white border border-slate-100'>
                    <div className='w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500'>2</div>
                    <span className='text-[11px] font-bold text-slate-700'>Log return via order history</span>
                  </div>
                  <div className='flex items-center gap-3 text-left p-3 rounded-2xl bg-white border border-slate-100'>
                    <div className='w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500'>3</div>
                    <span className='text-[11px] font-bold text-slate-700'>Drop off at any partner courier</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowReturnModal(false)}
                className='w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200'
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default DisplayProductPage