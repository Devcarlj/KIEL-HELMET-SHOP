import React from 'react'
import { useSelector } from 'react-redux'
import CardProduct from '../components/CardProduct'
import { Link } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa'

const FavoritePage = () => {
    const favorites = useSelector(state => state.user.favorites)

    return (
        <section className='bg-white min-h-screen px-3 py-4 md:p-6'>
            <div className='flex flex-col gap-2 mb-6 px-1 md:px-0'>
                <div className='text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-1'>
                    <Link to='/' className='hover:text-primary'>Home</Link>
                    <span>/</span>
                    <span className='text-slate-900'>My Favorites</span>
                </div>

                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-500'>
                        <FaHeart size={20} />
                    </div>
                    <h1 className='text-xl md:text-3xl font-black text-slate-900'>
                        My Favorites
                    </h1>
                </div>
                <p className='text-xs md:text-sm text-slate-500 mt-1'>
                    Products you've saved for later.
                </p>
            </div>

            {!favorites || favorites.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-center'>
                    <div className='w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6'>
                        <FaHeart size={40} className='text-slate-200' />
                    </div>
                    <h2 className='text-xl font-bold text-slate-800 mb-2'>Your wishlist is empty</h2>
                    <p className='text-slate-500 mb-8 max-w-sm'>
                        Looks like you hasn't added any products to your favorites yet.
                    </p>
                    <Link 
                        to='/' 
                        className='px-8 py-3 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all'
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6'>
                    {favorites.map((product) => (
                        <CardProduct key={product._id} data={product} isFavoritePage={true} />
                    ))}
                </div>
            )}
        </section>
    )
}

export default FavoritePage
