import React from 'react'

import NoDataImage from '../assets/nothinghereyet.png'

const NoData = () => {
  return (
    <div className='flex flex-col items-center justify-center p-8 text-center'>
      <img 
        src={NoDataImage}
        alt="no data"
        loading="lazy"
        className='w-40 h-full object-scale-down' 
      />
      <p className='text-neutral-500 mt-2 font-medium'>No data available</p>
    </div>
  )
}

export default NoData
