import React from 'react'
import { FaFacebook } from "react-icons/fa";
import { BsInstagram } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa6";

const Footer = () => {
    return (
        <footer className='border-t bg-transparent'>
            {/* container mx-auto keeps everything centered with a max-width */}
            <div className='container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-between gap-6'>

                {/* Brand/Copyright Section */}
                <div className="text-center lg:text-left">
                    <h2 className="text-xl font-bold text-brand-primary mb-1">Kiel Helmet Shop</h2>
                    <p className='text-sm text-gray-500'>
                        © {new Date().getFullYear()} Kiel Helmet Shop. All rights reserved.
                    </p>
                </div>

                {/* Social Media Section */}
                <div className='flex items-center gap-6 text-2xl text-brand-primary'>
                    <a href="#" className='transition-all duration-300 hover:text-facebook hover:-translate-y-1'>
                        <FaFacebook />
                    </a>
                    <a href="#" className='transition-all duration-300 hover:text-instagram hover:-translate-y-1'>
                        <BsInstagram />

                    </a>
                    <a href="#" className='transition-all duration-300 hover:text-linkedin hover:-translate-y-1'>
                        <FaLinkedin />
                    </a>
                </div>

                {/* Optional: Simple Links */}
                <div className="flex gap-4 text-sm font-medium text-brand-text">
                    <a href="#" className="hover:text-brand-secondary transition-colors">Privacy</a>
                    <a href="#" className="hover:text-brand-secondary transition-colors">Terms</a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
