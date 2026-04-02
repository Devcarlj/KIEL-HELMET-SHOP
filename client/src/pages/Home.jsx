import React from 'react'
import useSWR from 'swr'
import banner from '../assets/bannerg1.png'
import bannerMobile from '../assets/banner-mobile1.png'
import CategoryListing from '../components/CategoryListing.jsx'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay.jsx'
import SummaryApi from '../common/SummaryApi.js'

const Home = () => {
  const { data: categoriesData, isLoading: loading } = useSWR(SummaryApi.getCategory)
  const rawCategories = categoriesData?.success ? categoriesData.data : []
  const categories = [...rawCategories].sort((a, b) => {
    const aIsHelmet = a.name.toLowerCase().includes('helmet')
    const bIsHelmet = b.name.toLowerCase().includes('helmet')
    if (aIsHelmet && !bIsHelmet) return -1
    if (!aIsHelmet && bIsHelmet) return 1
    return 0
  })

  return (
    <section className="bg-brand-cream min-h-screen">
      <div className="w-full px-4 md:px-10 lg:px-16 py-2">
        <div className="group relative w-full h-full min-h-[80px] md:min-h-[350px] lg:min-h-[85px] bg-brand-cream-dark rounded-lg lg:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 cursor-pointer">
          <picture>
            <source srcSet={banner} media="(min-width: 640px)" fetchPriority="high" />
            <img
              src={bannerMobile}
              fetchPriority="high"
              className="w-full h-full object-cover select-none pointer-events-none aspect-[1216/880] md:aspect-auto transform group-hover:scale-[1.01] transition-transform duration-1000 ease-in-out"
              alt="Kiel Helmet Shop Banner"
            />
          </picture>
        </div>
      </div>

      {/* Category Section */}
      <CategoryListing />

      {/* Product rows for each category */}
      <div className='flex flex-col gap-0 md:gap-0 mb-8'>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className='container mx-auto px-4 mt-8'>
              <div className='h-8 w-48 bg-brand-cream-dark animate-pulse rounded-lg mb-4'></div>
              <div className='flex gap-4 overflow-hidden'>
                {[...Array(5)].map((_, j) => (
                  <div key={j} className='min-w-[220px] h-[300px] bg-brand-cream-dark/50 rounded-3xl animate-pulse'></div>
                ))}
              </div>
            </div>
          ))
        ) : (
          categories.map((category) => (
            <CategoryWiseProductDisplay
              key={category._id + "display"}
              id={category._id}
              name={category.name}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default Home
