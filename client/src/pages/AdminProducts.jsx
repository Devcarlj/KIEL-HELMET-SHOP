import React, { useState } from 'react'
import Axios from '../utils/Axios.js'
import SummaryApi from '../common/SummaryApi.js'
import EditProductAdmin from '../components/EditProductAdmin.jsx'
import DeleteProductConfirm from '../components/DeleteProductConfirm.jsx'
import toast from 'react-hot-toast'
import NoData from '../components/NoData.jsx'
import { DisplayPrice } from '../utils/DisplayPrice.js'
import useSWR from 'swr'

const AdminProducts = () => {
  const [search, setSearch] = useState("")
  const [editProduct, setEditProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const { data: productsData, isLoading: loading, mutate } = useSWR(
    { ...SummaryApi.getProduct, params: { search } }
  )
  const products = productsData?.success ? productsData.data : []

  const fetchProducts = () => mutate() // For compatibility with child components

  const handleDeleteProduct = async (product) => {
    try {
      setActionLoading(true)
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: { _id: product._id }
      })

      if (response.data.success) {
        toast.success(response.data.message)
        fetchProducts()
        setDeleteProduct(null)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log("Error deleting product", error)
      toast.error(error.response?.data?.message || "Error deleting product")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <section className='bg-gray-50 min-h-screen'>
      {/* Header Section */}
      {/* Header Section */}
      <div className='p-3 md:p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-3'>
        <h2 className='font-bold text-base md:text-xl text-neutral-800'>Product</h2>

        {/* Search Bar */}
        <div className='w-full md:max-w-md flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:border-secondary transition-all'>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="text-gray-400 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder='Search products...'
            className='bg-transparent outline-none w-full text-sm placeholder:text-gray-400'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className='px-1 py-4 md:px-6'>
        {/* Loading State */}
        {loading && (
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6'>
            {[...Array(12)].map((_, n) => (
              <div key={n} className='bg-white rounded-2xl p-2 md:p-3 border border-gray-100 animate-pulse flex flex-col h-full'>
                {/* Match Image Aspect Ratio */}
                <div className='w-full aspect-square bg-gray-200 rounded-xl'></div>

                {/* Match Info Section Spacing */}
                <div className='mt-2 flex flex-col items-center flex-grow gap-2'>
                  {/* Name lines */}
                  <div className='h-9 md:h-11 w-full flex flex-col items-center justify-center gap-1'>
                    <div className='h-3 bg-gray-200 rounded-full w-3/4'></div>
                    <div className='h-3 bg-gray-100 rounded-full w-1/2'></div>
                  </div>

                  <div className='flex flex-col items-center mt-auto w-full gap-2'>
                    {/* Unit & Stock line */}
                    <div className='h-4 bg-gray-50 rounded w-1/2 border border-gray-100'></div>
                    {/* Price line */}
                    <div className='h-8 md:h-10 w-full flex flex-col items-center justify-center gap-1'>
                      <div className='h-4 bg-gray-200 rounded-full w-1/3'></div>
                      <div className='h-2 bg-gray-100 rounded-full w-1/4'></div>
                    </div>
                  </div>
                </div>

                {/* Match Mobile Action Buttons height and border */}
                <div className='flex items-center justify-around mt-1 pt-2 border-t border-gray-50 md:hidden'>
                  <div className='h-4 bg-gray-100 rounded w-1/4'></div>
                  <div className='w-[1px] h-4 bg-gray-100'></div>
                  <div className='h-4 bg-gray-100 rounded w-1/4'></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className='mt-20'>
            <NoData />
          </div>
        )}

        {/* Data Grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6'>
          {!loading && products.map((product, index) => {
            return (
              <div
                key={product._id || index}
                className='group relative bg-white rounded-2xl border border-gray-100 p-2 md:p-3 hover:border-secondary shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full'
              >
                {/* Product Image Wrapper */}
                <div className='w-full aspect-square overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center relative'>
                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className='absolute top-2 left-2 bg-red-500 text-white text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full z-10 shadow-sm animate-pulse'>
                      {product.discount}% OFF
                    </div>
                  )}

                  {product.image?.[0] ? (
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className='w-full h-full object-scale-down group-hover:scale-110 transition-transform duration-500'
                    />
                  ) : (
                    <div className='text-slate-400 text-xs'>No Image</div>
                  )}

                  {/* Desktop ONLY Hover Overlay */}
                  <div className='hidden md:flex absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity items-end justify-center pb-2 gap-2'>
                    <button
                      onClick={() => setEditProduct(product)}
                      className='bg-white text-secondary p-1.5 rounded-lg shadow-md hover:bg-secondary hover:text-white transition-colors'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" /></svg>
                    </button>
                    <button
                      onClick={() => setDeleteProduct(product)}
                      className='bg-white text-red-500 p-1.5 rounded-lg shadow-md hover:bg-red-500 hover:text-white transition-colors'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" /><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" /></svg>
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className='mt-2 flex flex-col flex-grow'>
                  <div className='h-9 md:h-11 flex items-center justify-center text-center'>
                    <p className='font-bold text-[11px] md:text-sm text-neutral-700 group-hover:text-primary transition-colors capitalize leading-tight line-clamp-2'>
                      {product.name}
                    </p>
                  </div>

                  <div className='flex flex-col items-center mt-auto gap-1'>
                    <div className='flex items-center gap-1.5'>
                      <p className='text-[9px] md:text-xs text-neutral-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100'>
                        {product.unit}
                      </p>
                      {product.stock <= 10 && product.stock > 0 && (
                        <p className='text-[8px] text-orange-600 font-black uppercase tracking-tighter'>Low Stock</p>
                      )}
                      {product.stock === 0 && (
                        <p className='text-[8px] text-red-600 font-black uppercase tracking-tighter'>Out of Stock</p>
                      )}
                    </div>

                    <div className='flex flex-col items-center justify-center h-8 md:h-10'>
                      {product.discount > 0 ? (
                        <>
                          <p className='font-black text-xs md:text-sm text-secondary leading-none'>
                            {DisplayPrice(product.price * (1 - product.discount / 100))}
                          </p>
                          <p className='text-[9px] md:text-[10px] text-gray-400 line-through decoration-red-400/50'>
                            {DisplayPrice(product.price)}
                          </p>
                        </>
                      ) : (
                        <p className='font-black text-xs md:text-sm text-secondary'>
                          {DisplayPrice(product.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Action Buttons - Always visible on small screens */}
                <div className='flex items-center justify-around mt-1 pt-2 border-t border-gray-100 md:hidden'>
                  <button
                    onClick={() => setEditProduct(product)}
                    className='flex-1 flex justify-center text-secondary py-1 active:bg-gray-50 rounded-l-lg'
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" /></svg>
                  </button>
                  <div className='w-[1px] h-4 bg-gray-100'></div>
                  <button
                    onClick={() => setDeleteProduct(product)}
                    className='flex-1 flex justify-center text-red-500 py-1 active:bg-gray-50 rounded-r-lg'
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" /><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" /></svg>
                  </button>
                </div>
              </div>
            )
          })
          }
        </div>
      </div>

      {editProduct && (
        <EditProductAdmin
          close={() => setEditProduct(null)}
          productData={editProduct}
          fetchProducts={fetchProducts}
        />
      )}

      {deleteProduct && (
        <DeleteProductConfirm
          close={() => setDeleteProduct(null)}
          product={deleteProduct}
          onConfirm={handleDeleteProduct}
          loading={actionLoading}
        />
      )}
    </section>
  )
}

export default AdminProducts

