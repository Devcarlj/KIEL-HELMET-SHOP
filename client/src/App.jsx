import { Outlet } from 'react-router-dom'

import './App.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserData.js';
import fetchCartItems from './utils/fetchCartItems.js';
import { setUserDetails, setLoading } from './store/userSlice.js' // 👈 import setLoading
import { setCart } from './store/cartSlice.js'
import { useDispatch } from 'react-redux';

import ScrollToTop from './components/ScrollToTop.jsx'
import Chatbot from './components/Chatbot.jsx'

import useSWR from 'swr'
import SummaryApi from './common/SummaryApi.js'

function App() {
    const dispatch = useDispatch()
    const token = localStorage.getItem('accessToken');

    // SWR hook for user details
    const { data: userData, isLoading: userLoading } = useSWR(
        token ? SummaryApi.userDetails : null,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false
        }
    );

    // SWR hook for cart items
    const { data: cartData } = useSWR(
        token ? SummaryApi.getCartItems : null,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false
        }
    );

    // Update Redux state when SWR data changes
    useEffect(() => {
        if (!token) {
            dispatch(setLoading(false));
            return;
        }

        if (userData?.success) {
            dispatch(setUserDetails(userData.data));
        }
        
        dispatch(setLoading(userLoading));
    }, [userData, userLoading, token, dispatch]);

    useEffect(() => {
        if (cartData?.success) {
            dispatch(setCart(cartData.data));
        }
    }, [cartData, dispatch]);


    return (
        <>
            <ScrollToTop />
            <Header />
            <main className='min-h-screen'>
                <Outlet />
            </main>
            <Footer />
            <Toaster />
            <Chatbot />
        </>
    )
}

export default App