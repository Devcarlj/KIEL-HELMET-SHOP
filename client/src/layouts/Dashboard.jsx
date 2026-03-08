import React from 'react'
import UserMenu from '../components/UserMenu.jsx'
import { Outlet } from 'react-router-dom'

const Dashboard = () => {
  return (
    // 1. Changed to a light slate background to make the content "pop"
    <section className='bg-slate-50 min-h-[calc(100vh-96px)]'>
      <div className='container mx-auto p-4 lg:grid lg:grid-cols-[280px_1fr] gap-6'>
        
        {/** left for menu: Added a card style and border */}
        <div className='hidden lg:block'>
          <div className='sticky top-28 bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[70vh]'>
             <h2 className='font-bold text-slate-800 px-2 mb-4'>Dashboard</h2>
             <UserMenu />
          </div>
        </div>

        {/** right for content: Added min-height and a clean white background */}
        <div className='bg-white min-h-[75vh] rounded-xl shadow-sm border border-slate-200 p-6'>
          <Outlet />
        </div>

      </div>
    </section>
  )
}

export default Dashboard