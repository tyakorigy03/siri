import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BiChevronDown, BiMenu } from 'react-icons/bi';
import { MdDashboard, MdSettings, MdOutlinePeopleAlt } from 'react-icons/md';
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
    { icon: <FaShoppingCart />, label: 'Sales', path: 'sale-management' },
    // Link AR & AP to their dedicated management views
    { icon: <TbUserDollar />, label: 'Accounts Receivable', path: 'customer-credit-management' },
    { icon: <FaSackDollar />, label: 'Accounts Payable', path: 'accounts-payable' },
    { icon: <FaGears />, label: 'Inventory Management', path: 'inventory-oversight' },
    { icon: <MdOutlinePeopleAlt />, label: 'Staff & Payroll', path: 'staff-center' },
    { icon: <GrDocument />, label: 'Reports', path: 'daily-report' },
    { icon: <MdSettings />, label: 'Settings', path: 'manager-settings' },
  ];

  const approvalItems = [
    { label: 'Expense Approval', path: 'expense-approval' },
    { label: 'Purchase Order Approval', path: 'purchase-order-approval' },
    { label: 'Float Cash Approval', path: 'float-cash-approval' },
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
          <button onClick={() => navigate('pos-point-of-sales')} className='flex text-xs sm:text-sm md:text-sm text-gray-500 cursor-pointer hover:bg-gray-500 hover:text-gray-50 space-x-2 md:space-x-3 bg-white px-2 py-1 border uppercase'>
            POS (Point of Sales) +
          </button>
          <button onClick={() => navigate('create-expense')} className='flex text-xs sm:text-sm md:text-sm text-gray-500 cursor-pointer hover:bg-gray-500 hover:text-gray-50 space-x-2 md:space-x-3 bg-white px-2 py-1 border uppercase'>
            Expense +
          </button>
          <Link
            to='open-business-day'
            className='flex text-xs sm:text-sm md:text-sm cursor-pointer bg-gray-500 hover:bg-gray-50 text-gray-50 hover:text-gray-500 space-x-2 md:space-x-3 px-2 py-1 border uppercase'
          >
            New Day +
          </Link>
          <div className='relative group'>
            <button className='flex text-xs sm:text-sm md:text-sm cursor-pointer bg-blue-500 hover:bg-blue-600 text-white space-x-2 md:space-x-3 px-2 py-1 border uppercase'>
              Approvals <BiChevronDown size={15} />
            </button>
            <div className='absolute left-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
              {approvalItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className='block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 border-b border-gray-200 last:border-b-0'
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
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