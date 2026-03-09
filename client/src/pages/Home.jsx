import React, { useEffect, useState } from 'react'
import banner from '../assets/bannerg1.png'
import bannerMobile from '../assets/banner-mobile1.png'
import CategoryListing from '../components/CategoryListing.jsx'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay.jsx'
import Axios from '../utils/Axios.js'
import SummaryApi from '../common/SummaryApi.js'

const Home = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getCategory
      })
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (error) {
      console.log("Error fetching categories in Home:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <section className="bg-brand-cream min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 py-2">
        <div className="group relative w-full h-full min-h-[80px] md:min-h-[350px] lg:min-h-[85px] bg-brand-cream-dark rounded-lg lg:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 cursor-pointer">
          <picture>
            <source srcSet={banner} media="(min-width: 640px)" fetchpriority="high" />
            <img
              src={bannerMobile}
              fetchpriority="high"
              className="w-full h-full object-cover select-none pointer-events-none aspect-[1216/880] md:aspect-auto transform group-hover:scale-[1.01] transition-transform duration-1000 ease-in-out"
              alt="Kiel Helmet Shop Banner"
            />
          </picture>
        </div>
      </div>

      {/* Category Section */}
      <CategoryListing />

      {/* Product rows for each category */}
      <div className='flex flex-col gap-4 md:gap-8 mb-16'>
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
