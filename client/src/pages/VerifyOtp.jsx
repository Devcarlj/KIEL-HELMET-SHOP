import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios.js';
import SummaryApi from '../common/SummaryApi.js';
import AxiosToastError from '../utils/AxiosToastError.js';
import logo from '../assets/KielHelmetShop.png';

const VerifyOtp = () => {

    const [resendLoading, setResendLoading] = useState(false);
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").slice(0, 6); // Get first 6 chars

        // Check if the pasted content is actually numbers
        if (!/^\d+$/.test(pasteData)) return;

        const newOtp = [...otp];
        const pasteArray = pasteData.split("");

        pasteArray.forEach((char, index) => {
            if (index < 6) {
                newOtp[index] = char;
            }
        });

        setOtp(newOtp);

        // Automatically focus the last filled input or the 6th box
        const lastIndex = Math.min(pasteArray.length - 1, 5);
        inputRefs.current[lastIndex].focus();
    };

    const [timer, setTimer] = useState(60); // 60 second countdown

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digits
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    // Get the email from the previous page state
    const email = location?.state?.email || "";

    // Security: If no email is present, send them back to forgot-password
    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return; // Only allow numbers

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take the last character
        setOtp(newOtp);

        // Move to next input automatically
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join("");

        if (fullOtp.length < 6) {
            toast.error("Please enter the full 6-digit code");
            return;
        }

        setLoading(true); // Start loading spinner
        try {
            const response = await Axios({
                ...SummaryApi.verify_otp,
                data: {
                    otp: fullOtp,
                    email: email
                }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                // Send them to the final reset password page
                navigate("/reset-password", { state: { email, otp: fullOtp } });
            }

            if (response.data.error) {
                toast.error(response.data.message);
            }
        } catch (error) {
            // NEW: Handle the Rate Limiter (429) from the backend
            if (error.response && error.response.status === 429) {
                toast.error("Too many attempts. Please wait 15 minutes.");
            } else {
                AxiosToastError(error);
            }
        } finally {
            setLoading(false); // Stop loading regardless of result
        }
    };

    const handleResend = async () => {
        if (timer > 0 || resendLoading) return;

        setResendLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.forgotPassword, // Reusing your existing logic
                data: { email }
            });

            if (response.data.success) {
                toast.success("New OTP sent successfully!");
                setTimer(60); // Restart the 1-minute wait
                setOtp(["", "", "", "", "", ""]); // Clear boxes for new code
                inputRefs.current[0].focus(); // Focus first box
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setResendLoading(false);
        }
    };


    return (
        <section className='min-h-[calc(100vh-100px)] flex items-center justify-center bg-brand-cream py-10 px-4'>
            <div className='bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl border border-brand-cream-dark overflow-hidden'>

                <div className='bg-brand-cream-dark/30 border-b border-brand-cream-dark p-6 sm:p-8 flex flex-col items-center'>
                    <img src={logo} alt='Kiel Helmet Shop Logo' className='h-16 w-auto mb-3 drop-shadow-sm' />
                    <h1 className='text-3xl font-black text-brand-primary tracking-tight'>Verify OTP</h1>
                    <p className='text-brand-text/70 text-sm mt-2 text-center font-medium'>
                        Enter the 6-digit code sent to <br />
                        <span className='font-black text-brand-primary underline decoration-brand-secondary/30'>{email}</span>
                    </p>
                </div>

                <div className='p-6 sm:p-8 bg-white'>
                    <form className='grid gap-8' onSubmit={handleSubmit}>

                        <div className='flex items-center justify-between gap-1 sm:gap-2 px-1 sm:px-2'>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className='w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black bg-brand-cream/10 border-2 border-brand-cream-dark rounded-xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-brand-primary'
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.join("").length < 6}
                            className={`w-full py-4 rounded-xl font-black text-lg text-white transition-all shadow-lg hover:shadow-brand-primary/20 
                        ${loading || otp.join("").length < 6 ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-brand-primary hover:bg-brand-primary-dark active:scale-[0.98] cursor-pointer"}`}
                        >
                            {loading ? "VERIFYING..." : "VERIFY CODE"}
                        </button>
                    </form>

                    <div className='mt-8 text-center text-sm text-brand-text/60 font-medium'>
                        Didn't receive the code?
                        <button
                            type="button" // Important: prevents form submission
                            onClick={handleResend}
                            disabled={timer > 0 || resendLoading}
                            className={`ml-2 font-black transition-all ${timer > 0 || resendLoading
                                ? "text-slate-400 cursor-not-allowed"
                                : "text-brand-secondary hover:text-brand-primary cursor-pointer underline decoration-brand-secondary/30"
                                }`}
                        >
                            {resendLoading ? "Sending..." : timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VerifyOtp;