import React, { useState } from 'react'
import { IoIosClose } from 'react-icons/io'
import { HiOutlineBan } from 'react-icons/hi'

const CancelOrderConfirm = ({ close, onConfirm, loading, orderId }) => {
    const [selectedReason, setSelectedReason] = useState("")
    const [customReason, setCustomReason] = useState("")

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

                <div className='p-6'>
                    <p className='text-neutral-600 mb-6 text-center'>
                        Are you sure you want to cancel order <span className='font-bold text-neutral-800'>#{orderId}</span>? This action cannot be undone.
                    </p>

                    <div className='mb-6'>
                        <label className='block text-sm font-bold text-neutral-700 mb-2'>
                            Reason for cancellation
                        </label>
                        <div className='space-y-2'>
                            {[
                                "Ordered by mistake",
                                "Wrong delivery address",
                                "Found a better price elsewhere",
                                "Delivery time is too long",
                                "Others"
                            ].map((reason) => (
                                <label
                                    key={reason}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedReason === reason
                                        ? 'border-rose-500 bg-rose-50/50 text-rose-700'
                                        : 'border-neutral-100 hover:border-neutral-200 text-neutral-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="cancellationReason"
                                        value={reason}
                                        checked={selectedReason === reason}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-neutral-300"
                                    />
                                    <span className="text-sm font-medium">{reason}</span>
                                </label>
                            ))}
                        </div>

                        {selectedReason === "Others" && (
                            <div className='mt-3 animate-in fade-in slide-in-from-top-2 duration-300'>
                                <textarea
                                    className='w-full p-4 rounded-xl border border-neutral-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-sm resize-none'
                                    placeholder='Please tell us more about why you are cancelling...'
                                    rows={3}
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

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
                            onClick={() => onConfirm(selectedReason === "Others" ? customReason : selectedReason)}
                            disabled={loading || !selectedReason || (selectedReason === "Others" && !customReason.trim())}
                            className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${loading || !selectedReason || (selectedReason === "Others" && !customReason.trim())
                                ? 'bg-neutral-300 cursor-not-allowed shadow-none'
                                : 'bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-rose-100'
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
