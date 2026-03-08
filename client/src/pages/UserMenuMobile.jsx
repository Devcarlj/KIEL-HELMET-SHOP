import React from 'react'
import UserMenu from '../components/UserMenu.jsx'
import { IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

const UserMenuMobile = () => {
  const navigate = useNavigate();

  // Create a separate function for the "X" button
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <section className='bg-white h-screen w-full flex flex-col'>
      {/* 1. Header for Mobile Page */}
      <div className='flex items-center justify-between p-5 border-b bg-slate-50'>
        <h2 className='font-bold text-xl text-slate-800'>Account</h2>
        <button
          onClick={handleBack} // This stays as go back
          className='text-3xl text-slate-500 hover:text-black'
        >
          <IoClose />
        </button>
      </div>

      {/* 2. The Shared Component Container */}
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='max-w-md mx-auto'>
          {/* CHANGE: Do NOT pass navigate(-1) here. 
             If 'close' is null, the links in UserMenu will 
             simply navigate to the new page without going back.
           */}
          <UserMenu close={null} />
        </div>
      </div>

      <div className='p-8 text-center text-slate-300 text-sm'>
        Kiel Helmet Shop v1.0.0
      </div>
    </section>
  )
}

export default UserMenuMobile