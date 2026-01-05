import React, { useState } from 'react'
import DateRangePicker from './ui/dateRangePicker'
import { BiChevronDown, BiMenu } from 'react-icons/bi'
import { MdDashboard, MdSettings } from 'react-icons/md'
import { GrDocument } from 'react-icons/gr'
import { FaShoppingCart } from 'react-icons/fa'
import { FaGears, FaSackDollar } from 'react-icons/fa6'
import { TbUserDollar } from 'react-icons/tb'

export default function BackOfficeLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarItems = [
    { icon: <MdDashboard />, label: 'Dashboard' },
    { icon: <FaShoppingCart />, label: 'Sales' },
    { icon: <TbUserDollar />, label: 'Accounts Receivable' },
    { icon: <FaSackDollar />, label: 'Accounts Payable' },
    { icon: <FaGears />, label: 'Inventory Management' },
    { icon: <MdSettings />, label: 'Settings' },
    { icon: <GrDocument />, label: 'Reports' },
  ]

  return (
    <div className='bg-gray-200 space-y-2 flex flex-col h-screen'>
      <nav className='flex justify-between p-5 bg-gray-100 items-center'>
        <div className='flex space-x-5 items-center'>
          <img src='/logo.png' className='h-7 w-7' alt='' />
          <button className='text-gray-500 hover:text-gray-700' onClick={() => setSidebarOpen(!sidebarOpen)}>
            <BiMenu />
          </button>
          <h2 className='text-gray-500 font-bold text-md uppercase'>Quick actions</h2>
          <button className='flex text-gray-500 cursor-pointer hover:bg-gray-500 hover:text-gray-50 text-sm space-x-3 bg-white px-3 py-1 border uppercase'>Invoices +</button>
          <button className='flex text-gray-500 cursor-pointer hover:bg-gray-500 hover:text-gray-50 text-sm space-x-3 bg-white px-3 py-1 border uppercase'>Proformas +</button>
          <button className='flex cursor-pointer bg-gray-500 hover:bg-gray-50 text-gray-50 hover:text-gray-500 text-sm space-x-3 px-3 py-1 border uppercase'>New Day +</button>
        </div>
        <div className='flex items-center space-x-1'>
          <DateRangePicker />
          <button className='flex cursor-pointer bg-gray-600 hover:bg-gray-50 text-gray-50 hover:text-gray-500 text-xs rounded space-x-3 px-3 py-1 border uppercase'>
            Hi, Oye <BiChevronDown size={15} />
          </button>
        </div>
      </nav>
      <main className='flex flex-1 min-w-0 overflow-hidden bg-gray-100 '>
        <aside className={`p-3 h-full flex-shrink-0 transition-width duration-300 ${sidebarOpen ? 'w-48' : 'w-16'}`}>
          <div className='flex flex-col shadow bg-white'>
            {sidebarItems.map((item, idx) => (
              <button key={idx} className= {`p-3 border-b border-gray-300 cursor-pointer flex  items-center justify-start space-x-2 hover:bg-gray-200`} title={item.label}>
                <span>{item.icon}</span>
                {sidebarOpen && <span className='truncate block  max-w-full'>{item.label}</span>}
              </button>
            ))}
          </div>
        </aside>
        <div className='flex-1 h-full bg-white overflow-auto min-w-0"'>
          {children}
        </div>
      </main>
    </div>
  )
}