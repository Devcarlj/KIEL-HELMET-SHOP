import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios.js';
import SummaryApi from '../common/SummaryApi.js';
import AxiosToastError from '../utils/AxiosToastError.js';
import logo from '../assets/KielHelmetShop.png';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const hasCalled = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            setError("Invalid verification link.");
            return;
        }

        if (hasCalled.current) return;
        hasCalled.current = true;

        const verify = async () => {
            setLoading(true);
            try {
                const response = await Axios({
                    ...SummaryApi.verifyEmail, // Make sure this exists in SummaryApi!
                    data: { code },
                });

                if (response.data.success || response.data.sucess) { // handle typo 'sucess' in backend if there is one
                    // Redirect to login page with state
                    navigate('/login', { state: { message: "Your email has been verified. Please log in to continue." } });
                } else if (response.data.error) {
                    setError(response.data.message || "Failed to verify email");
                }
            } catch (error) {
                AxiosToastError(error);
                setError(error?.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <section className='min-h-[calc(100vh-100px)] flex items-center justify-center bg-brand-cream py-10 px-4'>
            <div className='bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl border border-brand-cream-dark overflow-hidden p-8 flex flex-col items-center text-center'>
                <img src={logo} alt='Kiel Helmet Shop Logo' className='h-16 w-auto mb-6 drop-shadow-sm' />
                <h1 className='text-3xl font-black text-brand-primary tracking-tight mb-4'>Email Verification</h1>

                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className='text-brand-text font-bold'>Verifying your email...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center">
                        <div className="text-red-500 mb-4 bg-red-100 p-4 rounded-full">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <p className='text-brand-text mb-6 font-medium'>{error}</p>
                        <button onClick={() => navigate('/login')} className='w-full py-3 rounded-xl font-bold text-white bg-brand-primary transition-all shadow-lg hover:shadow-brand-primary/20'>
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <p className='text-brand-text font-medium'>Verification completed.</p>
                )}
            </div>
        </section>
    )
}

export default VerifyEmail;
