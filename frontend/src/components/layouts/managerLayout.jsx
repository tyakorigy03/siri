import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BiChevronDown, BiMenu } from 'react-icons/bi';
import { MdDashboard, MdSettings } from 'react-icons/md';
import { GrDocument } from 'react-icons/gr';
import { FaShoppingCart } from 'react-icons/fa';
import { FaGears, FaSackDollar } from 'react-icons/fa6';
import { TbUserDollar } from 'react-icons/tb';
import DateRangePicker from './ui/dateRangePicker';

export default function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarItems = [
    { icon: <MdDashboard />, label: 'Dashboard', path: '' },
    { icon: <GrDocument />, label: 'Invoices', path: 'invoices' },
    { icon: <FaShoppingCart />, label: 'Sales' },
    { icon: <TbUserDollar />, label: 'Accounts Receivable' },
    { icon: <FaSackDollar />, label: 'Accounts Payable' },
    { icon: <FaGears />, label: 'Inventory Management', path: 'inventory-oversight' },
    { icon: <GrDocument />, label: 'Reports', path: 'daily-report' },
    { icon: <MdSettings />, label: 'Settings', path: 'manager-settings' },
  ];

  return (
    <div className='bg-gray-200 flex flex-col h-screen'>
      {/* Top Navigation */}
      <nav className='flex flex-wrap justify-between p-3 md:p-5 bg-gray-100 items-center'>
        <div className='flex flex-wrap space-x-2 md:space-x-5 items-center w-full md:w-auto'>
          <img
            onClick={() => navigate('/dashboard/manager')}
            src='/logo.png'
            className='h-6 w-6 md:h-7 md:w-7 cursor-pointer'
            alt='logo'
          />
          <button
            className='text-gray-500 hover:text-gray-700'
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <BiMenu size={20} />
          </button>
          <h2 className='text-gray-500 font-bold text-xs sm:text-sm md:text-md uppercase'>
            Quick actions
          </h2>
          <button className='flex text-xs sm:text-sm md:text-sm text-gray-500 cursor-pointer hover:bg-gray-500 hover:text-gray-50 space-x-2 md:space-x-3 bg-white px-2 py-1 border uppercase'>
            Invoices +
          </button>
          <button className='flex text-xs sm:text-sm md:text-sm text-gray-500 cursor-pointer hover:bg-gray-500 hover:text-gray-50 space-x-2 md:space-x-3 bg-white px-2 py-1 border uppercase'>
            Proformas +
          </button>
          <Link
            to='open-business-day'
            className='flex text-xs sm:text-sm md:text-sm cursor-pointer bg-gray-500 hover:bg-gray-50 text-gray-50 hover:text-gray-500 space-x-2 md:space-x-3 px-2 py-1 border uppercase'
          >
            New Day +
          </Link>
        </div>

        <div className='flex flex-wrap items-center space-x-1 mt-2 md:mt-0'>
          <DateRangePicker />
          <button className='flex text-xs sm:text-sm md:text-xs cursor-pointer bg-gray-600 hover:bg-gray-50 text-gray-50 hover:text-gray-500 rounded space-x-2 md:space-x-3 px-2 py-1 border uppercase'>
            Hi, Oye <BiChevronDown size={15} />
          </button>
        </div>
      </nav>
      
      <div className="h-2 bg-gray-200"></div>

      {/* Main Content Area */}
      <main className='flex flex-1 min-w-0 overflow-hidden bg-gray-100'>
        {/* Sidebar */}
        <aside
          className={`p-2 md:p-3 h-full flex-shrink-0 transition-all duration-300 ${
            sidebarOpen ? 'w-48' : 'w-16'
          }`}
        >
          <div className='flex flex-col shadow bg-white'>
            {sidebarItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path || ''}
                className={`p-2 md:p-3 border-b border-gray-300 cursor-pointer flex items-center justify-start space-x-2 hover:bg-gray-200 text-xs sm:text-sm ${
                  window.location.pathname.includes(item.path) ? 'bg-gray-100' : ''
                }`}
                title={item.label}
              >
                <span>{item.icon}</span>
                {sidebarOpen && (
                  <span className='truncate block max-w-full'>{item.label}</span>
                )}
              </Link>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <div className='flex-1 h-full bg-white overflow-auto min-w-0 p-4 md:p-6'>
          <Outlet /> {/* This renders the nested child routes */}
        </div>
      </main>
    </div>
  );
}