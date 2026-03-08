import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import CardProduct from '../components/CardProduct'
import NoDataImage from '../assets/nothinghereyet.png'

const SearchPage = () => {
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const searchTerm = (queryParams.get('q') || '').trim()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        const response = await Axios({
          ...SummaryApi.getProduct,
          params: {}
        })

        if (response.data.success && Array.isArray(response.data.data)) {
          setProducts(response.data.data)
        }
      } catch (error) {
        console.log('Error loading search products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return []
    const lower = searchTerm.toLowerCase()

    return products.filter(p => {
      const name = (p.name || '').toLowerCase()
      const description = (p.description || '').toLowerCase()

      // Category names: product.category can be array of objects or ids
      const categoryNames = Array.isArray(p.category)
        ? p.category
            .map(c => (typeof c === 'string' ? '' : c?.name || ''))
            .filter(Boolean)
        : []
      const categoryMatch = categoryNames.some(catName =>
        catName.toLowerCase().includes(lower)
      )

      // Sub category names: product.subCategory can be array of objects or ids
      const subCategoryNames = Array.isArray(p.subCategory)
        ? p.subCategory
            .map(sc => (typeof sc === 'string' ? '' : sc?.name || ''))
            .filter(Boolean)
        : []
      const subCategoryMatch = subCategoryNames.some(subName =>
        subName.toLowerCase().includes(lower)
      )

      return (
        name.includes(lower) ||
        description.includes(lower) ||
        categoryMatch ||
        subCategoryMatch
      )
    })
  }, [products, searchTerm])

  const hasResults = filteredProducts.length > 0

  return (
    <section className='bg-white min-h-[78vh]'>
      <div className='container mx-auto px-4 lg:px-6 py-4 md:py-6'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-1 text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-3 md:mb-4'>
          <Link to='/' className='hover:text-primary'>Home</Link>
          <span>/</span>
          <span className='text-slate-500'>Search</span>
        </div>

        {/* Header */}
        <div className='flex flex-col gap-1 md:gap-2 mb-4 md:mb-6'>
          <h1 className='text-xl md:text-3xl font-black text-slate-900'>
            {searchTerm ? `Results for "${searchTerm}"` : 'Search products'}
          </h1>
          <p className='text-xs md:text-sm text-slate-500'>
            {searchTerm
              ? hasResults
                ? `${filteredProducts.length} item${filteredProducts.length !== 1 ? 's' : ''} found`
                : loading
                  ? 'Searching products...'
                  : 'No matching products found.'
              : 'Type a product name in the search box above and press Enter.'}
          </p>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5'>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className='min-w-[150px] md:min-w-[200px] aspect-[1/1.6] bg-slate-100 animate-pulse rounded-[2.5rem] border border-slate-100'
              />
            ))}
          </div>
        ) : hasResults ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5'>
            {filteredProducts.map(product => (
              <CardProduct key={product._id} data={product} />
            ))}
          </div>
        ) : searchTerm ? (
          <div className='h-full flex flex-col items-center justify-center py-16 text-center'>
            <img
              src={NoDataImage}
              alt='nothing here yet'
              className='w-80 h-auto object-scale-down mb-2'
            />
            <p className='text-sm md:text-base font-semibold text-slate-700 mb-1'>
              No products found for "{searchTerm}".
            </p>
            <p className='text-xs md:text-sm text-slate-400 max-w-md'>
              Try a different spelling or search for a more general term.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default SearchPage
