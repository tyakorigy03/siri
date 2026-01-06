import React, { useState } from 'react';
import { BiSearch, BiRefresh, BiCopy, BiChevronDown } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload } from 'react-icons/fa6';
import { MdCalendarToday } from 'react-icons/md';

export default function DailyReports() {
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2026-01-05');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const reportData = {
    date: 'Monday, January 05, 2026',
    branch: 'Downtown Store',
    
    salesSummary: {
      totalSales: 13000000,
      cash: 4200000,
      momo: 5000000,
      card: 2300000,
      credit: 1500000,
      transactions: 115,
      averageTransaction: 113043,
      target: 15000000,
      achievement: 86.7
    },

    cashierPerformance: [
      { name: 'Mike Johnson', register: 'POS-01', sales: 4500000, transactions: 45, avgTransaction: 100000, variance: -5000, performance: 'good' },
      { name: 'Sarah Lee', register: 'POS-02', sales: 3200000, transactions: 32, avgTransaction: 100000, variance: 2000, performance: 'excellent' },
      { name: 'John Doe', register: 'POS-03', sales: 5300000, transactions: 38, avgTransaction: 139474, variance: 0, performance: 'excellent' }
    ],

    topProducts: [
      { product: 'Laptop Dell XPS', quantity: 5, revenue: 6000000, profit: 750000 },
      { product: 'Wireless Mouse', quantity: 45, revenue: 1575000, profit: 315000 },
      { product: 'USB Cables', quantity: 120, revenue: 300000, profit: 90000 },
      { product: 'HDMI Cables', quantity: 80, revenue: 240000, profit: 80000 },
      { product: 'Keyboard Mechanical', quantity: 15, revenue: 750000, profit: 150000 }
    ],

    expenses: {
      total: 275000,
      categories: [
        { category: 'Utilities', amount: 150000 },
        { category: 'Office Supplies', amount: 45000 },
        { category: 'Fuel', amount: 80000 }
      ]
    },

    cashFlow: {
      openingFloat: 500000,
      cashIn: 4200000,
      cashOut: 275000,
      closingCash: 4425000,
      variance: -3000
    },

    hourlyBreakdown: [
      { hour: '08:00-09:00', sales: 450000, transactions: 5 },
      { hour: '09:00-10:00', sales: 680000, transactions: 8 },
      { hour: '10:00-11:00', sales: 920000, transactions: 12 },
      { hour: '11:00-12:00', sales: 1150000, transactions: 15 },
      { hour: '12:00-13:00', sales: 1580000, transactions: 18 },
      { hour: '13:00-14:00', sales: 1420000, transactions: 16 },
      { hour: '14:00-15:00', sales: 1680000, transactions: 14 },
      { hour: '15:00-16:00', sales: 1950000, transactions: 13 },
      { hour: '16:00-17:00', sales: 1820000, transactions: 9 },
      { hour: '17:00-18:00', sales: 1350000, transactions: 5 }
    ]
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getPerformanceColor = (performance) => {
    const colors = {
      excellent: 'bg-green-200 border text-green-700',
      good: 'bg-blue-200 border text-blue-700',
      average: 'bg-yellow-200 border text-yellow-700',
      poor: 'bg-red-200 border text-red-700'
    };
    return colors[performance] || colors.average;
  };

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-3xl'>Daily Reports</h2>
        <div className='flex items-center gap-2'>
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className='border border-gray-400 rounded px-3 py-1 text-xs font-semibold uppercase focus:border-blue-500 focus:outline-none'
          >
            <option value='daily'>Daily Report</option>
            <option value='shift'>Shift Report</option>
            <option value='weekly'>Weekly Summary</option>
            <option value='monthly'>Monthly Summary</option>
          </select>

          <div className='flex items-center gap-1 border border-gray-400 rounded px-2 py-1'>
            <MdCalendarToday className='text-gray-500' size={14} />
            <input 
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='text-xs focus:outline-none'
            />
          </div>

          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className='border border-gray-400 rounded px-3 py-1 text-xs font-semibold uppercase focus:border-blue-500 focus:outline-none'
          >
            <option value='today'>Today</option>
            <option value='yesterday'>Yesterday</option>
            <option value='this-week'>This Week</option>
            <option value='last-week'>Last Week</option>
            <option value='this-month'>This Month</option>
            <option value='last-month'>Last Month</option>
          </select>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <div className='flex space-x-2'>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className='border text-green-500 hover:bg-green-500 hover:text-gray-50 text-xs flex items-center space-x-1 px-2'
          >
            <FiFilter/> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
            <BiRefresh/> Refresh
          </button>
        </div>
        <div className='flex space-x-2'>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
            <FaDownload/> Export PDF
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
            <FaDownload/> Export Excel
          </button>
          <button className='border text-gray-50 bg-gray-500 hover:bg-gray-50 hover:text-gray-500 text-xs flex items-center space-x-1 py-1 px-3'>
            <FaPrint/> Print
          </button>
        </div>
      </div>

      <hr className='text-gray-400' />

      {/* Report Header */}
      <div className='bg-white border border-gray-300 rounded shadow p-4'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='font-bold text-xl'>{reportData.branch}</h3>
            <p className='text-sm text-gray-600'>{reportData.date}</p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-gray-600'>Report Type</p>
            <p className='font-bold text-sm uppercase'>{reportType} Report</p>
          </div>
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div className='grid grid-cols-5 gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 mb-1 uppercase'>Total Sales</p>
          <p className='text-2xl font-bold text-blue-600'>{formatCurrency(reportData.salesSummary.totalSales)}</p>
          <p className='text-xs text-gray-600 mt-1'>{reportData.salesSummary.transactions} transactions</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 mb-1 uppercase'>Cash</p>
          <p className='text-xl font-bold text-green-600'>{formatCurrency(reportData.salesSummary.cash)}</p>
          <p className='text-xs text-gray-600 mt-1'>{((reportData.salesSummary.cash / reportData.salesSummary.totalSales) * 100).toFixed(1)}%</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 mb-1 uppercase'>MOMO</p>
          <p className='text-xl font-bold text-purple-600'>{formatCurrency(reportData.salesSummary.momo)}</p>
          <p className='text-xs text-gray-600 mt-1'>{((reportData.salesSummary.momo / reportData.salesSummary.totalSales) * 100).toFixed(1)}%</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 mb-1 uppercase'>Card</p>
          <p className='text-xl font-bold text-blue-600'>{formatCurrency(reportData.salesSummary.card)}</p>
          <p className='text-xs text-gray-600 mt-1'>{((reportData.salesSummary.card / reportData.salesSummary.totalSales) * 100).toFixed(1)}%</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 mb-1 uppercase'>Target</p>
          <p className='text-xl font-bold text-gray-800'>{reportData.salesSummary.achievement}%</p>
          <p className='text-xs text-gray-600 mt-1'>{formatCurrency(reportData.salesSummary.target)} target</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        {/* Cashier Performance */}
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>Cashier Performance</h3>
          </div>
          <div className='p-4'>
            <table className='w-full text-xs'>
              <thead className='border-b-2 border-gray-300'>
                <tr>
                  <th className='text-left py-1 px-2'>Cashier</th>
                  <th className='text-right py-1 px-2'>Sales</th>
                  <th className='text-center py-1 px-2'>Trans.</th>
                  <th className='text-right py-1 px-2'>Avg</th>
                  <th className='text-center py-1 px-2'>Variance</th>
                  <th className='text-center py-1 px-2'>Rating</th>
                </tr>
              </thead>
              <tbody>
                {reportData.cashierPerformance.map((cashier, idx) => (
                  <tr key={idx} className='border-b border-gray-200'>
                    <td className='py-2 px-2'>
                      <div className='font-semibold'>{cashier.name}</div>
                      <div className='text-gray-600'>{cashier.register}</div>
                    </td>
                    <td className='text-right py-2 px-2 font-semibold'>{formatCurrency(cashier.sales)}</td>
                    <td className='text-center py-2 px-2'>{cashier.transactions}</td>
                    <td className='text-right py-2 px-2'>{formatCurrency(cashier.avgTransaction)}</td>
                    <td className='text-center py-2 px-2'>
                      <span className={`font-semibold ${cashier.variance < 0 ? 'text-red-600' : cashier.variance > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {cashier.variance === 0 ? '0' : `${cashier.variance < 0 ? '-' : '+'}${formatCurrency(Math.abs(cashier.variance))}`}
                      </span>
                    </td>
                    <td className='text-center py-2 px-2'>
                      <span className={`${getPerformanceColor(cashier.performance)} text-2xs p-1 font-semibold capitalize`}>
                        {cashier.performance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>Top Selling Products</h3>
          </div>
          <div className='p-4'>
            <table className='w-full text-xs'>
              <thead className='border-b-2 border-gray-300'>
                <tr>
                  <th className='text-left py-1 px-2'>Product</th>
                  <th className='text-center py-1 px-2'>Qty</th>
                  <th className='text-right py-1 px-2'>Revenue</th>
                  <th className='text-right py-1 px-2'>Profit</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topProducts.map((product, idx) => (
                  <tr key={idx} className='border-b border-gray-200'>
                    <td className='py-2 px-2 font-semibold'>{product.product}</td>
                    <td className='text-center py-2 px-2'>{product.quantity}</td>
                    <td className='text-right py-2 px-2 font-semibold'>{formatCurrency(product.revenue)}</td>
                    <td className='text-right py-2 px-2 text-green-600 font-semibold'>{formatCurrency(product.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hourly Breakdown */}
      <div className='bg-white border border-gray-300 rounded shadow'>
        <div className='p-4 bg-gray-100 border-b border-gray-300'>
          <h3 className='font-bold text-sm uppercase'>Hourly Sales Breakdown</h3>
        </div>
        <div className='p-4 overflow-x-auto'>
          <table className='w-full text-xs'>
            <thead className='border-b-2 border-gray-300'>
              <tr>
                {reportData.hourlyBreakdown.map((hour, idx) => (
                  <th key={idx} className='text-center py-1 px-2'>{hour.hour}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className='border-b border-gray-200'>
                {reportData.hourlyBreakdown.map((hour, idx) => (
                  <td key={idx} className='text-center py-2 px-2'>
                    <div className='font-bold text-blue-600'>{formatCurrency(hour.sales)}</div>
                    <div className='text-gray-600'>{hour.transactions} trans</div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        {/* Expenses */}
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>Expenses Summary</h3>
          </div>
          <div className='p-4'>
            <div className='mb-4'>
              <p className='text-xs text-gray-600 mb-1'>Total Expenses</p>
              <p className='text-2xl font-bold text-red-600'>{formatCurrency(reportData.expenses.total)}</p>
            </div>
            <table className='w-full text-xs'>
              <thead className='border-b-2 border-gray-300'>
                <tr>
                  <th className='text-left py-1 px-2'>Category</th>
                  <th className='text-right py-1 px-2'>Amount</th>
                  <th className='text-right py-1 px-2'>%</th>
                </tr>
              </thead>
              <tbody>
                {reportData.expenses.categories.map((expense, idx) => (
                  <tr key={idx} className='border-b border-gray-200'>
                    <td className='py-2 px-2 font-semibold'>{expense.category}</td>
                    <td className='text-right py-2 px-2 font-semibold'>{formatCurrency(expense.amount)}</td>
                    <td className='text-right py-2 px-2 text-gray-600'>{((expense.amount / reportData.expenses.total) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash Flow */}
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>Cash Flow Summary</h3>
          </div>
          <div className='p-4'>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between py-2 border-b border-gray-200'>
                <span className='text-gray-600'>Opening Float:</span>
                <span className='font-bold'>{formatCurrency(reportData.cashFlow.openingFloat)}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-200'>
                <span className='text-gray-600'>Cash In (Sales):</span>
                <span className='font-bold text-green-600'>+{formatCurrency(reportData.cashFlow.cashIn)}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-200'>
                <span className='text-gray-600'>Cash Out (Expenses):</span>
                <span className='font-bold text-red-600'>-{formatCurrency(reportData.cashFlow.cashOut)}</span>
              </div>
              <div className='flex justify-between py-2 border-b-2 border-gray-400'>
                <span className='font-bold'>Closing Cash:</span>
                <span className='font-bold text-lg'>{formatCurrency(reportData.cashFlow.closingCash)}</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='font-bold'>Overall Variance:</span>
                <span className={`font-bold ${reportData.cashFlow.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {reportData.cashFlow.variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(reportData.cashFlow.variance))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='bg-blue-50 border border-blue-300 rounded shadow p-4'>
        <h3 className='font-bold text-sm uppercase text-blue-800 mb-3'>Key Metrics</h3>
        <div className='grid grid-cols-4 gap-4 text-xs'>
          <div className='bg-white p-3 rounded'>
            <p className='text-gray-600 mb-1'>Avg Transaction Value</p>
            <p className='font-bold text-lg'>{formatCurrency(reportData.salesSummary.averageTransaction)}</p>
          </div>
          <div className='bg-white p-3 rounded'>
            <p className='text-gray-600 mb-1'>Gross Profit</p>
            <p className='font-bold text-lg text-green-600'>{formatCurrency(reportData.topProducts.reduce((sum, p) => sum + p.profit, 0))}</p>
          </div>
          <div className='bg-white p-3 rounded'>
            <p className='text-gray-600 mb-1'>Net Cash Position</p>
            <p className='font-bold text-lg'>{formatCurrency(reportData.cashFlow.closingCash - reportData.cashFlow.openingFloat)}</p>
          </div>
          <div className='bg-white p-3 rounded'>
            <p className='text-gray-600 mb-1'>Target Achievement</p>
            <p className={`font-bold text-lg ${reportData.salesSummary.achievement >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {reportData.salesSummary.achievement}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}