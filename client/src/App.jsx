import { Outlet } from 'react-router-dom'

import './App.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserData.js';
import fetchCartItems from './utils/fetchCartItems.js';
import { setUserDetails } from './store/userSlice.js'
import { setCart } from './store/cartSlice.js'
import { useDispatch } from 'react-redux';

import ScrollToTop from './components/ScrollToTop.jsx'

function App() {
    console.log('App component rendering');
    const dispatch = useDispatch()
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const fetchUser = async () => {
            const userData = await fetchUserDetails();
            if (userData?.success) {
                dispatch(setUserDetails(userData.data));
            }
        };

        const fetchCart = async () => {
            const cartData = await fetchCartItems();
            if (cartData?.success) {
                dispatch(setCart(cartData.data));
            }
        };

        fetchUser();
        fetchCart();
    }, [dispatch]);


    return (
        <>
            <ScrollToTop />
            <Header />
            <main className='min-h-[78vh]'>
                <Outlet />
            </main>
            <Footer />
            <Toaster />
        </>

    )
}

export default App
