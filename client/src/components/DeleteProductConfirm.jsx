import React from 'react'
import { IoIosClose } from 'react-icons/io'

const DeleteProductConfirm = ({ close, product, onConfirm, loading }) => {
    if (!product) return null

    return (
        <section className='fixed inset-0 z-50 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center p-4'>
            <div className='bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b bg-red-50/50'>
                    <h1 className='font-bold text-slate-800 text-lg'>Delete Product</h1>
                    <button
                        onClick={close}
                        className='p-1 hover:bg-red-100 rounded-full transition-colors text-slate-600 hover:text-red-500'
                    >
                        <IoIosClose size={30} />
                    </button>
                </div>

                <div className='p-6 grid gap-5'>
                    <p className='text-slate-600'>
                        Are you sure you want to delete <span className='font-semibold text-slate-800'>"{product.name}"</span>? This cannot be undone.
                    </p>
                    {product.image?.[0] && (
                        <div className='flex justify-center'>
                            <div className='w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50'>
                                <img src={product.image[0]} alt={product.name} className='w-full h-full object-scale-down' />
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className='flex items-center gap-3'>
                        <button
                            type='button'
                            onClick={close}
                            className='flex-1 py-3 font-semibold text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all'
                        >
                            Cancel
                        </button>
                        <button
                            type='button'
                            onClick={() => onConfirm(product)}
                            disabled={loading}
                            className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default DeleteProductConfirm
