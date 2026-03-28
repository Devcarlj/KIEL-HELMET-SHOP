import React, { useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { IoClose } from 'react-icons/io5'
import { FaStar } from 'react-icons/fa'

const ReviewModal = ({ close, product, orderId, existingReview, onSuccess }) => {
    const [rating, setRating] = useState(existingReview?.rating || 0)
    const [hover, setHover] = useState(null)
    const [comment, setComment] = useState(existingReview?.comment || '')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (rating === 0) {
            toast.error("Please provide a rating.")
            return
        }

        try {
            setLoading(true)
            const endpoint = existingReview ? SummaryApi.editReview : SummaryApi.addReview;
            const url = existingReview ? `${endpoint.url}/${existingReview._id}` : endpoint.url;
            
            const response = await Axios({
                ...endpoint,
                url: url,
                data: {
                    productId: product?.productId || product?._id,
                    orderId: orderId,
                    rating: rating,
                    comment: comment
                }
            })

            if (response.data.success) {
                toast.success(response.data.message)
                if (onSuccess) onSuccess()
                close()
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.deleteReview,
                url: `${SummaryApi.deleteReview.url}/${existingReview._id}`
            })

            if (response.data.success) {
                toast.success(response.data.message)
                if (onSuccess) onSuccess()
                close()
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
            <div className='bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-fade-in-up'>
                <button onClick={close} className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-rose-100 hover:text-rose-600 transition-colors'>
                    <IoClose size={20} />
                </button>
                
                <h2 className='text-xl font-bold text-neutral-800 mb-2'>{existingReview ? 'Edit Review' : 'Rate Product'}</h2>
                <p className='text-sm text-neutral-500 mb-6'>Tell others what you think about {product?.name || 'this product'}</p>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='flex flex-col items-center justify-center py-4 bg-neutral-50 rounded-xl border border-neutral-100'>
                        <span className='text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3'>Your Rating</span>
                        <div className='flex items-center gap-2'>
                            {[...Array(5)].map((_, index) => {
                                const ratingValue = index + 1;
                                return (
                                    <label key={index}>
                                        <input 
                                            type="radio" 
                                            name="rating" 
                                            value={ratingValue} 
                                            onClick={() => setRating(ratingValue)}
                                            className='hidden'
                                        />
                                        <FaStar 
                                            className='cursor-pointer transition-colors duration-200' 
                                            size={32}
                                            color={ratingValue <= (hover || rating) ? "#fbbf24" : "#e5e7eb"}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(null)}
                                        />
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-xs font-bold text-neutral-800 uppercase tracking-wide'>Comment (Optional)</label>
                        <textarea 
                            className='w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none'
                            rows={4}
                            placeholder="What did you like or dislike?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <div className='pt-2 flex justify-between items-center w-full'>
                        {existingReview ? (
                            <button 
                                type="button" 
                                disabled={loading}
                                onClick={handleDelete}
                                className='px-4 py-2.5 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors'
                            >
                                Delete
                            </button>
                        ) : <div/>}

                        <div className='flex gap-3'>
                            <button 
                                type="button" 
                                onClick={close}
                                className='px-6 py-2.5 rounded-xl font-bold text-sm text-neutral-600 hover:bg-neutral-100 transition-colors'
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className='px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-secondary transition-colors shadow-lg shadow-primary/30'
                            >
                                {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReviewModal
