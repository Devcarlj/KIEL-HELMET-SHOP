import React from 'react'
import { IoIosClose } from 'react-icons/io'
import { HiOutlineBan } from 'react-icons/hi'

const CancelOrderConfirm = ({ close, onConfirm, loading, orderId }) => {
    return (
        <section className='fixed inset-0 z-[60] bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center p-4'>
            <div className='bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b bg-rose-50/50'>
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600'>
                            <HiOutlineBan size={18} />
                        </div>
                        <h1 className='font-bold text-neutral-800 text-lg'>Cancel Order</h1>
                    </div>
                    <button
                        onClick={close}
                        className='p-1 hover:bg-rose-100 rounded-full transition-colors text-neutral-400 hover:text-rose-500'
                    >
                        <IoIosClose size={28} />
                    </button>
                </div>

                <div className='p-6 text-center'>
                    <p className='text-neutral-600 mb-6'>
                        Are you sure you want to cancel order <span className='font-bold text-neutral-800'>#{orderId}</span>? This action cannot be undone.
                    </p>

                    {/* Buttons */}
                    <div className='flex items-center gap-3 mt-4'>
                        <button
                            type='button'
                            onClick={close}
                            className='flex-1 py-3 font-bold text-neutral-500 hover:bg-neutral-50 rounded-xl border border-neutral-200 transition-all'
                        >
                            No, Keep it
                        </button>
                        <button
                            type='button'
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg shadow-rose-100 transition-all ${loading ? 'bg-neutral-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 active:scale-95'
                                }`}
                        >
                            {loading ? 'Cancelling...' : 'Yes, Cancel Order'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CancelOrderConfirm
