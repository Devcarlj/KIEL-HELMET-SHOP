import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import CardProduct from '../components/CardProduct'
import useSWR from 'swr'
import { ProductCardSkeleton } from '../components/Skeletons'

const ProductListPage = () => {
  const { categoryId } = useParams()
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('all')

  const { data: categoryListData } = useSWR(SummaryApi.getCategory)
  const { data: subCategoryListData } = useSWR(SummaryApi.getSubCategory)
  const { data: productsListData, isLoading: loading } = useSWR(
    categoryId ? { ...SummaryApi.getProductsByCategory, data: { id: categoryId } } : null
  )

  const category = useMemo(() => {
    if (!categoryListData?.success) return null
    return categoryListData.data.find(cat => cat._id === categoryId)
  }, [categoryListData, categoryId])

  const subCategories = useMemo(() => {
    if (!subCategoryListData?.success) return []
    const allSub = subCategoryListData.data || []
    return allSub.filter(subCat =>
      Array.isArray(subCat.category) &&
      subCat.category.some(c => (c._id || c) === categoryId)
    )
  }, [subCategoryListData, categoryId])

  const products = productsListData?.success ? productsListData.data : []

  useEffect(() => {
    setSelectedSubCategoryId('all')
  }, [categoryId])

  const visibleProducts = useMemo(() => {
    if (selectedSubCategoryId === 'all') return products

    return products.filter(product =>
      Array.isArray(product.subCategory) &&
      product.subCategory.some(sc => (sc._id || sc) === selectedSubCategoryId)
    )
  }, [products, selectedSubCategoryId])

  const hasSubCategories = subCategories.length > 0

  return (
    <section className='bg-white min-h-screen'>
      <div className='w-full px-4 md:px-10 lg:px-16 py-4 md:py-6'>
        {/* Breadcrumb / Header */}
        <div className='flex flex-col gap-2 mb-4 md:mb-6'>
          <div className='text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-1'>
            <Link to='/' className='hover:text-primary'>Home</Link>
            <span>/</span>
            <span className='text-slate-500'>Category</span>
            {category && (
              <>
                <span>/</span>
                <span className='text-slate-900'>{category.name}</span>
              </>
            )}
          </div>

          <div className='flex flex-wrap items-baseline justify-between gap-2'>
            <div>
              <h1 className='text-xl md:text-3xl font-black text-slate-900'>
                {category ? category.name : 'Category'}
              </h1>
              <p className='text-xs md:text-sm text-slate-500 mt-1'>
                Browse products by sub category.
              </p>
            </div>
            {!loading && (
              <p className='text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em]'>
                {visibleProducts.length} item{visibleProducts.length !== 1 && 's'}
              </p>
            )}
          </div>
        </div>

        <div className='flex flex-col md:flex-row gap-4 md:gap-6'>
          {/* Left: Sub Category Navigation */}
          <aside className='md:w-60 lg:w-72 md:shrink-0'>
            {/* Mobile horizontal nav */}
            {hasSubCategories && (
              <div className='md:hidden mb-3'>
                <div className='flex gap-2 overflow-x-auto no-scrollbar pb-2'>
                  <button
                    onClick={() => setSelectedSubCategoryId('all')}
                    className={`px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
                      selectedSubCategoryId === 'all'
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {subCategories.map(sub => (
                    <button
                      key={sub._id}
                      onClick={() => setSelectedSubCategoryId(sub._id)}
                      className={`px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
                        selectedSubCategoryId === sub._id
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop vertical nav */}
            {hasSubCategories && (
              <div className='hidden md:block bg-slate-50 rounded-2xl border border-slate-100 p-3 lg:p-4 sticky top-20'>
                <h2 className='text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3'>
                  Sub Categories
                </h2>
                <div className='flex flex-col gap-1.5'>
                  <button
                    onClick={() => setSelectedSubCategoryId('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                      selectedSubCategoryId === 'all'
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  {subCategories.map(sub => (
                    <button
                      key={sub._id}
                      onClick={() => setSelectedSubCategoryId(sub._id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                        selectedSubCategoryId === sub._id
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className='flex-1 min-w-0'>
            {loading ? (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 md:gap-5'>
                {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className='flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 text-center'>
                <p className='text-lg md:text-xl font-bold text-slate-800 mb-2'>
                  No products found here
                </p>
                {hasSubCategories && selectedSubCategoryId !== 'all' ? (
                  <p className='text-sm text-slate-400'>
                    Try selecting a different sub category to see more gear.
                  </p>
                ) : (
                  <p className='text-sm text-slate-400'>
                    Check back soon! We're always updating our inventory.
                  </p>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 md:gap-5'>
                {visibleProducts.map(product => (
                  <CardProduct key={product._id} data={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductListPage

