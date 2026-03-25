import React from 'react'

const PageLoadingFallback = () => {
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center gap-6 bg-brand-cream/30'>
      {/* Animated spinner */}
      <div className='relative w-14 h-14'>
        <div className='absolute inset-0 rounded-full border-[3px] border-slate-200'></div>
        <div className='absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin'></div>
      </div>

      {/* Skeleton content preview */}
      <div className='w-full max-w-md px-6 space-y-4 animate-pulse'>
        <div className='h-5 bg-slate-200/60 rounded-xl w-3/4 mx-auto'></div>
        <div className='h-4 bg-slate-100/80 rounded-lg w-1/2 mx-auto'></div>
        <div className='flex gap-3 justify-center pt-2'>
          <div className='h-3 w-3 bg-slate-200/50 rounded-full'></div>
          <div className='h-3 w-3 bg-slate-200/70 rounded-full'></div>
          <div className='h-3 w-3 bg-slate-200/50 rounded-full'></div>
        </div>
      </div>
    </div>
  )
}

export default PageLoadingFallback
