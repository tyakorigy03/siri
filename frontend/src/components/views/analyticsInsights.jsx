import React, { useState } from 'react';
import { BiRefresh } from 'react-icons/bi';
import { FaChartLine, FaUsers, FaClock, FaCalendar, FaTrophy } from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { FaPrint, FaDownload } from 'react-icons/fa6';

export default function AnalyticsInsights() {
  const [timePeriod, setTimePeriod] = useState('this_month');
  const [activeInsightTab, setActiveInsightTab] = useState('sales');

  // Mock data
  const salesTrends = {
    peakHours: ['14:00-15:00', '16:00-17:00', '11:00-12:00'],
    slowHours: ['08:00-09:00', '20:00-21:00'],
    bestDay: 'Saturday',
    worstDay: 'Monday',
    avgDailySales: 12500000,
    salesGrowth: 15.5,
    prediction: {
      nextWeek: 88000000,
      nextMonth: 350000000
    }
  };

  const customerInsights = {
    avgTransactionValue: 108696,
    trend: 'up',
    trendPercentage: 8.5,
    repeatCustomerRate: 35,
    newCustomers: 245,
    paymentPreferences: {
      cash: 32,
      momo: 40,
      card: 18,
      credit: 10
    },
    creditVsCash: {
      credit: 15,
      cash: 85
    }
  };

  const staffInsights = {
    avgProductivity: 3200000,
    topPerformer: {
      name: 'Sarah Lee',
      sales: 128000000,
      efficiency: 98
    },
    trainingNeeds: [
      'John Doe - Cash handling (5 variances)',
      'Mike Johnson - Customer service',
      'Emma Davis - Product knowledge'
    ],
    optimalStaffing: {
      weekday: 5,
      weekend: 7,
      current: 6
    }
  };

  const predictiveAnalytics = {
    salesForecast: [
      { period: 'Week 1', predicted: 88000000, confidence: 85 },
      { period: 'Week 2', predicted: 92000000, confidence: 80 },
      { period: 'Week 3', predicted: 95000000, confidence: 75 },
      { period: 'Week 4', predicted: 98000000, confidence: 70 }
    ],
    stockRequirements: [
      { item: 'Laptop Dell XPS', predictedDemand: 45, currentStock: 10, orderSuggestion: 40 },
      { item: 'Wireless Mouse', predictedDemand: 120, currentStock: 12, orderSuggestion: 110 },
      { item: 'USB Cables', predictedDemand: 200, currentStock: 0, orderSuggestion: 200 }
    ],
    cashFlowProjection: {
      week1: 15000000,
      week2: 18000000,
      week3: 16000000,
      week4: 20000000
    }
  };

  const hourlyData = [
    { hour: '08:00', sales: 450000, transactions: 5 },
    { hour: '09:00', sales: 680000, transactions: 8 },
    { hour: '10:00', sales: 920000, transactions: 12 },
    { hour: '11:00', sales: 1150000, transactions: 15 },
    { hour: '12:00', sales: 1580000, transactions: 18 },
    { hour: '13:00', sales: 1420000, transactions: 16 },
    { hour: '14:00', sales: 1680000, transactions: 14 },
    { hour: '15:00', sales: 1950000, transactions: 13 },
    { hour: '16:00', sales: 1820000, transactions: 9 },
    { hour: '17:00', sales: 1350000, transactions: 5 }
  ];

  const weekdayData = [
    { day: 'Mon', sales: 10500000, transactions: 105 },
    { day: 'Tue', sales: 11800000, transactions: 118 },
    { day: 'Wed', sales: 12200000, transactions: 122 },
    { day: 'Thu', sales: 13500000, transactions: 135 },
    { day: 'Fri', sales: 14200000, transactions: 142 },
    { day: 'Sat', sales: 18500000, transactions: 185 },
    { day: 'Sun', sales: 15300000, transactions: 153 }
  ];

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <MdTrendingUp className='text-green-600' size={20} />;
    if (trend === 'down') return <MdTrendingDown className='text-red-600' size={20} />;
    return <span className='text-gray-400'>━</span>;
  };

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Analytics & Insights</h2>
          <p className='text-sm text-gray-600 mt-1'>Advanced business intelligence and predictions</p>
        </div>
        <div className='flex gap-2'>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className='border border-gray-400 rounded px-3 py-1 text-xs font-semibold focus:border-blue-500 focus:outline-none'
          >
            <option value='today'>Today</option>
            <option value='this_week'>This Week</option>
            <option value='this_month'>This Month</option>
            <option value='this_quarter'>This Quarter</option>
            <option value='this_year'>This Year</option>
          </select>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <BiRefresh size={14} /> Refresh
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <FaDownload size={12} /> Export
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <FaPrint size={12} /> Print
          </button>
        </div>
      </div>

      {/* Quick Insights Cards */}
      <div className='grid grid-cols-4 gap-4'>
        <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaChartLine size={20} />
            <p className='text-xs uppercase'>Sales Growth</p>
          </div>
          <p className='text-3xl font-bold'>{salesTrends.salesGrowth}%</p>
          <p className='text-xs mt-1'>vs last period</p>
        </div>

        <div className='bg-gradient-to-br from-green-500 to-green-600 text-white rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <MdTrendingUp size={22} />
            <p className='text-xs uppercase'>Avg Transaction</p>
          </div>
          <p className='text-2xl font-bold'>RWF {formatCurrency(customerInsights.avgTransactionValue)}</p>
          <p className='text-xs mt-1'>↑ {customerInsights.trendPercentage}% increase</p>
        </div>

        <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaUsers size={18} />
            <p className='text-xs uppercase'>New Customers</p>
          </div>
          <p className='text-3xl font-bold'>{customerInsights.newCustomers}</p>
          <p className='text-xs mt-1'>this period</p>
        </div>

        <div className='bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaTrophy size={18} />
            <p className='text-xs uppercase'>Top Performer</p>
          </div>
          <p className='text-xl font-bold'>{staffInsights.topPerformer.name}</p>
          <p className='text-xs mt-1'>{staffInsights.topPerformer.efficiency}% efficiency</p>
        </div>
      </div>

      {/* Insight Tabs */}
      <div className='flex gap-2'>
        <button
          onClick={() => setActiveInsightTab('sales')}
          className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
            activeInsightTab === 'sales' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sales Trends
        </button>
        <button
          onClick={() => setActiveInsightTab('customers')}
          className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
            activeInsightTab === 'customers' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Customer Insights
        </button>
        <button
          onClick={() => setActiveInsightTab('staff')}
          className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
            activeInsightTab === 'staff' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Staff Insights
        </button>
        <button
          onClick={() => setActiveInsightTab('predictions')}
          className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
            activeInsightTab === 'predictions' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Predictions
        </button>
      </div>

      <hr className='text-gray-400' />

      {/* Sales Trends Tab */}
      {activeInsightTab === 'sales' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-2 gap-6'>
            {/* Peak Hours */}
            <div className='bg-white border border-gray-300 rounded shadow'>
              <div className='p-4 bg-green-100 border-b border-green-300'>
                <h3 className='font-bold text-sm uppercase text-green-800'>🔥 Peak Sales Hours</h3>
              </div>
              <div className='p-4'>
                <div className='space-y-3'>
                  {salesTrends.peakHours.map((hour, idx) => (
                    <div key={idx} className='flex items-center justify-between p-3 bg-green-50 rounded border border-green-200'>
                      <div className='flex items-center gap-2'>
                        <FaClock className='text-green-600' size={16} />
                        <span className='font-bold text-sm'>{hour}</span>
                      </div>
                      <span className='text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold'>
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <p className='text-xs text-gray-600 mt-3'>💡 Recommendation: Ensure adequate staffing during these hours</p>
              </div>
            </div>

            {/* Slow Hours */}
            <div className='bg-white border border-gray-300 rounded shadow'>
              <div className='p-4 bg-orange-100 border-b border-orange-300'>
                <h3 className='font-bold text-sm uppercase text-orange-800'>🐌 Slow Hours</h3>
              </div>
              <div className='p-4'>
                <div className='space-y-3'>
                  {salesTrends.slowHours.map((hour, idx) => (
                    <div key={idx} className='flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200'>
                      <div className='flex items-center gap-2'>
                        <FaClock className='text-orange-600' size={16} />
                        <span className='font-bold text-sm'>{hour}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className='text-xs text-gray-600 mt-3'>💡 Recommendation: Run promotions or reduce staffing during these periods</p>
              </div>
            </div>
          </div>

          {/* Hourly Breakdown Chart */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Hourly Sales Pattern</h3>
            </div>
            <div className='p-6'>
              <div className='space-y-3'>
                {hourlyData.map((hour, idx) => {
                  const maxSales = Math.max(...hourlyData.map(h => h.sales));
                  const percentage = (hour.sales / maxSales) * 100;
                  return (
                    <div key={idx}>
                      <div className='flex justify-between items-center mb-1 text-xs'>
                        <span className='font-semibold w-20'>{hour.hour}</span>
                        <span className='font-bold'>RWF {formatCurrency(hour.sales)}</span>
                        <span className='text-gray-600'>{hour.transactions} trans</span>
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

          {/* Day of Week Analysis */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Day of Week Analysis</h3>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-7 gap-3'>
                {weekdayData.map((day, idx) => {
                  const isWeekend = day.day === 'Sat' || day.day === 'Sun';
                  const isBest = day.sales === Math.max(...weekdayData.map(d => d.sales));
                  const isWorst = day.sales === Math.min(...weekdayData.map(d => d.sales));
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        isBest ? 'bg-green-100 border-green-400' :
                        isWorst ? 'bg-red-100 border-red-400' :
                        isWeekend ? 'bg-purple-50 border-purple-300' :
                        'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <p className='font-bold text-center text-sm mb-2'>{day.day}</p>
                      <p className='text-xs text-center font-semibold'>RWF {formatCurrency(day.sales)}</p>
                      <p className='text-xs text-center text-gray-600'>{day.transactions} trans</p>
                      {isBest && <p className='text-center mt-1'>🏆</p>}
                    </div>
                  );
                })}
              </div>
              <div className='mt-4 text-xs bg-blue-50 border border-blue-200 p-3 rounded'>
                <p className='font-semibold mb-1'>📊 Key Findings:</p>
                <ul className='list-disc list-inside space-y-1 text-gray-700'>
                  <li>Best Day: <span className='font-bold'>{salesTrends.bestDay}</span> (consider extra staff)</li>
                  <li>Slowest Day: <span className='font-bold'>{salesTrends.worstDay}</span> (run promotions)</li>
                  <li>Weekend sales are 40% higher than weekdays</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Insights Tab */}
      {activeInsightTab === 'customers' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-2 gap-6'>
            {/* Payment Preferences */}
            <div className='bg-white border border-gray-300 rounded shadow'>
              <div className='p-4 bg-gray-100 border-b border-gray-300'>
                <h3 className='font-bold text-sm uppercase'>Payment Method Preferences</h3>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {Object.entries(customerInsights.paymentPreferences).map(([method, percentage]) => (
                    <div key={method}>
                      <div className='flex justify-between items-center mb-1 text-xs'>
                        <span className='font-semibold capitalize'>{method}</span>
                        <span className='font-bold'>{percentage}%</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-6'>
                        <div
                          className={`h-6 rounded-full transition-all duration-500 ${
                            method === 'cash' ? 'bg-green-500' :
                            method === 'momo' ? 'bg-purple-500' :
                            method === 'card' ? 'bg-blue-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='mt-4 text-xs bg-purple-50 border border-purple-200 p-3 rounded'>
                  <p className='font-semibold mb-1'>💡 Insight:</p>
                  <p className='text-gray-700'>MOMO is the most preferred payment method. Consider offering MOMO-exclusive promotions.</p>
                </div>
              </div>
            </div>

            {/* Customer Behavior */}
            <div className='bg-white border border-gray-300 rounded shadow'>
              <div className='p-4 bg-gray-100 border-b border-gray-300'>
                <h3 className='font-bold text-sm uppercase'>Customer Behavior</h3>
              </div>
              <div className='p-6 space-y-4'>
                <div className='bg-blue-50 border border-blue-200 p-4 rounded'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-xs font-semibold text-gray-700 uppercase'>Avg Transaction Value</p>
                    {getTrendIcon(customerInsights.trend)}
                  </div>
                  <p className='text-2xl font-bold text-blue-700'>RWF {formatCurrency(customerInsights.avgTransactionValue)}</p>
                  <p className='text-xs text-gray-600 mt-1'>↑ {customerInsights.trendPercentage}% from last period</p>
                </div>

                <div className='bg-green-50 border border-green-200 p-4 rounded'>
                  <p className='text-xs font-semibold text-gray-700 uppercase mb-2'>Repeat Customer Rate</p>
                  <p className='text-3xl font-bold text-green-700'>{customerInsights.repeatCustomerRate}%</p>
                  <p className='text-xs text-gray-600 mt-1'>Good customer loyalty</p>
                </div>

                <div className='bg-purple-50 border border-purple-200 p-4 rounded'>
                  <p className='text-xs font-semibold text-gray-700 uppercase mb-2'>New Customers</p>
                  <p className='text-3xl font-bold text-purple-700'>{customerInsights.newCustomers}</p>
                  <p className='text-xs text-gray-600 mt-1'>This period</p>
                </div>

                <div className='text-xs bg-orange-50 border border-orange-200 p-3 rounded'>
                  <p className='font-semibold mb-1'>🎯 Recommendation:</p>
                  <p className='text-gray-700'>Focus on converting new customers to repeat customers with loyalty programs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Credit vs Cash Customers */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Credit vs Cash Customers</h3>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-6 bg-orange-50 rounded border border-orange-200'>
                  <p className='text-xs text-gray-600 mb-2'>Credit Customers</p>
                  <p className='text-5xl font-bold text-orange-600'>{customerInsights.creditVsCash.credit}%</p>
                </div>
                <div className='text-center p-6 bg-green-50 rounded border border-green-200'>
                  <p className='text-xs text-gray-600 mb-2'>Cash Customers</p>
                  <p className='text-5xl font-bold text-green-600'>{customerInsights.creditVsCash.cash}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Insights Tab */}
      {activeInsightTab === 'staff' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-2 gap-6'>
            {/* Top Performer */}
            <div className='bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded shadow p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <FaTrophy size={32} />
                <h3 className='font-bold text-xl uppercase'>Top Performer</h3>
              </div>
              <p className='text-3xl font-bold mb-2'>{staffInsights.topPerformer.name}</p>
              <div className='space-y-2 text-sm'>
                <p>💰 Sales: RWF {formatCurrency(staffInsights.topPerformer.sales)}</p>
                <p>⚡ Efficiency: {staffInsights.topPerformer.efficiency}%</p>
              </div>
            </div>

            {/* Avg Productivity */}
            <div className='bg-white border border-gray-300 rounded shadow'>
              <div className='p-4 bg-gray-100 border-b border-gray-300'>
                <h3 className='font-bold text-sm uppercase'>Average Productivity</h3>
              </div>
              <div className='p-6'>
                <p className='text-4xl font-bold text-blue-600 mb-2'>
                  RWF {formatCurrency(staffInsights.avgProductivity)}
                </p>
                <p className='text-sm text-gray-600'>per staff member / month</p>
              </div>
            </div>
          </div>

          {/* Training Needs */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-orange-100 border-b border-orange-300'>
              <h3 className='font-bold text-sm uppercase text-orange-800'>📚 Training Needs Identified</h3>
            </div>
            <div className='p-6'>
              <div className='space-y-3'>
                {staffInsights.trainingNeeds.map((need, idx) => (
                  <div key={idx} className='flex items-start gap-3 p-3 bg-orange-50 rounded border border-orange-200'>
                    <span className='text-orange-600 font-bold'>{idx + 1}.</span>
                    <p className='text-sm flex-1'>{need}</p>
                    <button className='text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded font-semibold'>
                      Schedule Training
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Optimal Staffing */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Optimal Staffing Levels</h3>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-3 gap-4'>
                <div className='text-center p-4 bg-blue-50 rounded border border-blue-200'>
                  <p className='text-xs text-gray-600 mb-2'>Weekday</p>
                  <p className='text-4xl font-bold text-blue-600'>{staffInsights.optimalStaffing.weekday}</p>
                  <p className='text-xs text-gray-600 mt-1'>staff needed</p>
                </div>
                <div className='text-center p-4 bg-purple-50 rounded border border-purple-200'>
                  <p className='text-xs text-gray-600 mb-2'>Weekend</p>
                  <p className='text-4xl font-bold text-purple-600'>{staffInsights.optimalStaffing.weekend}</p>
                  <p className='text-xs text-gray-600 mt-1'>staff needed</p>
                </div>
                <div className='text-center p-4 bg-green-50 rounded border border-green-200'>
                  <p className='text-xs text-gray-600 mb-2'>Current</p>
                  <p className='text-4xl font-bold text-green-600'>{staffInsights.optimalStaffing.current}</p>
                  <p className='text-xs text-gray-600 mt-1'>total staff</p>
                </div>
              </div>
              <div className='mt-4 text-xs bg-blue-50 border border-blue-200 p-3 rounded'>
                <p className='font-semibold mb-1'>💡 Recommendation:</p>
                <p className='text-gray-700'>Consider hiring 1 additional staff member for weekend coverage.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeInsightTab === 'predictions' && (
        <div className='space-y-6'>
          {/* Sales Forecast */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-purple-100 border-b border-purple-300'>
              <h3 className='font-bold text-sm uppercase text-purple-800'>📈 Sales Forecast (Next 4 Weeks)</h3>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                {predictiveAnalytics.salesForecast.map((forecast, idx) => (
                  <div key={idx} className='border border-gray-300 rounded p-4'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='font-bold text-sm'>{forecast.period}</span>
                      <span className='text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded font-semibold'>
                        {forecast.confidence}% confidence
                      </span>
                    </div>
                    <p className='text-2xl font-bold text-purple-700'>RWF {formatCurrency(forecast.predicted)}</p>
                    <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-purple-500 h-2 rounded-full'
                        style={{ width: `${forecast.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stock Requirements Prediction */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-green-100 border-b border-green-300'>
              <h3 className='font-bold text-sm uppercase text-green-800'>📦 Predicted Stock Requirements</h3>
            </div>
            <div className='p-6'>
              <table className='w-full text-xs'>
                <thead className='border-b-2 border-gray-300'>
                  <tr>
                    <th className='text-left py-2 px-2'>Item</th>
                    <th className='text-center py-2 px-2'>Current Stock</th>
                    <th className='text-center py-2 px-2'>Predicted Demand</th>
                    <th className='text-center py-2 px-2'>Order Suggestion</th>
                    <th className='text-center py-2 px-2'>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {predictiveAnalytics.stockRequirements.map((item, idx) => (
                    <tr key={idx} className='border-b border-gray-200'>
                      <td className='py-3 px-2 font-bold'>{item.item}</td>
                      <td className='text-center py-3 px-2'>
                        <span className={`font-semibold ${item.currentStock === 0 ? 'text-red-600' : item.currentStock < 20 ? 'text-orange-600' : 'text-green-600'}`}>
                          {item.currentStock}
                        </span>
                      </td>
                      <td className='text-center py-3 px-2 font-semibold'>{item.predictedDemand}</td>
                      <td className='text-center py-3 px-2'>
                        <span className='bg-green-100 text-green-700 px-2 py-1 rounded font-bold'>
                          {item.orderSuggestion} units
                        </span>
                      </td>
                      <td className='text-center py-3 px-2'>
                        <span className={`px-2 py-1 rounded text-2xs font-semibold ${
                          item.currentStock === 0 ? 'bg-red-500 text-white' :
                          item.currentStock < 20 ? 'bg-orange-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {item.currentStock === 0 ? 'URGENT' : item.currentStock < 20 ? 'HIGH' : 'MEDIUM'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash Flow Projection */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-blue-100 border-b border-blue-300'>
              <h3 className='font-bold text-sm uppercase text-blue-800'>💰 Cash Flow Projection</h3>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-4 gap-4'>
                {Object.entries(predictiveAnalytics.cashFlowProjection).map(([week, amount], idx) => (
                  <div key={idx} className='text-center p-4 bg-blue-50 rounded border border-blue-200'>
                    <p className='text-xs text-gray-600 mb-2 uppercase'>{week.replace('week', 'Week ')}</p>
                    <p className='text-xl font-bold text-blue-700'>RWF {formatCurrency(amount)}</p>
                  </div>
                ))}
              </div>
              <div className='mt-4 text-xs bg-blue-50 border border-blue-200 p-3 rounded'>
                <p className='font-semibold mb-1'>💡 Insight:</p>
                <p className='text-gray-700'>Cash flow projected to increase by 33% over the next 4 weeks. Consider bulk purchasing opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}