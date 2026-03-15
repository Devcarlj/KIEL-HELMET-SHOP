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

function App() {
    const dispatch = useDispatch()
    
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            dispatch(setLoading(false)) // 👈 no token = no user, stop loading
            return;
        }

        const fetchUser = async () => {
            dispatch(setLoading(true)) // 👈 start loading
            try {
                const userData = await fetchUserDetails();
                if (userData?.success) {
                    dispatch(setUserDetails(userData.data));
                }
            } catch (error) {
                console.error(error)
            } finally {
                dispatch(setLoading(false)) // 👈 always stop loading when done
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
            <main className='min-h-screen'>
                <Outlet />
            </main>
            <Footer />
            <Toaster />
        </>
    )
}

export default App