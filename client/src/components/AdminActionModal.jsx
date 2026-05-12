import React from 'react'
import { IoIosClose } from 'react-icons/io'
import { FiUserPlus, FiUserX, FiAlertCircle, FiLoader } from 'react-icons/fi'
import defaultUserAvatar from '../assets/default_user_profiles.png'

const AdminActionModal = ({ 
    type, // 'promote' or 'demote'
    user, 
    onConfirm, 
    onClose, 
    loading 
}) => {
    if (!user) return null

    const isPromote = type === 'promote'
    
    return (
        <section className='fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4'>
            <div className='bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-100'>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${
                    isPromote ? 'bg-green-50/50' : 'bg-red-50/50'
                }`}>
                    <div className='flex items-center gap-2'>
                        {isPromote ? (
                            <FiUserPlus className='text-green-600' size={18} />
                        ) : (
                            <FiUserX className='text-red-500' size={18} />
                        )}
                        <h1 className='font-bold text-slate-800 text-lg'>
                            {isPromote ? 'Promote to Admin' : 'Remove Admin Privileges'}
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600'
                    >
                        <IoIosClose size={28} />
                    </button>
                </div>

                <div className='p-6'>
                    <div className='flex flex-col items-center gap-4 text-center'>
                        {/* User Avatar & Info */}
                        <div className='relative'>
                            <div className={`w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden ${
                                isPromote ? 'ring-2 ring-green-100' : 'ring-2 ring-red-100'
                            }`}>
                                <img 
                                    src={user.avatar || defaultUserAvatar} 
                                    alt={user.name} 
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full shadow-lg ${
                                isPromote ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                                {isPromote ? <FiUserPlus size={12} /> : <FiUserX size={12} />}
                            </div>
                        </div>

                        <div>
                            <h2 className='font-bold text-slate-800 text-lg'>{user.name}</h2>
                            <p className='text-sm text-slate-500'>{user.email}</p>
                        </div>

                        <div className={`p-3 rounded-xl text-sm flex gap-3 text-left ${
                            isPromote ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                            <FiAlertCircle className='shrink-0 mt-0.5' size={16} />
                            <p>
                                {isPromote 
                                    ? "This user will have full access to the administration dashboard, including managing products, categories, and orders."
                                    : "This will demote the user back to a regular customer. They will no longer have access to admin-only features."
                                }
                            </p>
                        </div>

                        <p className='text-slate-600 font-medium'>
                            Are you sure you want to {isPromote ? 'promote' : 'remove'} this user?
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className='flex items-center gap-3 mt-6'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='flex-1 py-3 font-semibold text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all active:scale-95'
                        >
                            Cancel
                        </button>
                        <button
                            type='button'
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-[1.5] py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                loading 
                                    ? 'bg-slate-400 cursor-not-allowed' 
                                    : isPromote 
                                        ? 'bg-green-500 hover:bg-green-600 shadow-green-200' 
                                        : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                            }`}
                        >
                            {loading ? (
                                <><FiLoader className='animate-spin' /> Processing...</>
                            ) : (
                                isPromote ? 'Confirm Promotion' : 'Confirm Removal'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AdminActionModal
