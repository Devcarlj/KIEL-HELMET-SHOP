import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios.js';
import SummaryApi from '../common/SummaryApi.js';
import AxiosToastError from '../utils/AxiosToastError.js';
import logo from '../assets/KielHelmetShop.png';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: "",
    });
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const validValue = validateEmail(data.email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await Axios({
                ...SummaryApi.forgotPassword, // Ensure this exists in your summaryApi.js
                data: data
            });

            if (response.data.success) {
                toast.success(response.data.message);
                // Redirect user to the OTP verification page
                navigate("/verify-otp", { state: { email: data.email } });
            }

            if (response.data.error) {
                toast.error(response.data.message);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='min-h-[calc(100vh-100px)] flex items-center justify-center bg-brand-cream py-10 px-4'>
            <div className='bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl border border-brand-cream-dark overflow-hidden'>

                {/* BRAND HEADER */}
                <div className='bg-brand-cream-dark/30 border-b border-brand-cream-dark p-8 flex flex-col items-center'>
                    <img src={logo} alt='Kiel Helmet Shop Logo' className='h-16 w-auto mb-3 drop-shadow-sm' />
                    <h1 className='text-3xl font-black text-brand-primary tracking-tight'>Reset Password</h1>
                    <p className='text-brand-text/70 text-sm mt-2 text-center font-medium'>Enter your email and we'll send you an OTP to reset your password.</p>
                </div>

                {/* FORM SECTION */}
                <div className='p-8 bg-white'>
                    <form className='grid gap-6' onSubmit={handleSubmit}>

                        {/* EMAIL */}
                        <div className='grid gap-2'>
                            <label className='text-sm font-bold text-brand-text ml-1' htmlFor="email">Email Address</label>
                            <input
                                type="email" id='email' name='email' value={data.email} onChange={handleChange} autoFocus
                                className='p-4 bg-brand-cream/10 border-2 border-brand-cream-dark rounded-xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-brand-text placeholder:text-slate-400'
                                placeholder='john@example.com'
                            />
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit" disabled={!validValue || loading}
                            className={`w-full py-4 mt-2 rounded-xl font-black text-lg text-white transition-all shadow-lg hover:shadow-brand-primary/20 flex items-center justify-center
                                ${validValue && !loading ? "bg-brand-primary hover:bg-brand-primary-dark active:scale-[0.98] cursor-pointer" : "bg-slate-300 cursor-not-allowed shadow-none"}`}
                        >
                            {loading ? "SENDING OTP..." : "SEND RESET LINK"}
                        </button>
                    </form>

                    {/* BACK TO LOGIN */}
                    <div className='mt-8 text-center text-sm text-brand-text/60 font-medium'>
                        Remember your password? <Link to="/login" className='text-brand-secondary font-black hover:text-brand-primary transition-colors ml-1'>Back to Login</Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForgotPassword;