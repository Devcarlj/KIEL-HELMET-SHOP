import React from 'react'

export const ProductCardSkeleton = () => (
  <div className='min-w-[150px] md:min-w-[200px] aspect-[1/1.6] bg-slate-100 animate-pulse rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 flex flex-col p-3 gap-3'>
    <div className='w-full aspect-square bg-slate-200/50 rounded-[1rem] md:rounded-[2rem]' />
    <div className='h-4 bg-slate-200/60 rounded-md w-3/4' />
    <div className='h-3 bg-slate-200/40 rounded-md w-1/2' />
    <div className='mt-auto flex justify-between items-center'>
        <div className='h-5 bg-slate-200/70 rounded-md w-1/3' />
        <div className='h-8 w-8 bg-slate-200/80 rounded-full' />
    </div>
  </div>
)

export const ProductListPageSkeleton = () => (
  <section className='bg-white min-h-screen'>
    <div className='w-full px-4 md:px-10 lg:px-16 py-4 md:py-6'>
      <div className='flex flex-col gap-2 mb-4 md:mb-6'>
        <div className='h-3 w-40 bg-slate-100 rounded animate-pulse' />
        <div className='h-8 md:h-12 w-64 bg-slate-100 rounded-xl animate-pulse mt-2' />
      </div>
      <div className='flex flex-col md:flex-row gap-4 md:gap-6'>
        <aside className='md:w-60 lg:w-72 md:shrink-0 hidden md:block'>
          <div className='h-64 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse' />
        </aside>
        <div className='flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5'>
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  </section>
)

export const DisplayProductPageSkeleton = () => (
  <section className='bg-white min-h-[78vh]'>
    <div className='w-full px-4 md:px-10 lg:px-16 py-6 md:py-10'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16'>
        <div className='aspect-square w-full bg-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] animate-pulse' />
        <div className='space-y-4 md:space-y-6'>
          <div className='h-8 md:h-12 w-3/4 bg-slate-100 rounded-xl animate-pulse' />
          <div className='h-4 w-1/4 bg-slate-100 rounded-md animate-pulse' />
          <div className='h-24 w-full bg-slate-100 rounded-[2rem] animate-pulse' />
          <div className='h-40 w-full bg-slate-100 rounded-xl animate-pulse hidden md:block' />
          <div className='flex gap-4 mt-6'>
            <div className='h-14 flex-1 bg-slate-100 rounded-2xl animate-pulse' />
            <div className='h-14 flex-1 bg-slate-900/10 rounded-2xl animate-pulse' />
          </div>
        </div>
      </div>
    </div>
  </section>
)

export const SearchPageSkeleton = () => (
    <section className='bg-white min-h-screen'>
      <div className='w-full px-4 md:px-10 lg:px-16 py-4 md:py-6'>
        <div className='h-3 w-32 bg-slate-100 rounded animate-pulse mb-4' />
        <div className='h-8 md:h-12 w-64 bg-slate-100 rounded-xl animate-pulse mb-6' />
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5'>
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </section>
)

export const CheckoutPageSkeleton = () => (
  <div className="bg-[#f8fafc] lg:h-[calc(100vh-96px)] flex flex-col overflow-hidden animate-pulse">
    <div className="bg-white/50 border-b border-slate-100 p-4 h-12" />
    <div className="container mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="h-40 bg-white rounded-2xl border border-slate-100 shadow-sm" />
        <div className="h-32 bg-white rounded-2xl border border-slate-100 shadow-sm" />
        <div className="h-20 bg-white rounded-2xl border border-slate-100 shadow-sm" />
      </div>
      <div className="lg:col-span-5">
        <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-lg" />
      </div>
    </div>
  </div>
)

export const GeneralPageSkeleton = () => (
    <div className='min-h-[70vh] flex flex-col items-center justify-center p-6 bg-slate-50/30'>
      <div className='w-full max-w-2xl space-y-8 animate-pulse'>
        <div className='space-y-3'>
          <div className='h-8 bg-slate-200/60 rounded-xl w-1/3 mx-auto'></div>
          <div className='h-4 bg-slate-100/80 rounded-lg w-1/4 mx-auto'></div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
           <div className='h-32 bg-slate-100/50 rounded-2xl border border-slate-100'></div>
           <div className='h-32 bg-slate-100/50 rounded-2xl border border-slate-100'></div>
           <div className='h-32 bg-slate-100/50 rounded-2xl border border-slate-100'></div>
        </div>
        <div className='h-48 bg-slate-100/40 rounded-3xl border border-slate-100'></div>
        <div className='flex gap-3 justify-center pt-4'>
          <div className='h-2 w-2 bg-slate-200/50 rounded-full'></div>
          <div className='h-2 w-2 bg-slate-200/70 rounded-full'></div>
          <div className='h-2 w-2 bg-slate-200/50 rounded-full'></div>
        </div>
      </div>
    </div>
)
