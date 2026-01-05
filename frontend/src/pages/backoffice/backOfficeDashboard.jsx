import React, { useState } from 'react'
import { BiChevronUp, BiMoney } from 'react-icons/bi'
import { FaMoneyBillWave } from 'react-icons/fa'
import { FaHandHoldingDollar } from 'react-icons/fa6'

export default function BackOfficeDashboard() {
  const [collapsedCards, setCollapsedCards] = useState({
    invoices: false,
    receivable: false,
    statistics: false,
    customers: false,
    cashBooks: false
  })

  const toggleCard = (cardName) => {
    setCollapsedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }))
  }

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
        <h2 className='font-bold text-3xl'>Dashboard</h2>
        
        <div className="grid grid-cols-12 gap-6">
            {/* INVOICES CARD - Left Side */}
            <div className="col-span-8 space-y-6">
                {/* Invoices Section */}
                <div className="bg-white border border-gray-300 rounded shadow">
                    <div className="p-4 flex justify-between items-center">
                        <h2 className='font-bold text-lg'>INVOICES</h2>
                        <button 
                            onClick={() => toggleCard('invoices')}
                            className="transition-transform duration-300"
                            style={{ transform: collapsedCards.invoices ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                            <BiChevronUp size={24}/>
                        </button>
                    </div>
                    <div className="bg-gray-200 h-2"></div>
                    
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            collapsedCards.invoices ? 'max-h-0' : 'max-h-[2000px]'
                        }`}
                    >
                        <div className="p-3 grid grid-cols-2 gap-1">
                            <div className="grid grid-cols-2 gap-1 mb-6">
                                {/* Partially Paid */}
                                <div className="space-y-2 bg-gray-200 flex items-center justify-between p-3 gap-1">
                                    <div>
                                        <p className="text-gray-600 text-xs uppercase">Partially Paid</p>
                                        <p className="text-green-600 text-sm font-bold text-2xl">RWF 117,720</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <BiMoney className="text-green-600" size={20}/>
                                        </div>
                                    </div>
                                </div>
                                {/* Unpaid */}
                                <div className="space-y-2 bg-gray-200 flex items-center justify-between p-3 gap-1">
                                    <div>
                                        <p className="text-gray-600 text-xs uppercase">Unpaid</p>
                                        <p className="text-blue-500 text-sm font-bold text-2xl">RWF 1,200,000</p>   
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <BiMoney className="text-blue-500" size={20}/>
                                        </div>
                                    </div>
                                </div>
                                {/* Overdue */}
                                <div className="space-y-2 col-span-2 bg-gray-200 flex items-center justify-between p-3 gap-1">
                                    <div>
                                        <p className="text-gray-600 text-xs uppercase">Overdue</p>
                                        <p className="text-red-500 text-sm font-bold text-2xl">RWF 1,200,000</p>
                                    </div>
                                    <div className="bg-red-100 p-3 rounded-full">
                                        <BiMoney className="text-red-500" size={20}/>
                                    </div>
                                </div>
                            </div>
                            {/* Invoices by Status Chart */}
                            <div>
                                <p className="text-gray-400 text-center mb-4 uppercase text-xs">Invoices by Status</p>
                                <div className="flex items-center justify-center gap-1">
                                    {/* Donut Chart */}
                                    <div className="relative w-32 h-32 scale-[0.7]">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" fill="none" stroke="#22c55e" strokeWidth="16" strokeDasharray="110 352"/>
                                            <circle cx="64" cy="64" r="56" fill="none" stroke="#eab308" strokeWidth="16" strokeDasharray="110 352" strokeDashoffset="-110"/>
                                            <circle cx="64" cy="64" r="56" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="132 352" strokeDashoffset="-220"/>
                                        </svg>
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-xs">Invoices in <span className="font-semibold">Draft</span> 1,500,000</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            <span className="text-xs">Invoices in <span className="font-semibold">Pending</span> 1,200,000</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs">Invoices in <span className="font-semibold">OnHold</span> 60,000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="bg-gray-200 h-px"></div>
                            <h2 className='font-bold text-xs text-gray-400'>ESTIMATES THIS MONTH</h2>
                            <div className="p-2 flex items-center gap-12">
                                <div className="bg-yellow-100 p-4 rounded-full">
                                    <FaHandHoldingDollar className="text-yellow-500" size={20}/>
                                </div>
                                
                                <div className="flex gap-16">
                                    <div>
                                        <p className="text-gray-600 text-xs uppercase mb-2">Expected Payments</p>
                                        <p className="font-bold text-sm">RWF 0</p>
                                    </div>
                                    <div className="border-l border-gray-300"></div>
                                    <div>
                                        <p className="text-gray-600 text-xs uppercase mb-2">Actual Payments</p>
                                        <p className="font-bold text-sm">RWF 0</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* AMOUNT RECEIVABLE & PAYABLE */}
                    <div className="bg-white border border-gray-300 rounded shadow">
                        <div className="p-4 flex justify-between items-center">
                            <h2 className='font-bold text-xs'>AMOUNT RECEIVABLE & PAYABLE</h2>
                            <button 
                                onClick={() => toggleCard('receivable')}
                                className="transition-transform duration-300"
                                style={{ transform: collapsedCards.receivable ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <BiChevronUp size={20}/>
                            </button>
                        </div>
                        <div className="bg-gray-200 h-2"></div>
                        
                        <div 
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                collapsedCards.receivable ? 'max-h-0' : 'max-h-[500px]'
                            }`}
                        >
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-green-500 font-bold text-sm mb-2">RECEIVABLE</p>
                                    <p className="font-bold text-xl">RWF 1,211,000</p>
                                </div>
                                <div>
                                    <p className="text-blue-500 font-bold text-sm mb-2">PAYABLE</p>
                                    <p className="font-bold text-xl">RWF 0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* INVOICE STATISTICS */}
                    <div className="bg-white border border-gray-300 rounded shadow">
                        <div className="p-4 flex justify-between items-center">
                            <h2 className='font-bold text-xs'>INVOICE STATISTICS</h2>
                            <button 
                                onClick={() => toggleCard('statistics')}
                                className="transition-transform duration-300"
                                style={{ transform: collapsedCards.statistics ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <BiChevronUp size={20}/>
                            </button>
                        </div>
                        <div className="bg-gray-200 h-2"></div>
                        
                        <div 
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                collapsedCards.statistics ? 'max-h-0' : 'max-h-[500px]'
                            }`}
                        >
                            <div className="p-4 space-y-3">
                                <p className="text-gray-600 text-xs">From <span className="font-semibold">13/10/2021</span> to <span className="font-semibold">13/10/2022</span></p>
                                <p className="text-gray-700 text-xs">Number of Invoices per month ~ <span className="font-bold">— 1</span></p>
                                <p className="text-gray-700 text-xs">Average Invoiced Amount per month — <span className="font-bold">RWF 60,000</span></p>
                            </div>
                        </div>
                    </div>    
                </div>
            </div>
            
            {/* RIGHT SIDE */}
            <div className="col-span-4 space-y-6">
                {/* TOP CUSTOMERS */}
                <div className="bg-white border border-gray-300 rounded shadow">
                    <div className="p-4 flex justify-between items-center">
                        <h2 className='font-bold text-xs'>TOP CUSTOMERS</h2>
                        <button 
                            onClick={() => toggleCard('customers')}
                            className="transition-transform duration-300"
                            style={{ transform: collapsedCards.customers ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                            <BiChevronUp size={20}/>
                        </button>
                    </div>
                    <div className="bg-gray-200 h-2"></div>
                    
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            collapsedCards.customers ? 'max-h-0' : 'max-h-[500px]'
                        }`}
                    >
                        <div className="p-4">
                            <p className="text-gray-600 text-xs">Top customers in the last 3 months, based on invoiced amount</p>
                        </div>
                    </div>
                </div>
                
                {/* CASH BOOKS SUMMARY */}
                <div className="bg-white border border-gray-300 rounded shadow">
                    <div className="p-4 flex justify-between items-center">
                        <h2 className='font-bold text-xs'>CASH BOOKS SUMMARY</h2>
                        <button 
                            onClick={() => toggleCard('cashBooks')}
                            className="transition-transform duration-300"
                            style={{ transform: collapsedCards.cashBooks ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                            <BiChevronUp size={20}/>
                        </button>
                    </div>
                    <div className="bg-gray-200 h-2"></div>
                    
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            collapsedCards.cashBooks ? 'max-h-0' : 'max-h-[500px]'
                        }`}
                    >
                        <div className="p-4 space-y-4">
                            <p className="text-gray-600 text-xs">Transactions this week (from 09/10/2022 to 13/10/2022)</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {/* RWF */}
                                <div>
                                    <div className="font-bold bg-gray-100 p-1 text-sm mb-3">RWF</div>
                                    <div className="space-y-2 p-1">
                                        <div className='border-b-2 border-gray-200 p-1'>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-green-500 text-xs">IN</span>
                                                <span className="text-green-500 text-xs">✓</span>
                                            </div>
                                            <p className="font-bold text-sm">RWF1,500,000</p>
                                        </div>
                                        <div className='px-1'>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-red-500 text-xs">OUT</span>
                                                <span className="text-red-500 text-xs">↗</span>
                                            </div>
                                            <p className="font-bold text-sm">RWF0</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* USD */}
                                <div>
                                    <p className="font-bold bg-gray-100 p-1 text-sm mb-3">USD</p>
                                    <div className="space-y-2 p-1">
                                        <div className='border-b-2 border-gray-200 p-1'>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-green-500 text-xs">IN</span>
                                                <span className="text-green-500 text-xs">✓</span>
                                            </div>
                                            <p className="font-bold text-sm">USD104,800</p>
                                        </div>
                                        <div className='px-1'>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-red-500 text-xs">OUT</span>
                                                <span className="text-red-500 text-xs">↗</span>
                                            </div>
                                            <p className="font-bold text-sm">USD80</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}