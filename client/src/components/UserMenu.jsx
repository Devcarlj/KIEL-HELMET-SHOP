import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../store/userSlice'
import { clearCart } from '../store/cartSlice'
import { HiOutlineExternalLink, HiOutlineHome } from "react-icons/hi";
import { FaRegUserCircle } from "react-icons/fa";
import isAdmin from '../utils/isAdmin'
import isSuperAdmin from '../utils/isSuperAdmin'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import defaultUserAvatar from '../assets/default_user_profiles.png'

const UserMenu = ({ close, isSidebarMenu = false }) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [unseenOrders, setUnseenOrders] = React.useState(0)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCart())
    localStorage.clear()
    // Only call close if it was passed as a function
    if (typeof close === 'function') close()
    navigate("/")
  }

  const handleLinkClick = () => {
    // This ensures the desktop menu closes when a link is clicked
    if (typeof close === 'function') close()
  }

  const getLinkClass = (path) => {
    const isActive = isSidebarMenu && location.pathname === path;
    const baseClass = "transition-all flex items-center justify-between group text-sm";

    if (isActive) {
      return `${baseClass} px-3 py-2.5 rounded-lg bg-brand-secondary/10 text-brand-secondary font-bold shadow-sm`;
    }

    if (isSidebarMenu) {
      return `${baseClass} px-3 py-2.5 rounded-lg hover:bg-brand-secondary/5 hover:text-brand-secondary text-brand-text`;
    }

    // Default / Old desktop style
    return `${baseClass} px-2 py-2 rounded-md hover:bg-brand-secondary/5 hover:text-brand-secondary text-brand-text`;
  }

  const fetchUnseenCount = async () => {
    try {
      if (isAdmin(user.role)) {
        const response = await Axios({
          ...SummaryApi.getUnseenOrderCount
        })
        if (response.data.success) {
          setUnseenOrders(response.data.data.count)
        }
      }
    } catch (error) {
      console.log("Error fetching unseen count", error)
    }
  }

  React.useEffect(() => {
    if (isAdmin(user.role)) {
      fetchUnseenCount()
      // Poll every 30 seconds for new orders
      const interval = setInterval(fetchUnseenCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user.role, location.pathname]) // Refresh when role changes or when navigating (e.g. back from details page)

  return (
    <div className={`flex flex-col text-brand-text w-full ${isSidebarMenu ? 'gap-1' : ''}`}>
      {/* User Header Section with Avatar */}
      <div className='px-2 pb-3 pt-1 flex items-center gap-3'>
        <div onClick={() => {
          if (typeof close === 'function') close();
          navigate("/dashboard/profile");
        }}
          className='w-10 h-10 shrink-0 rounded-full overflow-hidden bg-brand-cream-dark flex items-center justify-center border border-brand-cream-dark cursor-pointer'>
          {user?.avatar ? (
            <img src={user.avatar} alt="User" loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <img src={defaultUserAvatar} alt="Default User" loading="lazy" className="w-full h-full object-cover" />
          )}
        </div>

        <div className='flex flex-col min-w-0'>
          <p className='font-bold text-brand-primary leading-tight truncate flex items-center gap-1.5'>
            {user.name || "User"}
            {isSuperAdmin(user.role) && (
              <span className='text-xs font-semibold text-white bg-purple-600 px-1.5 py-0.5 rounded-full leading-none'>
                SuperAdmin
              </span>
            )}
            {isAdmin(user.role) && !isSuperAdmin(user.role) && (
              <span className='text-xs font-semibold text-brand-cream bg-brand-primary px-1.5 py-0.5 rounded-full leading-none'>
                Admin
              </span>
            )}
          </p>
          <p className='text-xs text-gray-400 truncate'>
            {user.email}
          </p>
        </div>
      </div>

      <hr className='border-brand-cream-dark mx-2 mb-1' />

      {/* Navigation Links */}
      <nav className={`flex flex-col ${isSidebarMenu ? 'gap-0.5 py-1' : 'py-2'}`}>
        {isSidebarMenu && (
          <Link
            to="/"
            onClick={handleLinkClick}
            className={getLinkClass("/")}
          >
            Home
            <HiOutlineHome className={`transition-opacity ${location.pathname === '/' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
          </Link>
        )}
        {isAdmin(user.role) && (
          <Link
            to="/dashboard/category"
            onClick={handleLinkClick}
            className={getLinkClass("/dashboard/category")}
          >
            Category
            <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/category' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            to="/dashboard/sub-category"
            onClick={handleLinkClick}
            className={getLinkClass("/dashboard/sub-category")}
          >
            Sub Category
            <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/sub-category' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            to="/dashboard/products"
            onClick={handleLinkClick}
            className={getLinkClass("/dashboard/products")}
          >
            Products
            <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/products' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            to="/dashboard/upload-product"
            onClick={handleLinkClick}
            className={getLinkClass("/dashboard/upload-product")}
          >
            Upload Product
            <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/upload-product' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            to="/dashboard/all-orders"
            onClick={handleLinkClick}
            className={getLinkClass("/dashboard/all-orders")}
          >
            <div className='flex items-center gap-2'>
              All Orders
              {unseenOrders > 0 && (
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse'>
                  {unseenOrders > 9 ? '9+' : unseenOrders}
                </span>
              )}
            </div>
            <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/all-orders' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
          </Link>
        )}

        {isSuperAdmin(user.role) && (
          <Link
            to="/dashboard/superadmin-settings"
            onClick={handleLinkClick}
            className={getLinkClass("/dashboard/superadmin-settings")}
          >
            Settings
            <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/superadmin-settings' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
          </Link>
        )}

        <Link
          to="/dashboard/profile"
          onClick={handleLinkClick}
          className={getLinkClass("/dashboard/profile")}
        >
          My Profile
          <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/profile' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </Link>

        <Link
          to="/dashboard/my-orders"
          onClick={handleLinkClick}
          className={getLinkClass("/dashboard/my-orders")}
        >
          Order History
          <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/my-orders' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </Link>

        <Link
          to="/dashboard/address"
          onClick={handleLinkClick}
          className={getLinkClass("/dashboard/address")}
        >
          Save Address
          <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/address' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </Link>
        <Link
          to="/dashboard/favorites"
          onClick={handleLinkClick}
          className={getLinkClass("/dashboard/favorites")}
        >
          My Favorites
          <HiOutlineExternalLink className={`transition-opacity ${isSidebarMenu && location.pathname === '/dashboard/favorites' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </Link>
      </nav>

      <hr className='border-gray-100' />

      {/* Footer / Logout */}
      <button
        onClick={handleLogout}
        className='mt-2 px-2 py-2 text-sm text-left text-red-500 hover:bg-red-50 rounded-md transition-all font-medium'
      >
        Log out
      </button>
    </div>
  )
}

export default UserMenu