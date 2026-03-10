import React from 'react'
import { Link } from 'react-router-dom';
import logo from '../assets/KielHelmetShop.png';

const CheckEmail = () => {
    return (
        <section className='min-h-[calc(100vh-100px)] flex items-center justify-center bg-brand-cream py-10 px-4'>
            <div className='bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl border border-brand-cream-dark overflow-hidden p-8 flex flex-col items-center text-center'>
                <img src={logo} alt='Kiel Helmet Shop Logo' className='h-16 w-auto mb-6 drop-shadow-sm' />
                <h1 className='text-3xl font-black text-brand-primary tracking-tight mb-4'>Check Your Email</h1>
                <p className='text-brand-text mb-8'>
                    We've sent a verification link to your email address. Please check your inbox (and spam folder) and click the link to verify your account.
                </p>
                <Link to="/login" className='w-full py-4 rounded-xl font-black text-lg text-white bg-brand-primary hover:bg-brand-primary-dark transition-all shadow-lg hover:shadow-brand-primary/20 block'>
                    Return to Login
                </Link>
            </div>
        </section>
    )
}

export default CheckEmail
