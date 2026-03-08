import React, { useState, useEffect } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios.js';
import SummaryApi from '../common/SummaryApi.js';
import AxiosToastError from '../utils/AxiosToastError.js';
import logo from '../assets/KielHelmetShop.png';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [data, setData] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get email and OTP from the VerifyOtp page state to ensure the reset is authorized
    const email = location?.state?.email;
    const otp = location?.state?.otp;

    useEffect(() => {
        if (!(email && otp)) {
            toast.error("Invalid session. Please start again.");
            navigate("/forgot-password");
        }
    }, [email, otp, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const validValue = data.newPassword && data.confirmPassword && (data.newPassword === data.confirmPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (data.newPassword !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.resetPassword, // Ensure this key exists in your summaryApi.js
                data: {
                    email: email,
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword
                }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                navigate("/login");
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

                <div className='bg-brand-cream-dark/30 border-b border-brand-cream-dark p-8 flex flex-col items-center'>
                    <img src={logo} alt='Kiel Helmet Shop Logo' className='h-16 w-auto mb-3 drop-shadow-sm' />
                    <h1 className='text-3xl font-black text-brand-primary tracking-tight'>Reset Password</h1>
                    <p className='text-brand-text/70 text-sm mt-2 text-center font-medium'>Enter your new password below to secure your account.</p>
                </div>

                <div className='p-8 bg-white'>
                    <form className='grid gap-6' onSubmit={handleSubmit}>

                        {/* NEW PASSWORD */}
                        <div className='grid gap-2'>
                            <label className='text-sm font-bold text-brand-text ml-1' htmlFor="newPassword">New Password</label>
                            <div className='relative flex items-center'>
                                <input
                                    type={showPassword ? "text" : "password"} id='newPassword' name='newPassword' value={data.newPassword} onChange={handleChange}
                                    className='w-full p-4 bg-brand-cream/10 border-2 border-brand-cream-dark rounded-xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-brand-text placeholder:text-slate-400'
                                    placeholder='••••••••'
                                />
                                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-4 text-brand-text/40 hover:text-brand-primary transition-colors'>
                                    {showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className='grid gap-2'>
                            <label className='text-sm font-bold text-brand-text ml-1' htmlFor="confirmPassword">Confirm New Password</label>
                            <div className='relative flex items-center'>
                                <input
                                    type={showConfirmPassword ? "text" : "password"} id='confirmPassword' name='confirmPassword' value={data.confirmPassword} onChange={handleChange}
                                    className={`w-full p-4 bg-brand-cream/10 border-2 rounded-xl outline-none focus:ring-4 transition-all text-brand-text placeholder:text-slate-400
                                        ${(data.confirmPassword && data.newPassword !== data.confirmPassword) ? "border-red-500 focus:ring-red-100" : "border-brand-cream-dark focus:border-brand-primary focus:ring-brand-primary/10"}`}
                                    placeholder='••••••••'
                                />
                                <button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute right-4 text-brand-text/40 hover:text-brand-primary transition-colors'>
                                    {showConfirmPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={!validValue || loading}
                            className={`w-full py-4 mt-2 rounded-xl font-black text-lg text-white transition-all shadow-lg hover:shadow-brand-primary/20
                                ${validValue && !loading ? "bg-brand-primary hover:bg-brand-primary-dark active:scale-[0.98] cursor-pointer" : "bg-slate-300 cursor-not-allowed shadow-none"}`}
                        >
                            {loading ? "UPDATING PASSWORD..." : "CHANGE PASSWORD"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ResetPassword;