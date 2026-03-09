import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios.js';
import SummaryApi from '../common/SummaryApi.js';
import toast from 'react-hot-toast';
import logo from '../assets/KielHelmetShop.png';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice.js';
import { setCart } from '../store/cartSlice.js';
import fetchCartItems from '../utils/fetchCartItems.js';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const hasCalled = useRef(false);

    useEffect(() => {
        if (!code) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verifyEmail = async () => {
            if (hasCalled.current) return;
            hasCalled.current = true;
            try {
                const response = await Axios({
                    ...SummaryApi.verifyEmail,
                    data: { code }
                });

                if (response.data.success) {

                    // Automatically log in the user
                    localStorage.setItem('accessToken', response.data.data.accessToken);
                    localStorage.setItem('refreshToken', response.data.data.refreshToken);

                    try {
                        const userResponse = await Axios({
                            ...SummaryApi.userDetails
                        });

                        if (userResponse.data.success) {
                            dispatch(setUserDetails(userResponse.data.data));

                            const cartData = await fetchCartItems();
                            if (cartData?.success) {
                                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                                const guestItems = localCart.filter(item => String(item._id).startsWith('guest_'));

                                if (guestItems.length > 0) {
                                    for (const item of guestItems) {
                                        try {
                                            await Axios({
                                                ...SummaryApi.addToCart,
                                                data: { productId: item.productId._id }
                                            });
                                        } catch (err) {
                                            console.error("Failed to merge guest item:", item.productId._id, err);
                                        }
                                    }
                                    const finalCartData = await fetchCartItems();
                                    if (finalCartData?.success) {
                                        dispatch(setCart(finalCartData.data));
                                    }
                                } else {
                                    dispatch(setCart(cartData.data));
                                }
                            }
                        }
                    } catch (err) {
                        console.log("VerifyAuth login profile fetch failed", err);
                    }

                    setStatus('success');
                    setMessage('Your email has been verified! Logging you in...');
                    toast.success('Your email has been verified!');
                    setTimeout(() => {
                        navigate('/');
                    }, 2500);
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Verification failed.');
                    toast.error(response.data.message || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                const errMsg = error?.response?.data?.message || 'Something went wrong during verification.';
                setMessage(errMsg);
                toast.error(errMsg);
            }
        };

        verifyEmail();
    }, [code, navigate, dispatch]);

    return (
        <section className='min-h-[calc(100vh-100px)] flex items-center justify-center bg-brand-cream py-10 px-4'>
            <div className='bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl border border-brand-cream-dark overflow-hidden'>
                <div className='bg-brand-cream-dark/30 border-b border-brand-cream-dark p-8 flex flex-col items-center'>
                    <img src={logo} alt='Kiel Helmet Shop Logo' className='h-20 w-auto mb-2 drop-shadow-sm' />
                    <h1 className='text-3xl font-black text-brand-primary tracking-tight'>Email Verification</h1>
                </div>

                <div className='p-8 bg-white flex flex-col items-center justify-center text-center'>
                    {status === 'verifying' && (
                        <div>
                            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4'></div>
                            <p className='text-brand-text font-bold text-lg'>Verifying your email...</p>
                            <p className='text-brand-text/70 text-sm mt-2'>Please wait while we confirm your email address.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div>
                            <div className='text-green-500 mb-4'>
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <p className='text-brand-text font-bold text-xl mb-2'>{message}</p>
                            <p className='text-brand-text/70 text-sm mb-6'>You will be redirected to the login page shortly.</p>
                            <Link to="/login" className='w-full block py-4 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl font-black transition-all shadow-lg hover:shadow-brand-primary/20'>
                                GO TO LOGIN
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div>
                            <div className='text-red-500 mb-4'>
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <p className='text-brand-text font-bold text-xl mb-2'>Verification Failed</p>
                            <p className='text-brand-text/70 text-sm mb-6'>{message}</p>
                            <Link to="/login" className='w-full block py-4 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl font-black transition-all shadow-lg hover:shadow-brand-primary/20'>
                                RETURN TO LOGIN
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default VerifyEmail;
