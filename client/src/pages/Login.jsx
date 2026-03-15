import React, { useState } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios.js';
import SummaryApi from '../common/SummaryApi.js';
import AxiosToastError from '../utils/AxiosToastError.js';
import logo from '../assets/KielHelmetShop.png';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice'
import fetchCartItems from '../utils/fetchCartItems.js';
import { setCart } from '../store/cartSlice';
const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const validValue = Object.values(data).every(el => el);

    const handleSubmit = async (e) => {
        e.preventDefault();

        //  Start loading state immediately
        setLoading(true);

        try {

            const response = await Axios({
                ...SummaryApi.login,
                data: data
            });

            if (response.data.success) {
                // 1. Save tokens
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);

                // 2. NEW: Call the "Get User Details" API immediately
                // Use the same function your App.jsx uses!
                try {
                    const userResponse = await Axios({
                        ...SummaryApi.userDetails // Or whatever your profile API is called
                    });

                    if (userResponse.data.success) {
                        // 3. NOW update Redux with the actual user info
                        dispatch(setUserDetails(userResponse.data.data));

                        // 4. Fetch Cart Items immediately on login
                        const cartData = await fetchCartItems();
                        if (cartData?.success) {
                            // 5. Check for Guest Items in localStorage to merge
                            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                            const guestItems = localCart.filter(item => String(item._id).startsWith('guest_'));

                            if (guestItems.length > 0) {
                                // Merge each guest item into the DB
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
                                // Re-fetch the final merged cart from DB
                                const finalCartData = await fetchCartItems();
                                if (finalCartData?.success) {
                                    dispatch(setCart(finalCartData.data));
                                }
                            } else {
                                // Just set the DB cart
                                dispatch(setCart(cartData.data));
                            }
                        }
                    }
                } catch (err) {
                    console.log("Login worked, but failed to fetch profile", err);
                }

                toast.success(response.data.message);
                setData({ email: "", password: "" });
                navigate("/");
            }

            if (response.data.error) {
                toast.error(response.data.message);
            }
        } catch (error) {
            // Handle the "Too Many Attempts" (429) error specifically
            if (error.response && error.response.status === 429) {
                toast.error("Too many login attempts. Please wait 15 minutes.");
            } else {
                AxiosToastError(error);
            }
        } finally {
            //  This runs NO MATTER WHAT (success or error) 
            // to ensure the button is clickable again
            setLoading(false);
        }
    };
    return (
        <section className='min-h-[calc(100vh-100px)] flex items-center justify-center bg-brand-cream py-10 px-4'>
            <div className='bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl border border-brand-cream-dark overflow-hidden'>

                {/* BRAND HEADER */}
                <div className='bg-brand-cream-dark/30 border-b border-brand-cream-dark p-8 flex flex-col items-center'>
                    <img src={logo} alt='Kiel Helmet Shop Logo' className='h-20 w-auto mb-2 drop-shadow-sm' />
                    <h1 className='text-3xl font-black text-brand-primary tracking-tight'>Welcome Back</h1>
                    <p className='text-brand-text/70 text-sm mt-2 text-center font-medium'>Log in to access your Kiel Helmet Shop account.</p>
                </div>

                {/* FORM SECTION */}
                <div className='p-8 bg-white'>
                    {location.state?.message && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-xl shadow-sm" role="alert">
                            <p className="font-bold">{location.state.message}</p>
                        </div>
                    )}
                    {new URLSearchParams(location.search).get('verified') === 'true' && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-xl shadow-sm" role="alert">
                            <p className="font-bold">Your email has been successfully verified! You can now log in.</p>
                        </div>
                    )}
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

                        {/* PASSWORD */}
                        <div className='grid gap-2'>
                            <div className='flex items-center justify-between ml-1'>
                                <label className='text-sm font-bold text-brand-text' htmlFor="password">Password</label>
                                <Link to="/forgot-password" size="sm" className='text-xs text-brand-secondary hover:text-brand-primary transition-colors font-bold'>
                                    Forgot password?
                                </Link>
                            </div>
                            <div className='relative flex items-center'>
                                <input
                                    type={showPassword ? "text" : "password"} id='password' name='password' value={data.password} onChange={handleChange}
                                    className='w-full p-4 bg-brand-cream/10 border-2 border-brand-cream-dark rounded-xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-brand-text placeholder:text-slate-400'
                                    placeholder='••••••••'
                                />
                                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-4 text-brand-text/40 hover:text-brand-primary transition-colors'>
                                    {showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit" disabled={!validValue || loading}
                            className={`w-full py-4 mt-2 rounded-xl font-black text-lg text-white transition-all shadow-lg hover:shadow-brand-primary/20
                                ${(validValue && !loading) ? "bg-brand-primary hover:bg-brand-primary-dark active:scale-[0.98] cursor-pointer" : "bg-slate-300 cursor-not-allowed shadow-none"}`}
                        >
                            {loading ? "Logging in..." : "LOG IN"}
                        </button>
                    </form>

                    {/* REGISTER REDIRECT */}
                    <div className='mt-8 text-center text-sm text-brand-text/60 font-medium'>
                        Don't have an account? <Link to="/register" className='text-brand-secondary font-black hover:text-brand-primary transition-colors ml-1'>Sign up</Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;