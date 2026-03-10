import React, { useState } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom'; // Added Link for professional navigation
import toast from 'react-hot-toast';
import Axios from '../utils/Axios.js';
import SummaryApi from '../common/SummaryApi.js';
import AxiosToastError from '../utils/AxiosToastError.js';
import logo from '../assets/KielHelmetShop.png'; // Updated logo path

const Register = () => {

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })

    const [showPassword, SetShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [touched, setTouched] = useState({ email: false });

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleChange = (e) => {
        const { name, value } = e.target
        setData((preve) => ({ ...preve, [name]: value }))
    }

    const validValue = Object.values(data).every(el => el) && validateEmail(data.email) && (data.password === data.confirmPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }


        setLoading(true);

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data: data
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setData({ name: "", email: "", password: "", confirmPassword: "" });
                navigate("/check-email");
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
                    <h1 className='text-3xl font-black text-brand-primary tracking-tight'>Create Account</h1>
                    <p className='text-brand-text/70 text-sm mt-2 text-center font-medium'>Join Kiel Helmet Shop today for the best helmet deals.</p>
                </div>

                {/* FORM SECTION */}
                <div className='p-8 bg-white'>
                    <form className='grid gap-5' onSubmit={handleSubmit}>

                        {/* NAME */}
                        <div className='grid gap-1.5'>
                            <label className='text-sm font-bold text-brand-text ml-1' htmlFor="name">Full Name</label>
                            <input
                                type="text" id='name' name='name' value={data.name} onChange={handleChange} autoFocus
                                className='p-3.5 bg-brand-cream/10 border-2 border-brand-cream-dark rounded-xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-brand-text placeholder:text-slate-400'
                                placeholder='John Smith'
                            />
                        </div>

                        {/* EMAIL */}
                        <div className='grid gap-1.5'>
                            <label className='text-sm font-bold text-brand-text ml-1' htmlFor="email">Email Address</label>
                            <input
                                type="email" id='email' name='email' value={data.email} onChange={handleChange}
                                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                                className={`p-3.5 bg-brand-cream/10 border-2 rounded-xl outline-none focus:ring-4 transition-all text-brand-text placeholder:text-slate-400
                                    ${(touched.email && data.email && !validateEmail(data.email)) ? "border-red-500 focus:ring-red-100" : "border-brand-cream-dark focus:border-brand-primary focus:ring-brand-primary/10"}`}
                                placeholder='john@example.com'
                            />
                            {touched.email && data.email && !validateEmail(data.email) && (
                                <span className='text-red-500 text-xs font-bold ml-1'>Invalid email address</span>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div className='grid gap-1.5'>
                            <label className='text-sm font-bold text-brand-text ml-1' htmlFor="password">Password</label>
                            <div className='relative flex items-center'>
                                <input
                                    type={showPassword ? "text" : "password"} id='password' name='password' value={data.password} onChange={handleChange}
                                    className='w-full p-3.5 bg-brand-cream/10 border-2 border-brand-cream-dark rounded-xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-brand-text placeholder:text-slate-400'
                                    placeholder='••••••••'
                                />
                                <button type='button' onClick={() => SetShowPassword(!showPassword)} className='absolute right-4 text-brand-text/40 hover:text-brand-primary transition-colors'>
                                    {showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className='grid gap-1.5'>
                            <label className='text-sm font-bold text-brand-text ml-1' htmlFor="confirmPassword">Confirm Password</label>
                            <div className='relative flex items-center'>
                                <input
                                    type={showConfirmPassword ? "text" : "password"} id='confirmPassword' name='confirmPassword' value={data.confirmPassword} onChange={handleChange}
                                    className={`w-full p-3.5 bg-brand-cream/10 border-2 rounded-xl outline-none focus:ring-4 transition-all text-brand-text placeholder:text-slate-400
                                        ${(data.confirmPassword && data.password !== data.confirmPassword) ? "border-red-500 focus:ring-red-100" : "border-brand-cream-dark focus:border-brand-primary focus:ring-brand-primary/10"}`}
                                    placeholder='••••••••'
                                />
                                <button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute right-4 text-brand-text/40 hover:text-brand-primary transition-colors'>
                                    {showConfirmPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit" disabled={!validValue || loading}
                            className={`w-full py-4 mt-2 rounded-xl font-black text-lg text-white transition-all shadow-lg hover:shadow-brand-primary/20
                                ${validValue && !loading ? "bg-brand-primary hover:bg-brand-primary-dark active:scale-[0.98] cursor-pointer" : "bg-slate-300 cursor-not-allowed shadow-none"}`}
                        >
                            {loading ? "CREATING ACCOUNT..." : "REGISTER"}
                        </button>
                    </form>

                    {/* LOGIN REDIRECT */}
                    <div className='mt-8 text-center text-sm text-brand-text/60 font-medium'>
                        Already have an account? <Link to="/login" className='text-brand-secondary font-black hover:text-brand-primary transition-colors ml-1'>Log in</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Register