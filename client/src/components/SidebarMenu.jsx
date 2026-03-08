import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import logo from '../assets/KielHelmetShop.png'
import UserMenu from './UserMenu'
import { FaRegUserCircle } from "react-icons/fa"

const SidebarMenu = ({ isOpen, onClose }) => {
    const user = useSelector(state => state.user)
    const navigate = useNavigate()

    // Prevent body scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-full max-w-[280px] bg-brand-cream shadow-2xl z-[70] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className='flex items-center justify-between px-5 py-4 border-b border-brand-cream-dark bg-brand-primary text-brand-cream'>
                    <Link to="/" onClick={onClose} className='flex items-center gap-3'>
                        <img
                            src={logo}
                            alt='logo'
                            className='h-7 w-auto'
                        />
                    </Link>
                    <button
                        onClick={onClose}
                        className='w-9 h-9 rounded-xl bg-brand-primary-dark hover:bg-brand-primary flex items-center justify-center transition-colors active:scale-90'
                    >
                        <svg className='w-5 h-5 text-brand-cream' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto px-2 py-4'>
                    {user?._id ? (
                        <UserMenu close={onClose} isSidebarMenu={true} />
                    ) : (
                        <div className='flex flex-col items-center justify-center py-10 px-4 text-center'>
                            <div className='w-16 h-16 bg-brand-cream-dark rounded-full flex items-center justify-center mb-4'>
                                <FaRegUserCircle className='text-3xl text-brand-primary/60' />
                            </div>
                            <h3 className='font-bold text-brand-primary mb-2'>Welcome to Kiel Helmet Shop</h3>
                            <p className='text-xs text-brand-text/70 mb-6'>Login to manage your orders, profile and more.</p>
                            <button
                                onClick={() => { onClose(); navigate('/login') }}
                                className='w-full py-2.5 bg-brand-primary text-brand-cream rounded-lg font-bold text-sm shadow-md'
                            >
                                Login / Register
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer or Version Info */}
                <div className='p-4 border-t border-slate-50'>
                    <p className='text-[10px] text-center text-slate-400'>Kiel Helmet Shop v1.0.0</p>
                </div>
            </div>
        </>
    )
}

export default SidebarMenu
