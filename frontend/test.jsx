import React, { useState } from 'react';
import { BiSearch, BiRefresh, BiChevronUp } from 'react-icons/bi';
import { FaStore, FaChartBar, FaTrophy, FaChartLine } from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload } from 'react-icons/fa6';

// Import Chart components
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
      excellent: 'bg-green-100 text-green-800 border border-green-300',
      good: 'bg-blue-100 text-blue-800 border border-blue-300',
      average: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      poor: 'bg-red-100 text-red-800 border border-red-300'
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
    <div className='bg-white border border-gray-300 rounded shadow hover:shadow-md transition-all duration-200'>
      {/* Card Header - Minimalist */}
      <div className='p-3 sm:p-4 border-b border-gray-200'>
        <div className='flex justify-between items-start mb-1'>
          <div className='min-w-0'>
            <h3 className='font-bold text-base sm:text-lg truncate text-gray-800'>{branch.name}</h3>
            <p className='text-xs text-gray-500 truncate'>{branch.code} • {branch.manager}</p>
          </div>
          {branch.id === topPerformer.id && (
            <FaTrophy className='text-yellow-500 flex-shrink-0' size={18} />
          )}
        </div>
        
        {/* Status indicators */}
        <div className='flex items-center gap-2 mt-2'>
          <span className={`${getRatingColor(branch.rating)} px-2 py-0.5 rounded text-2xs font-semibold capitalize`}>
            {branch.rating}
          </span>
          <div className='flex items-center gap-1'>
            {getTrendIcon(branch.trend)}
            <span className='text-xs text-gray-600 font-medium'>{branch.performance}%</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className='p-3 sm:p-4 space-y-3'>
        {/* Main Metric */}
        <div className='space-y-1'>
          <p className='text-xs text-gray-500 uppercase'>Sales ({timePeriod.replace('_', ' ')})</p>
          <div className='flex items-baseline justify-between'>
            <p className='font-bold text-xl text-blue-700 truncate'>RWF {formatCurrency(getSalesForPeriod(branch))}</p>
            <p className='text-xs text-gray-600'>{getTransactionsForPeriod(branch)} trans</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className='grid grid-cols-3 gap-2'>
          <div className='text-center p-2 border border-gray-200 rounded'>
            <p className='text-xs text-gray-500 mb-1'>Profit</p>
            <p className='font-bold text-green-600 text-sm truncate'>{formatCurrency(branch.profit)}</p>
          </div>
          <div className='text-center p-2 border border-gray-200 rounded'>
            <p className='text-xs text-gray-500 mb-1'>Margin</p>
            <p className='font-bold text-sm'>{branch.profitMargin}%</p>
          </div>
          <div className='text-center p-2 border border-gray-200 rounded'>
            <p className='text-xs text-gray-500 mb-1'>Staff</p>
            <p className='font-bold text-sm'>{branch.activeStaff}/{branch.staff}</p>
          </div>
        </div>

        {/* Action Button */}
        <button className='w-full border border-blue-500 text-blue-600 hover:bg-blue-50 py-2 rounded text-xs font-semibold transition-colors'>
          View Details →
        </button>
      </div>
    </div>
  );

  return (
    <div className='p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
        <div className='min-w-0'>
          <h2 className='font-bold text-xl sm:text-2xl lg:text-3xl text-gray-800'>Branch Comparison</h2>
          <p className='text-xs sm:text-sm text-gray-600 mt-1 truncate'>Compare performance across all locations</p>
        </div>
        <div className='flex gap-2'>
          <button className='border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs flex items-center gap-1 px-3 py-2 rounded transition-colors'>
            <FaDownload size={12} /> <span className='hidden sm:inline'>Export</span>
          </button>
          <button className='border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs flex items-center gap-1 px-3 py-2 rounded transition-colors'>
            <FaPrint size={12} /> <span className='hidden sm:inline'>Print</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4'>
        {[
          { icon: FaStore, label: 'Total Branches', value: branches.length, color: 'text-blue-600' },
          { label: 'Total Sales', value: `RWF ${formatCurrency(totalSales)}`, sub: timePeriod.replace('_', ' '), color: 'text-blue-600' },
          { label: 'Total Profit', value: `RWF ${formatCurrency(totalProfit)}`, color: 'text-green-600' },
          { label: 'Total Staff', value: totalStaff, sub: 'Across all branches', color: 'text-gray-800' },
          { icon: FaTrophy, label: 'Top Performer', value: topPerformer.name, sub: `${topPerformer.performance}% performance`, bg: 'bg-white', border: 'border-yellow-300', text: 'text-yellow-700' }
        ].map((item, idx) => (
          <div 
            key={idx} 
            className={`${item.bg || 'bg-white'} ${item.border ? `border ${item.border}` : 'border border-gray-300'} rounded shadow p-3 sm:p-4`}
          >
            <div className='flex items-center gap-2 mb-2'>
              {item.icon && <item.icon className={`${item.color || 'text-gray-600'} flex-shrink-0`} size={16} />}
              <p className='text-xs text-gray-600 uppercase truncate'>{item.label}</p>
            </div>
            <p className={`${item.color || 'text-gray-800'} font-bold text-lg sm:text-xl truncate`}>{item.value}</p>
            {item.sub && <p className='text-xs text-gray-500 mt-1 truncate'>{item.sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters - Collapsible Card */}
      <div className='bg-white border border-gray-300 rounded shadow'>
        <div className='p-3 sm:p-4 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <FiFilter className='text-gray-600' size={16} />
            <h3 className='font-bold text-sm sm:text-base'>Filters & Controls</h3>
          </div>
          <button 
            onClick={() => toggleCard('summary')}
            className="transition-transform duration-300 flex-shrink-0"
            style={{ transform: collapsedCards.summary ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <BiChevronUp size={20} className="sm:w-6 sm:h-6 text-gray-600"/>
          </button>
        </div>
        <div className="bg-gray-200 h-1"></div>
        
        <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.summary ? 'max-h-0' : 'max-h-[500px]'}`}>
          <div className='p-3 sm:p-4 space-y-4'>
            {/* Time and Metric Selection */}
            <div className='flex flex-wrap gap-2'>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className='border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='today'>Today</option>
                <option value='this_week'>This Week</option>
                <option value='this_month'>This Month</option>
              </select>

              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value)}
                className='border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='sales'>Sales</option>
                <option value='profit'>Profit</option>
                <option value='transactions'>Transactions</option>
                <option value='performance'>Performance</option>
                <option value='variance'>Variance</option>
              </select>

              <div className='flex border border-gray-300 rounded overflow-hidden'>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 text-sm font-medium ${viewMode === 'cards' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm font-medium ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Table
                </button>
              </div>

              <button className='border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-1 px-3 py-2 rounded transition-colors'>
                <BiRefresh size={14} /> <span className='hidden sm:inline'>Refresh</span>
              </button>
            </div>

            {/* Branch Selection */}
            <div>
              <p className='text-xs text-gray-600 mb-2 font-medium'>Select Branches:</p>
              <div className='flex flex-wrap gap-2'>
                <label className='flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors'>
                  <input
                    type='checkbox'
                    checked={selectedBranches.includes('all')}
                    onChange={() => handleBranchSelect('all')}
                    className='w-4 h-4 text-blue-600'
                  />
                  <span className='text-sm'>All Branches</span>
                </label>
                {branches.map(branch => (
                  <label key={branch.id} className='flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors'>
                    <input
                      type='checkbox'
                      checked={selectedBranches.includes(branch.id.toString()) || selectedBranches.includes('all')}
                      onChange={() => handleBranchSelect(branch.id.toString())}
                      className='w-4 h-4 text-blue-600'
                    />
                    <span className='text-sm truncate'>{branch.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className='border-gray-300' />

      {/* Branch Cards or Table */}
      {viewMode === 'cards' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
          {filteredBranches.map(branch => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      ) : (
        <div className='bg-white border border-gray-300 rounded shadow overflow-hidden'>
          <table className='w-full table-auto text-gray-700 text-sm'>
            <thead className='bg-gray-50 border-b border-gray-300'>
              <tr>
                <th className='text-left py-3 px-3 sm:px-4 font-semibold'>Branch</th>
                <th className='text-right py-3 px-3 sm:px-4 font-semibold'>Sales</th>
                <th className='text-center py-3 px-3 sm:px-4 font-semibold'>Trans.</th>
                <th className='text-right py-3 px-3 sm:px-4 font-semibold'>Profit</th>
                <th className='text-center py-3 px-3 sm:px-4 font-semibold hidden sm:table-cell'>Margin</th>
                <th className='text-right py-3 px-3 sm:px-4 font-semibold hidden md:table-cell'>Variance</th>
                <th className='text-center py-3 px-3 sm:px-4 font-semibold hidden lg:table-cell'>Staff</th>
                <th className='text-center py-3 px-3 sm:px-4 font-semibold'>Perf.</th>
                <th className='text-center py-3 px-3 sm:px-4 font-semibold hidden md:table-cell'>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map(branch => (
                <tr key={branch.id} className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
                  <td className='py-3 px-3 sm:px-4'>
                    <div>
                      <p className='font-semibold truncate'>{branch.name}</p>
                      <p className='text-xs text-gray-500 truncate'>{branch.code} • {branch.manager}</p>
                    </div>
                  </td>
                  <td className='text-right py-3 px-3 sm:px-4 font-semibold'>{formatCurrency(getSalesForPeriod(branch))}</td>
                  <td className='text-center py-3 px-3 sm:px-4'>{getTransactionsForPeriod(branch)}</td>
                  <td className='text-right py-3 px-3 sm:px-4 font-semibold text-green-600'>{formatCurrency(branch.profit)}</td>
                  <td className='text-center py-3 px-3 sm:px-4 hidden sm:table-cell'>{branch.profitMargin}%</td>
                  <td className='text-right py-3 px-3 sm:px-4 hidden md:table-cell'>
                    <span className={`font-semibold ${branch.variance.total < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {branch.variance.total < 0 ? '-' : '+'}RWF {formatCurrency(Math.abs(branch.variance.total))}
                    </span>
                  </td>
                  <td className='text-center py-3 px-3 sm:px-4 hidden lg:table-cell'>{branch.activeStaff}/{branch.staff}</td>
                  <td className='text-center py-3 px-3 sm:px-4 font-bold'>{branch.performance}%</td>
                  <td className='text-center py-3 px-3 sm:px-4 hidden md:table-cell'>
                    <span className={`${getRatingColor(branch.rating)} px-2 py-0.5 rounded text-xs font-semibold capitalize`}>
                      {branch.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          <div className='p-3 sm:p-4'>
            <div className='h-64 sm:h-80'>
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
            <div className='mt-6 border-t border-gray-200 pt-6'>
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
          <div className='flex items-center gap-2'>
            <FaChartLine className='text-blue-600' size={16} />
            <h3 className='font-bold text-sm sm:text-base'>Key Insights</h3>
          </div>
          <button 
            onClick={() => toggleCard('insights')}
            className="transition-transform duration-300 flex-shrink-0"
            style={{ transform: collapsedCards.insights ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <BiChevronUp size={20} className="sm:w-6 sm:h-6 text-gray-600"/>
          </button>
        </div>
        <div className="bg-gray-200 h-1"></div>
        
        <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.insights ? 'max-h-0' : 'max-h-[500px]'}`}>
          <div className='p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
            {[
              {
                title: 'Highest Sales',
                icon: '💡',
                value: [...branches].sort((a, b) => getSalesForPeriod(b) - getSalesForPeriod(a))[0].name,
                sub: `RWF ${formatCurrency(Math.max(...branches.map(b => getSalesForPeriod(b))))}`,
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800'
              },
              {
                title: 'Best Profit Margin',
                icon: '💰',
                value: [...branches].sort((a, b) => b.profitMargin - a.profitMargin)[0].name,
                sub: `${Math.max(...branches.map(b => b.profitMargin))}% margin`,
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-800'
              },
              {
                title: 'Needs Attention',
                icon: '⚠️',
                value: [...branches].sort((a, b) => a.performance - b.performance)[0].name,
                sub: `${Math.min(...branches.map(b => b.performance))}% performance`,
                bg: 'bg-orange-50',
                border: 'border-orange-200',
                text: 'text-orange-800'
              }
            ].map((insight, idx) => (
              <div 
                key={idx} 
                className={`${insight.bg} border ${insight.border} rounded p-3 sm:p-4`}
              >
                <p className={`font-bold text-xs sm:text-sm uppercase ${insight.text} mb-2 sm:mb-3 flex items-center gap-1`}>
                  {insight.icon} {insight.title}
                </p>
                <p className='font-semibold text-base sm:text-lg truncate'>{insight.value}</p>
                <p className='text-xs sm:text-sm text-gray-700 mt-1'>{insight.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}