import React from 'react'
import { FaFacebook } from "react-icons/fa";
import { Link } from 'react-router-dom';
import logo from '../assets/KielHelmetShop2.png'

const Footer = () => {
    return (
        <footer className='bg-brand-primary text-brand-cream pt-12 pb-20 md:pb-10 border-t-4 border-brand-secondary'>
            <div className='w-full px-4 md:px-10 lg:px-16'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10'>
                    
                    {/* Brand Section */}
                    <div className='flex flex-col gap-4'>
                        <Link to="/" className='inline-block'>
                            <img src={logo} alt="Kiel Helmet Shop" loading="lazy" className='h-16 w-auto brightness-110' />
                        </Link>
                        <p className='text-sm leading-relaxed opacity-80'>
                            Your ultimate destination for premium quality helmets and riding gear. Gear up for your next adventure with safety and style.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className='text-lg font-bold mb-6 text-brand-secondary'>Shop Online</h3>
                        <ul className='flex flex-col gap-3 text-sm'>
                            <li><Link to="/" className='hover:text-brand-secondary transition-colors'>Home</Link></li>
                            <li><Link to="/search" className='hover:text-brand-secondary transition-colors'>Product Search</Link></li>
                            <li><Link to="/category/67d16f86c1be272c72688005" className='hover:text-brand-secondary transition-colors'>All Helmets</Link></li>
                            <li><Link to="/search" className='hover:text-brand-secondary transition-colors'>New Arrivals</Link></li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div>
                        <h3 className='text-lg font-bold mb-6 text-brand-secondary'>My Account</h3>
                        <ul className='flex flex-col gap-3 text-sm'>
                            <li><Link to="/dashboard/profile" className='hover:text-brand-secondary transition-colors'>Profile</Link></li>
                            <li><Link to="/dashboard/my-orders" className='hover:text-brand-secondary transition-colors'>My Orders</Link></li>
                            <li><Link to="/dashboard/address" className='hover:text-brand-secondary transition-colors'>Saved Addresses</Link></li>
                        </ul>
                    </div>

                    {/* Social & Contact */}
                    <div className='flex flex-col items-start'>
                        <h3 className='text-lg font-bold mb-6 text-brand-secondary'>Newsletter</h3>
                        <p className='text-xs mb-4 opacity-80 uppercase tracking-widest'>Stay Updated</p>
                        <div className='flex items-center gap-4 group'>
                             <a 
                                href="https://www.facebook.com/people/KIEL-Helmet-SHOP/100092575211604/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='flex items-center gap-3 bg-brand-secondary px-4 py-2 rounded-full font-bold hover:bg-brand-secondary-dark transition-all transform hover:-translate-y-1 active:scale-95'
                            >
                                <FaFacebook className='text-xl' />
                                <span>Join our Community</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className='pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium opacity-60'>
                    <div className='text-center md:text-left uppercase tracking-tighter'>
                        © {new Date().getFullYear()} KIEL HELMET SHOP. All rights reserved. Built for riders, by riders.
                    </div>
                    <div className='flex items-center gap-6'>
                        <div className='hidden md:flex gap-6 uppercase tracking-wider'>
                            <Link to="/privacy-policy" className='hover:text-brand-secondary transition-colors'>Privacy Policy</Link>
                            <Link to="/terms-of-service" className='hover:text-brand-secondary transition-colors'>Terms of Use</Link>
                        </div>
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className='bg-brand-secondary/20 hover:bg-brand-secondary border border-brand-secondary/30 text-brand-cream px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95'
                        >
                            Back to Top ↑
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
