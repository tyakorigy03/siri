import React, { useState } from 'react';
import { BiSearch, BiRefresh } from 'react-icons/bi';
import { FaUsers, FaTrophy, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload } from 'react-icons/fa6';

export default function StaffPerformance() {
  const [timePeriod, setTimePeriod] = useState('this_month');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('sales');
  const [viewMode, setViewMode] = useState('grid'); // grid or table

  // Mock data
  const overviewStats = {
    totalStaff: 8,
    activeToday: 5,
    topPerformer: 'Sarah Lee',
    mostVariances: 'John Doe (3)',
    avgSales: 3200000,
    avgVariance: -2500
  };

  const staffData = [
    {
      id: 1,
      name: 'Mike Johnson',
      register: 'POS-01',
      photo: null,
      sales: {
        today: 4500000,
        week: 28500000,
        month: 115000000
      },
      transactions: {
        today: 45,
        week: 285,
        month: 1150
      },
      avgTransaction: 100000,
      variance: {
        total: -15000,
        count: 3,
        lastDate: '05/01/2026'
      },
      commission: 1150000,
      attendance: 98,
      rating: 'good',
      trend: 'up'
    },
    {
      id: 2,
      name: 'Sarah Lee',
      register: 'POS-02',
      photo: null,
      sales: {
        today: 3200000,
        week: 32000000,
        month: 128000000
      },
      transactions: {
        today: 32,
        week: 320,
        month: 1280
      },
      avgTransaction: 100000,
      variance: {
        total: 5000,
        count: 1,
        lastDate: '28/12/2025'
      },
      commission: 1280000,
      attendance: 100,
      rating: 'excellent',
      trend: 'up'
    },
    {
      id: 3,
      name: 'John Doe',
      register: 'POS-03',
      photo: null,
      sales: {
        today: 5300000,
        week: 26500000,
        month: 106000000
      },
      transactions: {
        today: 38,
        week: 265,
        month: 1060
      },
      avgTransaction: 139474,
      variance: {
        total: -8000,
        count: 5,
        lastDate: '05/01/2026'
      },
      commission: 1060000,
      attendance: 95,
      rating: 'average',
      trend: 'down'
    },
    {
      id: 4,
      name: 'Emma Davis',
      register: 'POS-04',
      photo: null,
      sales: {
        today: 0,
        week: 24500000,
        month: 98000000
      },
      transactions: {
        today: 0,
        week: 245,
        month: 980
      },
      avgTransaction: 100000,
      variance: {
        total: -3000,
        count: 2,
        lastDate: '03/01/2026'
      },
      commission: 980000,
      attendance: 92,
      rating: 'good',
      trend: 'stable'
    },
    {
      id: 5,
      name: 'James Wilson',
      register: 'POS-05',
      photo: null,
      sales: {
        today: 0,
        week: 18500000,
        month: 74000000
      },
      transactions: {
        today: 0,
        week: 185,
        month: 740
      },
      avgTransaction: 100000,
      variance: {
        total: 0,
        count: 0,
        lastDate: 'None'
      },
      commission: 740000,
      attendance: 100,
      rating: 'excellent',
      trend: 'up'
    }
  ];

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getRatingColor = (rating) => {
    const colors = {
      excellent: 'bg-green-200 text-green-700',
      good: 'bg-blue-200 text-blue-700',
      average: 'bg-yellow-200 text-yellow-700',
      poor: 'bg-red-200 text-red-700'
    };
    return colors[rating] || colors.average;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <MdTrendingUp className='text-green-600' size={20} />;
    if (trend === 'down') return <MdTrendingDown className='text-red-600' size={20} />;
    return <span className='text-gray-400'>━</span>;
  };

  const getSalesForPeriod = (staff) => {
    if (timePeriod === 'today') return staff.sales.today;
    if (timePeriod === 'this_week') return staff.sales.week;
    return staff.sales.month;
  };

  const getTransactionsForPeriod = (staff) => {
    if (timePeriod === 'today') return staff.transactions.today;
    if (timePeriod === 'this_week') return staff.transactions.week;
    return staff.transactions.month;
  };

  const filteredStaff = staffData
    .filter(staff => 
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.register.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'sales') return getSalesForPeriod(b) - getSalesForPeriod(a);
      if (sortBy === 'variance') return a.variance.total - b.variance.total;
      if (sortBy === 'transactions') return getTransactionsForPeriod(b) - getTransactionsForPeriod(a);
      if (sortBy === 'rating') {
        const ratings = { excellent: 4, good: 3, average: 2, poor: 1 };
        return ratings[b.rating] - ratings[a.rating];
      }
      return 0;
    });

  const StaffCard = ({ staff }) => (
    <div className='bg-white border border-gray-300 rounded shadow hover:shadow-lg transition-shadow'>
      <div className='p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold'>
            {staff.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className='font-bold text-sm'>{staff.name}</p>
            <p className='text-xs text-gray-600'>{staff.register}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {getTrendIcon(staff.trend)}
          <span className={`${getRatingColor(staff.rating)} px-2 py-0.5 rounded text-2xs font-semibold capitalize`}>
            {staff.rating}
          </span>
        </div>
      </div>

      <div className='p-4 space-y-3'>
        <div className='bg-blue-50 border border-blue-200 p-2 rounded'>
          <p className='text-2xs text-gray-600 mb-1 uppercase'>Sales ({timePeriod.replace('_', ' ')})</p>
          <p className='font-bold text-lg text-blue-700'>RWF {formatCurrency(getSalesForPeriod(staff))}</p>
          <p className='text-2xs text-gray-600'>{getTransactionsForPeriod(staff)} transactions</p>
        </div>

        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div className='bg-gray-50 p-2 rounded'>
            <p className='text-gray-600 mb-1'>Avg Transaction</p>
            <p className='font-semibold'>{formatCurrency(staff.avgTransaction)}</p>
          </div>
          <div className='bg-gray-50 p-2 rounded'>
            <p className='text-gray-600 mb-1'>Commission</p>
            <p className='font-semibold text-green-600'>{formatCurrency(staff.commission)}</p>
          </div>
          <div className={`p-2 rounded ${staff.variance.total < 0 ? 'bg-red-50 border border-red-200' : staff.variance.total > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <p className='text-gray-600 mb-1'>Total Variance</p>
            <p className={`font-bold ${staff.variance.total < 0 ? 'text-red-600' : staff.variance.total > 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {staff.variance.total === 0 ? 'None' : `${staff.variance.total < 0 ? '-' : '+'}${formatCurrency(Math.abs(staff.variance.total))}`}
            </p>
            <p className='text-2xs text-gray-600'>{staff.variance.count} incidents</p>
          </div>
          <div className='bg-gray-50 p-2 rounded'>
            <p className='text-gray-600 mb-1'>Attendance</p>
            <p className='font-semibold'>{staff.attendance}%</p>
          </div>
        </div>

        <button className='w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-xs font-semibold'>
          View Details →
        </button>
      </div>
    </div>
  );

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Staff Performance</h2>
          <p className='text-sm text-gray-600 mt-1'>Monitor and evaluate cashier performance</p>
        </div>
        <div className='flex gap-2'>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <FaDownload size={12} /> Export
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <FaPrint size={12} /> Print
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className='grid grid-cols-6 gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaUsers className='text-blue-600' size={20} />
            <p className='text-xs text-gray-600 uppercase'>Total Staff</p>
          </div>
          <p className='text-2xl font-bold'>{overviewStats.totalStaff}</p>
          <p className='text-xs text-gray-600'>{overviewStats.activeToday} active today</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaTrophy className='text-yellow-600' size={20} />
            <p className='text-xs text-gray-600 uppercase'>Top Performer</p>
          </div>
          <p className='text-lg font-bold'>{overviewStats.topPerformer}</p>
          <p className='text-xs text-gray-600'>This month</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaExclamationTriangle className='text-red-600' size={18} />
            <p className='text-xs text-gray-600 uppercase'>Most Variances</p>
          </div>
          <p className='text-sm font-bold text-red-600'>{overviewStats.mostVariances}</p>
          <p className='text-xs text-gray-600'>This month</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaChartLine className='text-green-600' size={18} />
            <p className='text-xs text-gray-600 uppercase'>Avg Sales/Staff</p>
          </div>
          <p className='text-lg font-bold'>{formatCurrency(overviewStats.avgSales)}</p>
          <p className='text-xs text-gray-600'>Per month</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <MdTrendingDown className='text-orange-600' size={20} />
            <p className='text-xs text-gray-600 uppercase'>Avg Variance</p>
          </div>
          <p className='text-lg font-bold text-orange-600'>-{formatCurrency(Math.abs(overviewStats.avgVariance))}</p>
          <p className='text-xs text-gray-600'>Per staff</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaUsers className='text-purple-600' size={18} />
            <p className='text-xs text-gray-600 uppercase'>Avg Attendance</p>
          </div>
          <p className='text-2xl font-bold text-purple-600'>96%</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className='flex justify-between items-center'>
        <div className='flex gap-2'>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className='border border-gray-400 rounded px-3 py-1 text-xs font-semibold focus:border-blue-500 focus:outline-none'
          >
            <option value='today'>Today</option>
            <option value='this_week'>This Week</option>
            <option value='this_month'>This Month</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className='border border-gray-400 rounded px-3 py-1 text-xs font-semibold focus:border-blue-500 focus:outline-none'
          >
            <option value='sales'>Sort by Sales</option>
            <option value='variance'>Sort by Variance</option>
            <option value='transactions'>Sort by Transactions</option>
            <option value='rating'>Sort by Rating</option>
          </select>

          <div className='flex gap-1 border border-gray-400 rounded'>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-semibold ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Table
            </button>
          </div>

          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <BiRefresh size={14} /> Refresh
          </button>
        </div>

        <div className='relative flex items-center'>
          <input
            type='text'
            placeholder='Search staff...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px] text-xs'
          />
          <BiSearch className='text-gray-500 relative left-[-5px]' />
        </div>
      </div>

      <hr className='text-gray-400' />

      {/* Staff Grid/Table View */}
      {viewMode === 'grid' ? (
        <div className='grid grid-cols-3 gap-4'>
          {filteredStaff.map(staff => (
            <StaffCard key={staff.id} staff={staff} />
          ))}
        </div>
      ) : (
        <div className='bg-white overflow-x-auto'>
          <table className='w-full table-auto text-gray-500 text-xs'>
            <thead className='border-b-4 border-gray-300'>
              <tr>
                <th className='text-left py-2 px-3'>Staff</th>
                <th className='text-right py-2 px-3'>Sales</th>
                <th className='text-center py-2 px-3'>Trans.</th>
                <th className='text-right py-2 px-3'>Avg/Trans</th>
                <th className='text-right py-2 px-3'>Variance</th>
                <th className='text-right py-2 px-3'>Commission</th>
                <th className='text-center py-2 px-3'>Attendance</th>
                <th className='text-center py-2 px-3'>Rating</th>
                <th className='text-center py-2 px-3'>Trend</th>
                <th className='text-center py-2 px-3'>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(staff => (
                <tr key={staff.id} className='border-b border-gray-300 hover:bg-gray-50'>
                  <td className='py-3 px-3'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className='font-bold'>{staff.name}</p>
                        <p className='text-gray-600'>{staff.register}</p>
                      </div>
                    </div>
                  </td>
                  <td className='text-right py-3 px-3 font-bold'>{formatCurrency(getSalesForPeriod(staff))}</td>
                  <td className='text-center py-3 px-3'>{getTransactionsForPeriod(staff)}</td>
                  <td className='text-right py-3 px-3'>{formatCurrency(staff.avgTransaction)}</td>
                  <td className='text-right py-3 px-3'>
                    <span className={`font-bold ${staff.variance.total < 0 ? 'text-red-600' : staff.variance.total > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {staff.variance.total === 0 ? '0' : `${staff.variance.total < 0 ? '-' : '+'}${formatCurrency(Math.abs(staff.variance.total))}`}
                    </span>
                  </td>
                  <td className='text-right py-3 px-3 font-semibold text-green-600'>{formatCurrency(staff.commission)}</td>
                  <td className='text-center py-3 px-3'>{staff.attendance}%</td>
                  <td className='text-center py-3 px-3'>
                    <span className={`${getRatingColor(staff.rating)} px-2 py-0.5 rounded text-2xs font-semibold capitalize`}>
                      {staff.rating}
                    </span>
                  </td>
                  <td className='text-center py-3 px-3'>{getTrendIcon(staff.trend)}</td>
                  <td className='text-center py-3 px-3'>
                    <button className='text-blue-600 hover:text-blue-800 text-xs font-semibold'>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Performance Comparison Chart */}
      <div className='bg-white border border-gray-300 rounded shadow'>
        <div className='p-4 bg-gray-100 border-b border-gray-300'>
          <h3 className='font-bold text-sm uppercase'>Sales Comparison</h3>
        </div>
        <div className='p-4'>
          <div className='space-y-3'>
            {filteredStaff.map(staff => {
              const maxSales = Math.max(...filteredStaff.map(s => getSalesForPeriod(s)));
              const percentage = (getSalesForPeriod(staff) / maxSales) * 100;
              return (
                <div key={staff.id}>
                  <div className='flex justify-between items-center mb-1 text-xs'>
                    <span className='font-semibold'>{staff.name}</span>
                    <span className='font-bold'>RWF {formatCurrency(getSalesForPeriod(staff))}</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-4'>
                    <div
                      className='bg-blue-500 h-4 rounded-full transition-all duration-500'
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}