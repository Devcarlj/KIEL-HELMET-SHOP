import React, { useRef } from 'react'
import useSWR from 'swr'
import CardProduct from './CardProduct'
import { Link } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'

const CategoryWiseProductDisplay = ({ id, name }) => {
    const containerRef = useRef()

    const { data: productsData, isLoading: loading } = useSWR(
        id ? { ...SummaryApi.getProductsByCategory, data: { id, limit: 12 } } : null
    )
    const data = productsData?.success ? productsData.data : []

    const handleNext = () => {
        containerRef.current.scrollLeft += containerRef.current.clientWidth * 0.8
    }
    const handlePrev = () => {
        containerRef.current.scrollLeft -= containerRef.current.clientWidth * 0.8
    }

    // Only render if there are products or it's loading
    if (!loading && data.length === 0) return null;

    return (
        <section className='w-full px-4 md:px-10 lg:px-16 mt-4 md:mt-16 group/section'>
            <div className='flex items-end justify-between mb-0 pb-2 border-b-2 border-slate-50'>
                <div className='relative'>
                    <h3 className='text-xl md:text-3xl font-black text-slate-800 tracking-tight'>
                        {name}
                    </h3>
                    <div className='absolute -bottom-[2px] left-0 w-2/3 h-[2px] bg-primary'></div>
                </div>
                <Link to={`/category/${id}`} className='text-[10px] md:text-xs font-black text-primary hover:text-orange-600 transition-all uppercase tracking-[0.2em] flex items-center gap-2 group/link bg-orange-50 px-4 py-2 rounded-full border border-orange-100 hover:bg-orange-100'>
                    See All
                    <span className='transform group-hover/link:translate-x-1 transition-transform'>→</span>
                </Link>
            </div>

            <div className='relative group'>
                <div
                    ref={containerRef}
                    className='flex items-stretch gap-4 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-4 px-1'
                >
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className='shrink-0 min-w-[160px] md:min-w-[220px] xl:min-w-[calc((100%-140px)/6)] max-w-[160px] md:max-w-[220px] xl:max-w-[calc((100%-140px)/6)]'>
                                <div className='w-full aspect-[1/1.6] bg-slate-100 animate-pulse rounded-[2.5rem] border border-slate-100' />
                            </div>
                        ))
                    ) : (
                        data.map((product) => (
                            <div key={product._id} className='shrink-0 min-w-[160px] md:min-w-[220px] xl:min-w-[calc((100%-140px)/6)] max-w-[160px] md:max-w-[220px] xl:max-w-[calc((100%-140px)/6)]'>
                                <CardProduct data={product} />
                            </div>
                        ))
                    )}
                </div>


                {/* Pre/Next Arrows (Desktop Only) */}
                <div className='hidden md:flex items-center justify-between w-full absolute top-1/2 -translate-y-1/2 pointer-events-none -mx-4 z-10'>
                    <button
                        onClick={handlePrev}
                        className='pointer-events-auto w-10 h-10 md:w-12 md:h-12 bg-white/95 backdrop-blur-md shadow-xl text-slate-800 rounded-2xl md:scale-0 group-hover/section:md:scale-100 transition-all duration-300 hover:bg-white border border-slate-100 flex items-center justify-center active:scale-90 group/prev group-hover/section:translate-x-6'
                    >
                        <svg className='w-4 h-4 md:w-5 md:h-5 stroke-[3] group-hover/prev:-translate-x-1 transition-transform text-slate-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7'></path></svg>
                    </button>
                    <button
                        onClick={handleNext}
                        className='pointer-events-auto w-10 h-10 md:w-12 md:h-12 bg-white/95 backdrop-blur-md shadow-xl text-slate-800 rounded-2xl md:scale-0 group-hover/section:md:scale-100 transition-all duration-300 hover:bg-white border border-slate-100 flex items-center justify-center active:scale-90 group/next group-hover/section:-translate-x-6'
                    >
                        <svg className='w-4 h-4 md:w-5 md:h-5 stroke-[3] group-hover/next:translate-x-1 transition-transform text-slate-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7'></path></svg>
                    </button>
                </div>
            </div>
        </section>
    )
}

export default CategoryWiseProductDisplay
