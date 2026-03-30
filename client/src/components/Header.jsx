import React, { useState } from 'react'
import logo from '../assets/KielHelmetShop2.png'
import Search from './Search'
import { FaRegUserCircle } from "react-icons/fa";
import { GrCart } from "react-icons/gr";
import useMobile from '../hooks/useMobile.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaChevronDown } from "react-icons/fa";
import UserMenu from './UserMenu';
import defaultUserAvatar from '../assets/default_user_profiles.png'
import CartSideDrawer from './CartSideDrawer';
import SidebarMenu from './SidebarMenu';
import { selectCartItemCount, selectCartTotal } from '../store/cartSlice';
import { DisplayPrice } from '../utils/DisplayPrice';
import { HiMenu } from "react-icons/hi";

const Header = () => {

  const isMobile = useMobile()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user)

  const [openUserMenu, setOpenUserMenu] = useState(false)
  const [openCartDrawer, setOpenCartDrawer] = useState(false)
  const [openSidebar, setOpenSidebar] = useState(false)

  const cartItemCount = useSelector(selectCartItemCount)
  const cartTotal = useSelector(selectCartTotal)

  const handleAction = () => {
    if (!user?._id) {
      navigate("/login")
      return
    }

    if (isMobile) {
      // For mobile: Redirect to the profile page
      navigate("/dashboard/profile")
    } else {
      // For desktop: Toggle the dropdown
      setOpenUserMenu((prev) => !prev)
    }
  }

  const handleCartClick = (e) => {
    e.preventDefault()
    if (!user?._id) {
      navigate("/login")
      return
    }
    setOpenCartDrawer(true)
  }

  const isSearchPage = location.pathname === "/search"

  return (
    <>
      <header className='h-auto md:h-24 shadow-md sticky top-0 bg-brand-primary text-brand-cream z-50 py-2 md:py-0 flex items-center'>
        <div className='w-full px-4 md:px-10 lg:px-16'>
          <div className='flex items-center justify-between gap-4 w-full'>

            <div className='flex items-center gap-0 md:gap-2'> 
            {/* Hamburger Button (Mobile only) */}
            <div className='md:hidden'>
              <button
                onClick={() => setOpenSidebar(true)}
                className='p-1.5 text-2xl text-brand-cream hover:bg-brand-primary-dark rounded-lg transition-colors active:scale-95'
              >
                <HiMenu />
              </button>
            </div>

            {/* SECTION 1: LOGO */}
            <Link to={"/"} className='shrink-0'>
              <img
                src={logo}
                alt='logo'
                className='h-8 w-auto md:h-18 cursor-pointer'
              />
            </Link>
            </div>


            {/* SECTION 2: SEARCH (Desktop) */}
            <div className='hidden md:block w-full max-w-xl'>
              <Search />
            </div>

            {/* SECTION 3: USER ACTIONS */}
            <div className='flex items-center gap-3 md:gap-4 relative'>

              <button
                onClick={handleAction}
                className='flex items-center gap-2 text-brand-cream hover:text-brand-secondary transition-colors'
              >
                <div className='text-2xl md:text-3xl'>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <img src={defaultUserAvatar} alt="Default User" className="w-8 h-8 rounded-full object-cover" />
                  )}
                </div>

                <div className='hidden lg:flex items-center gap-1'>
                  <span className='font-medium'>{user?._id ? "Account" : "Login"}</span>
                  {user?._id && (
                    <FaChevronDown className={`text-xs transition-transform ${openUserMenu ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </button>

              {/* RENDER THE MENU COMPONENT (Desktop Only Dropdown) */}
              {openUserMenu && !isMobile && (
                <div className="absolute top-14 right-0 z-50 w-full min-w-52">
                  <div className="bg-brand-cream text-brand-text rounded-xl shadow-2xl border border-brand-cream-dark p-3 overflow-hidden">
                    <UserMenu close={() => setOpenUserMenu(false)} />
                  </div>
                </div>
              )}

              {/* CART BUTTON - Shows count & total dynamically */}
              <div className='sm:block'>
                <button
                  onClick={handleCartClick}
                  className='flex items-center gap-3 px-4 md:px-6 py-2 bg-brand-secondary hover:bg-brand-secondary-dark text-brand-cream rounded-lg font-bold transition-all duration-300 shadow-md group cursor-pointer'
                >
                  {/* Cart Icon with badge */}
                  <div className='relative animate-bounce'>
                    <GrCart className='text-xl md:text-2xl' />
                    <div className='bg-brand-cream text-brand-primary w-5 h-5 rounded-full flex items-center justify-center absolute -top-3 -right-3 border border-brand-cream-dark'>
                      <p className='text-[10px] font-bold'>{cartItemCount}</p>
                    </div>
                  </div>
                  {/* Cart Text with total */}
                  <div className='hidden md:flex flex-col items-start leading-tight'>
                    <span className='text-[10px] font-medium opacity-80'>My Cart</span>
                    <span className='text-sm font-black'>
                      {cartTotal > 0 ? DisplayPrice(cartTotal) : '₱0.00'}
                    </span>
                  </div>
                  <span className='md:hidden text-sm'>Cart</span>
                </button>
              </div>

            </div>
          </div>

          {/* BOTTOM ROW: SEARCH (Mobile) */}
          <div className='mt-3 md:hidden w-full pb-0'>
            <Search isMobile={true} />
          </div>
        </div>
      </header>

      {/* Cart Side Drawer */}
      <CartSideDrawer
        isOpen={openCartDrawer}
        onClose={() => setOpenCartDrawer(false)}
      />

      {/* Sidebar Menu (Mobile Left Slide) */}
      <SidebarMenu
        isOpen={openSidebar}
        onClose={() => setOpenSidebar(false)}
      />
    </>
  )
}

export default Header