import React from 'react'
import { useLocation } from 'react-router-dom'
import { 
  ProductListPageSkeleton, 
  DisplayProductPageSkeleton, 
  SearchPageSkeleton, 
  CheckoutPageSkeleton, 
  GeneralPageSkeleton 
} from './Skeletons'

const PageLoadingFallback = () => {
  const location = useLocation()
  const path = location.pathname

  // Match the path to the best-fitting skeleton
  if (path.startsWith('/product/')) {
    return <DisplayProductPageSkeleton />
  }

  if (path.startsWith('/category/') || path.startsWith('/sub-category')) {
    return <ProductListPageSkeleton />
  }

  if (path.startsWith('/search')) {
    return <SearchPageSkeleton />
  }

  if (path.startsWith('/checkout')) {
    return <CheckoutPageSkeleton />
  }

  // Fallback to a general stylized loader for other pages
  return <GeneralPageSkeleton />
}

export default PageLoadingFallback
