import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/KielHelmetShop.png';
import { MdOutlineMail } from "react-icons/md";

const CheckEmail = () => {
    const location = useLocation();
    const email = location.state?.email || 'your email';

    return (
        <section className='min-h-[calc(100vh-100px)] flex items-center justify-center bg-brand-cream py-10 px-4'>
            <div className='bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl border border-brand-cream-dark overflow-hidden text-center p-8'>
                <img src={logo} alt='Kiel Helmet Shop Logo' className='h-20 w-auto mb-6 mx-auto drop-shadow-sm' />
                <div className="bg-brand-cream/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <MdOutlineMail className="text-brand-primary w-12 h-12" />
                </div>
                <h1 className='text-3xl font-black text-brand-primary tracking-tight mb-2'>Check Your Email</h1>
                <p className='text-brand-text/70 mb-6 font-medium'>
                    We've sent a verification link to <span className="font-bold text-brand-secondary">{email}</span>.
                    Please click the link in the email to automatically verify your account and log in.
                </p>

                <div className='mt-8 text-sm text-brand-text/60 font-medium bg-brand-cream/20 py-4 px-6 rounded-xl border border-brand-cream-dark'>
                    <p>Didn't receive an email? Check your spam folder.</p>
                </div>

                <div className="mt-8">
                    <Link to="/login" className='text-brand-secondary font-black hover:text-brand-primary transition-colors'>Return to Login</Link>
                </div>
            </div>
        </section>
    );
};

export default CheckEmail;
