import React, { useState } from 'react';
import { BiSearch, BiRefresh, BiChevronUp } from 'react-icons/bi';
import { FaStore, FaChartBar, FaTrophy } from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload } from 'react-icons/fa6';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

export default function BranchComparison() {
  const [timePeriod, setTimePeriod] = useState('this_month');
  const [metricType, setMetricType] = useState('sales');
  const [selectedBranches, setSelectedBranches] = useState(['all']);
  const [viewMode, setViewMode] = useState('cards');
  const [collapsedCards, setCollapsedCards] = useState({
    summary: false,
    comparison: false,
    insights: false
  });

  // Mock data
  const branches = [
    {
      id: 1,
      name: 'Downtown Store',
      code: 'DT-001',
      manager: 'Jane Smith',
      sales: {
        today: 13000000,
        week: 78000000,
        month: 312000000
      },
      transactions: {
        today: 115,
        week: 690,
        month: 2760
      },
      variance: {
        total: -18000,
        count: 8
      },
      staff: 8,
      activeStaff: 5,
      profit: 46800000,
      profitMargin: 15,
      expenses: 8500000,
      avgTransaction: 113043,
      rating: 'excellent',
      trend: 'up',
      performance: 95
    },
    {
      id: 2,
      name: 'Uptown Branch',
      code: 'UT-002',
      manager: 'Michael Brown',
      sales: {
        today: 8500000,
        week: 51000000,
        month: 204000000
      },
      transactions: {
        today: 85,
        week: 510,
        month: 2040
      },
      variance: {
        total: -12000,
        count: 5
      },
      staff: 6,
      activeStaff: 4,
      profit: 30600000,
      profitMargin: 15,
      expenses: 6200000,
      avgTransaction: 100000,
      rating: 'good',
      trend: 'up',
      performance: 82
    },
    {
      id: 3,
      name: 'Mall Outlet',
      code: 'ML-003',
      manager: 'Sarah Johnson',
      sales: {
        today: 15500000,
        week: 93000000,
        month: 372000000
      },
      transactions: {
        today: 155,
        week: 930,
        month: 3720
      },
      variance: {
        total: -25000,
        count: 12
      },
      staff: 10,
      activeStaff: 7,
      profit: 55800000,
      profitMargin: 15,
      expenses: 11200000,
      avgTransaction: 100000,
      rating: 'excellent',
      trend: 'up',
      performance: 98
    },
    {
      id: 4,
      name: 'Airport Store',
      code: 'AP-004',
      manager: 'David Wilson',
      sales: {
        today: 6200000,
        week: 37200000,
        month: 148800000
      },
      transactions: {
        today: 62,
        week: 372,
        month: 1488
      },
      variance: {
        total: 5000,
        count: 2
      },
      staff: 4,
      activeStaff: 3,
      profit: 22320000,
      profitMargin: 15,
      expenses: 4800000,
      avgTransaction: 100000,
      rating: 'good',
      trend: 'stable',
      performance: 75
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
    return <span className='text-gray-400 text-lg'>━</span>;
  };

  const getSalesForPeriod = (branch) => {
    if (timePeriod === 'today') return branch.sales.today;
    if (timePeriod === 'this_week') return branch.sales.week;
    return branch.sales.month;
  };

  const getTransactionsForPeriod = (branch) => {
    if (timePeriod === 'today') return branch.transactions.today;
    if (timePeriod === 'this_week') return branch.transactions.week;
    return branch.transactions.month;
  };

  const getMetricValue = (branch) => {
    if (metricType === 'sales') return getSalesForPeriod(branch);
    if (metricType === 'profit') return branch.profit;
    if (metricType === 'transactions') return getTransactionsForPeriod(branch);
    if (metricType === 'variance') return Math.abs(branch.variance.total);
    return branch.performance;
  };

  const getFilteredBranches = () => {
    if (selectedBranches.includes('all')) return branches;
    return branches.filter(b => selectedBranches.includes(b.id.toString()));
  };

  const handleBranchSelect = (branchId) => {
    if (branchId === 'all') {
      setSelectedBranches(['all']);
    } else {
      const newSelection = selectedBranches.includes('all')
        ? [branchId]
        : selectedBranches.includes(branchId)
        ? selectedBranches.filter(id => id !== branchId)
        : [...selectedBranches, branchId];
      
      setSelectedBranches(newSelection.length === 0 ? ['all'] : newSelection);
    }
  };

  const toggleCard = (cardName) => {
    setCollapsedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  const totalSales = branches.reduce((sum, b) => sum + getSalesForPeriod(b), 0);
  const totalProfit = branches.reduce((sum, b) => sum + b.profit, 0);
  const totalTransactions = branches.reduce((sum, b) => sum + getTransactionsForPeriod(b), 0);
  const totalStaff = branches.reduce((sum, b) => sum + b.staff, 0);
  const topPerformer = [...branches].sort((a, b) => b.performance - a.performance)[0];

  const filteredBranches = getFilteredBranches();

  // Prepare chart data
  const chartData = filteredBranches.map(branch => ({
    name: branch.name,
    sales: getSalesForPeriod(branch),
    profit: branch.profit,
    transactions: getTransactionsForPeriod(branch),
    performance: branch.performance,
    variance: Math.abs(branch.variance.total),
    rating: branch.rating
  }));


  const BranchCard = ({ branch }) => (
    <div className='bg-white border border-gray-300 rounded shadow hover:shadow-lg transition-shadow'>
      <div className='p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
        <div className='flex justify-between items-start mb-2'>
          <div className='min-w-0'>
            <h3 className='font-bold text-base sm:text-lg truncate'>{branch.name}</h3>
            <p className='text-xs sm:text-sm opacity-90'>{branch.code}</p>
          </div>
          {branch.id === topPerformer.id && (
            <FaTrophy className='text-yellow-300 flex-shrink-0' size={20} />
          )}
        </div>
        <p className='text-xs sm:text-sm truncate'>Manager: {branch.manager}</p>
      </div>

      <div className='p-3 sm:p-4 space-y-3'>
        <div className='bg-blue-50 border border-blue-200 p-2 sm:p-3 rounded'>
          <p className='text-2xs text-gray-600 mb-1 uppercase'>Sales ({timePeriod.replace('_', ' ')})</p>
          <p className='font-bold text-lg sm:text-xl text-blue-700 truncate'>RWF {formatCurrency(getSalesForPeriod(branch))}</p>
          <p className='text-2xs text-gray-600 mt-1'>{getTransactionsForPeriod(branch)} transactions</p>
        </div>

        <div className='grid grid-cols-3 gap-2 text-xs'>
          <div className='bg-gray-50 p-2 rounded text-center'>
            <p className='text-gray-600 mb-1 truncate'>Profit</p>
            <p className='font-bold text-green-600 truncate'>{formatCurrency(branch.profit)}</p>
          </div>
          <div className='bg-gray-50 p-2 rounded text-center'>
            <p className='text-gray-600 mb-1 truncate'>Margin</p>
            <p className='font-bold'>{branch.profitMargin}%</p>
          </div>
          <div className='bg-gray-50 p-2 rounded text-center'>
            <p className='text-gray-600 mb-1 truncate'>Staff</p>
            <p className='font-bold'>{branch.activeStaff}/{branch.staff}</p>
          </div>
        </div>

        <div className='flex items-center justify-between pt-2 border-t border-gray-200'>
          <div className='flex items-center gap-2'>
            {getTrendIcon(branch.trend)}
            <span className={`${getRatingColor(branch.rating)} px-2 py-0.5 rounded text-2xs font-semibold capitalize`}>
              {branch.rating}
            </span>
          </div>
          <div className='text-right'>
            <p className='text-2xs text-gray-600'>Performance</p>
            <p className='font-bold text-lg'>{branch.performance}%</p>
          </div>
        </div>

        <button className='w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-xs font-semibold'>
          View Details →
        </button>
      </div>
    </div>
  );

  return (
    <div className='p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
        <div>
          <h2 className='font-bold text-xl sm:text-2xl lg:text-3xl'>Branch Comparison</h2>
          <p className='text-xs sm:text-sm text-gray-600 mt-1'>Compare performance across all locations</p>
        </div>
        <div className='flex gap-2'>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-2 sm:px-3 py-1'>
            <FaDownload size={12} /> <span className='hidden sm:inline'>Export</span>
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-2 sm:px-3 py-1'>
            <FaPrint size={12} /> <span className='hidden sm:inline'>Print</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-3 sm:p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaStore className='text-blue-600 flex-shrink-0' size={16} />
            <p className='text-2xs sm:text-xs text-gray-600 uppercase truncate'>Total Branches</p>
          </div>
          <p className='text-xl sm:text-2xl font-bold'>{branches.length}</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-3 sm:p-4'>
          <p className='text-2xs sm:text-xs text-gray-600 uppercase mb-1 truncate'>Total Sales</p>
          <p className='text-base sm:text-xl font-bold text-blue-600 truncate'>RWF {formatCurrency(totalSales)}</p>
          <p className='text-2xs text-gray-600 mt-1 truncate'>{timePeriod.replace('_', ' ')}</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-3 sm:p-4'>
          <p className='text-2xs sm:text-xs text-gray-600 uppercase mb-1 truncate'>Total Profit</p>
          <p className='text-base sm:text-xl font-bold text-green-600 truncate'>RWF {formatCurrency(totalProfit)}</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-3 sm:p-4'>
          <p className='text-2xs sm:text-xs text-gray-600 uppercase mb-1 truncate'>Total Staff</p>
          <p className='text-xl sm:text-2xl font-bold'>{totalStaff}</p>
          <p className='text-2xs text-gray-600 mt-1 truncate'>Across all branches</p>
        </div>

        <div className='bg-gradient-to-r from-yellow-400 to-orange-500 rounded shadow p-3 sm:p-4 text-white col-span-2 sm:col-span-1'>
          <div className='flex items-center gap-2 mb-1'>
            <FaTrophy size={16} className='flex-shrink-0' />
            <p className='text-2xs sm:text-xs uppercase truncate'>Top Performer</p>
          </div>
          <p className='text-base sm:text-lg font-bold truncate'>{topPerformer.name}</p>
          <p className='text-2xs sm:text-xs truncate'>{topPerformer.performance}% performance</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-3'>
        <div className='flex flex-wrap gap-2'>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className='border border-gray-400 rounded px-2 sm:px-3 py-1 text-xs font-semibold focus:border-blue-500 focus:outline-none'
          >
            <option value='today'>Today</option>
            <option value='this_week'>This Week</option>
            <option value='this_month'>This Month</option>
          </select>

          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value)}
            className='border border-gray-400 rounded px-2 sm:px-3 py-1 text-xs font-semibold focus:border-blue-500 focus:outline-none'
          >
            <option value='sales'>Sales</option>
            <option value='profit'>Profit</option>
            <option value='transactions'>Transactions</option>
            <option value='performance'>Performance</option>
            <option value='variance'>Variance</option>
          </select>

          <div className='flex gap-1 border border-gray-400 rounded'>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2 sm:px-3 py-1 text-xs font-semibold ${viewMode === 'cards' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 sm:px-3 py-1 text-xs font-semibold ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Table
            </button>
          </div>

          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-2 sm:px-3 py-1'>
            <BiRefresh size={14} /> <span className='hidden sm:inline'>Refresh</span>
          </button>
        </div>

        <div className='flex flex-wrap gap-2'>
          <label className='flex items-center gap-1 text-xs'>
            <input
              type='checkbox'
              checked={selectedBranches.includes('all')}
              onChange={() => handleBranchSelect('all')}
              className='w-4 h-4'
            />
            <span className='truncate'>All Branches</span>
          </label>
          {branches.map(branch => (
            <label key={branch.id} className='flex items-center gap-1 text-xs'>
              <input
                type='checkbox'
                checked={selectedBranches.includes(branch.id.toString()) || selectedBranches.includes('all')}
                onChange={() => handleBranchSelect(branch.id.toString())}
                className='w-4 h-4'
              />
              <span className='truncate'>{branch.name}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className='text-gray-400' />

      {/* Branch Cards or Table */}
      {viewMode === 'cards' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
          {filteredBranches.map(branch => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      ) : (
        <div className='bg-white overflow-x-auto'>
          <table className='w-full table-auto text-gray-500 text-xs'>
            <thead className='border-b-4 border-gray-300'>
              <tr>
                <th className='text-left py-2 px-2 sm:px-3'>Branch</th>
                <th className='text-right py-2 px-2 sm:px-3'>Sales</th>
                <th className='text-center py-2 px-2 sm:px-3'>Trans.</th>
                <th className='text-right py-2 px-2 sm:px-3'>Profit</th>
                <th className='text-center py-2 px-2 sm:px-3 hidden sm:table-cell'>Margin</th>
                <th className='text-right py-2 px-2 sm:px-3 hidden md:table-cell'>Variance</th>
                <th className='text-center py-2 px-2 sm:px-3 hidden lg:table-cell'>Staff</th>
                <th className='text-center py-2 px-2 sm:px-3'>Perf.</th>
                <th className='text-center py-2 px-2 sm:px-3 hidden md:table-cell'>Rating</th>
                <th className='text-center py-2 px-2 sm:px-3 hidden lg:table-cell'>Trend</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map(branch => (
                <tr key={branch.id} className='border-b border-gray-300 hover:bg-gray-50'>
                  <td className='py-3 px-2 sm:px-3'>
                    <div>
                      <p className='font-bold truncate'>{branch.name}</p>
                      <p className='text-gray-600 truncate'>{branch.code} • {branch.manager}</p>
                    </div>
                  </td>
                  <td className='text-right py-3 px-2 sm:px-3 font-bold'>{formatCurrency(getSalesForPeriod(branch))}</td>
                  <td className='text-center py-3 px-2 sm:px-3'>{getTransactionsForPeriod(branch)}</td>
                  <td className='text-right py-3 px-2 sm:px-3 font-semibold text-green-600'>{formatCurrency(branch.profit)}</td>
                  <td className='text-center py-3 px-2 sm:px-3 font-semibold hidden sm:table-cell'>{branch.profitMargin}%</td>
                  <td className='text-right py-3 px-2 sm:px-3 hidden md:table-cell'>
                    <span className={`font-bold ${branch.variance.total < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {branch.variance.total < 0 ? '-' : '+'}RWF {formatCurrency(Math.abs(branch.variance.total))}
                    </span>
                  </td>
                  <td className='text-center py-3 px-2 sm:px-3 hidden lg:table-cell'>{branch.activeStaff}/{branch.staff}</td>
                  <td className='text-center py-3 px-2 sm:px-3 font-bold text-base sm:text-lg'>{branch.performance}%</td>
                  <td className='text-center py-3 px-2 sm:px-3 hidden md:table-cell'>
                    <span className={`${getRatingColor(branch.rating)} px-2 py-0.5 rounded text-2xs font-semibold capitalize`}>
                      {branch.rating}
                    </span>
                  </td>
                  <td className='text-center py-3 px-2 sm:px-3 hidden lg:table-cell'>{getTrendIcon(branch.trend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Comparison Chart */}
        {/* Comparison Chart */}
      <div className='bg-white border border-gray-300 rounded shadow'>
        <div className='p-3 sm:p-4 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <FaChartBar className='text-blue-600' size={16} />
            <h3 className='font-bold text-sm sm:text-base'>Branch Comparison - {metricType.charAt(0).toUpperCase() + metricType.slice(1)}</h3>
          </div>
          <button 
            onClick={() => toggleCard('comparison')}
            className="transition-transform duration-300 flex-shrink-0"
            style={{ transform: collapsedCards.comparison ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <BiChevronUp size={20} className="sm:w-6 sm:h-6 text-gray-600"/>
          </button>
        </div>
        <div className="bg-gray-200 h-1"></div>
        
        <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.comparison ? 'max-h-0' : 'max-h-[1000px]'}`}>
          <div className='p-3 grid grid-cols-2 sm:p-4'>
            <div className='h-64 sm:h-80 p-6'>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis 
                    fontSize={12}
                    tickFormatter={(value) => {
                      if (metricType === 'sales' || metricType === 'profit' || metricType === 'variance') {
                        return `RWF ${(value / 1000000).toFixed(1)}M`;
                      }
                      return value;
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => {
                      if (metricType === 'sales' || metricType === 'profit' || metricType === 'variance') {
                        return [`RWF ${value.toLocaleString()}`, metricType.charAt(0).toUpperCase() + metricType.slice(1)];
                      }
                      return [value, metricType.charAt(0).toUpperCase() + metricType.slice(1)];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey={metricType} 
                    fill="#3b82f6"
                    name={metricType.charAt(0).toUpperCase() + metricType.slice(1)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === topPerformer.name ? '#f59e0b' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Alternative: Line chart for trends */}
            <div className='border-l border-gray-200 p-6'>
              <h4 className='font-semibold text-sm mb-3 text-gray-700'>Performance Trend</h4>
              <div className='h-48'>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="performance" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Performance %"
                      dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className='bg-white border border-gray-300 rounded shadow'>
        <div className='p-3 sm:p-4 flex justify-between items-center'>
          <h3 className='font-bold text-sm sm:text-base uppercase'>Key Insights</h3>
          <button 
            onClick={() => toggleCard('insights')}
            className="transition-transform duration-300 flex-shrink-0"
            style={{ transform: collapsedCards.insights ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <BiChevronUp size={20} className="sm:w-6 sm:h-6"/>
          </button>
        </div>
        <div className="bg-gray-200 h-1 sm:h-2"></div>
        
        <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.insights ? 'max-h-0' : 'max-h-[500px]'}`}>
          <div className='p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
            <div className='bg-blue-50 border border-blue-200 rounded shadow p-3 sm:p-4'>
              <p className='font-bold text-xs sm:text-sm uppercase text-blue-800 mb-2 sm:mb-3'>💡 Highest Sales</p>
              <p className='text-base sm:text-lg font-bold truncate'>{[...branches].sort((a, b) => getSalesForPeriod(b) - getSalesForPeriod(a))[0].name}</p>
              <p className='text-xs sm:text-sm text-gray-700 truncate'>RWF {formatCurrency(Math.max(...branches.map(b => getSalesForPeriod(b))))}</p>
            </div>

            <div className='bg-green-50 border border-green-200 rounded shadow p-3 sm:p-4'>
              <p className='font-bold text-xs sm:text-sm uppercase text-green-800 mb-2 sm:mb-3'>💰 Best Profit Margin</p>
              <p className='text-base sm:text-lg font-bold truncate'>{[...branches].sort((a, b) => b.profitMargin - a.profitMargin)[0].name}</p>
              <p className='text-xs sm:text-sm text-gray-700'>{Math.max(...branches.map(b => b.profitMargin))}% margin</p>
            </div>

            <div className='bg-orange-50 border border-orange-200 rounded shadow p-3 sm:p-4'>
              <p className='font-bold text-xs sm:text-sm uppercase text-orange-800 mb-2 sm:mb-3'>⚠️ Needs Attention</p>
              <p className='text-base sm:text-lg font-bold truncate'>{[...branches].sort((a, b) => a.performance - b.performance)[0].name}</p>
              <p className='text-xs sm:text-sm text-gray-700'>{Math.min(...branches.map(b => b.performance))}% performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}