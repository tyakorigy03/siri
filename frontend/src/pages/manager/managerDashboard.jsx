import React, { useState } from 'react';
import { BiChevronUp, BiMoney } from 'react-icons/bi';
import { FaMoneyBillWave, FaUsers, FaCashRegister, FaExclamationTriangle } from 'react-icons/fa';
import { MdWarning, MdCheckCircle } from 'react-icons/md';
import { BsClockHistory } from 'react-icons/bs';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import { FaClock } from 'react-icons/fa';

export default function ManagerDashboard() {
  const [collapsedCards, setCollapsedCards] = useState({
    businessDay: false,
    todaySales: false,
    cashSessions: false,
    alerts: false,
    pendingApprovals: false,
    quickStats: false
  });

  // Mock data (unchanged)
  const businessDayStatus = {
    isOpen: true,
    openedAt: '07:30 AM',
    openingFloat: 500000,
    floatsDistributed: 600000,
    floatInSafe: -100000, // Negative = over-distributed
    currentCash: 3250000,
    activeCashiers: 3
  };

  const cashSessions = [
    { 
      id: 1, 
      cashier: 'Mike Johnson', 
      register: 'POS-01', 
      openedAt: '08:00',
      floatSource: 'manager',
      floatApproved: true,
      sales: 4500000, 
      transactions: 45, 
      variance: -5000, 
      status: 'active' 
    },
    { 
      id: 2, 
      cashier: 'Sarah Lee', 
      register: 'POS-02', 
      openedAt: '14:15',
      floatSource: 'previous_cashier',
      floatApproved: false,
      sales: 1200000, 
      transactions: 15, 
      status: 'active' 
    },
    { 
      id: 3, 
      cashier: 'John Doe', 
      register: 'POS-03', 
      openedAt: '08:05',
      floatSource: 'overnight',
      floatApproved: false,
      floatDiscrepancy: -2000,
      sales: 3800000, 
      transactions: 32, 
      status: 'active' 
    }
  ];

  const todaySales = {
    total: 12500000,
    cash: 4200000,
    momo: 5000000,
    card: 2300000,
    credit: 1000000,
    transactions: 115,
    target: 15000000
  };

  const alerts = [
    { type: 'float_discrepancy', message: 'John Doe (POS-03): -2,000 float discrepancy on overnight handover', severity: 'critical', time: '8:05 AM' },
    { type: 'unapproved_float', message: '2 cash sessions pending float approval', severity: 'high', time: 'Now' },
    { type: 'variance', message: 'Mike Johnson (POS-01): -5,000 cash variance detected', severity: 'high', time: '2:15 PM' },
    { type: 'stock', message: '5 items below reorder point', severity: 'warning', time: '30 min ago' },
    { type: 'credit', message: 'ABC Corp exceeded credit limit by 200,000', severity: 'warning', time: '1 hour ago' }
  ];

  const pendingApprovals = [
    { 
      type: 'Float Approval', 
      item: 'John Doe - POS-03 (overnight, -2K discrepancy)', 
      amount: 148000, 
      requester: 'Emma Davis',
      priority: 'critical',
      time: '8:05 AM' 
    },
    { 
      type: 'Float Approval', 
      item: 'Sarah Lee - POS-02 (from Mike Johnson)', 
      amount: 80000, 
      requester: 'Mike Johnson',
      priority: 'high',
      time: '2:15 PM' 
    },
    { 
      type: 'Purchase Order', 
      item: 'USB Cables - 100 units', 
      amount: 250000, 
      requester: 'Sarah Williams', 
      priority: 'medium',
      time: '10:00 AM' 
    },
    { 
      type: 'Expense', 
      item: 'Office Supplies', 
      amount: 45000, 
      requester: 'David Brown', 
      priority: 'low',
      time: '11:30 AM' 
    }
  ];

  const toggleCard = (cardName) => {
    setCollapsedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  const formatCurrency = (amount) => {
    return `RWF ${amount.toLocaleString()}`;
  };

  const getSalesProgress = () => {
    return ((todaySales.total / todaySales.target) * 100).toFixed(1);
  };

  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  const unapprovedFloatsCount = cashSessions.filter(s => !s.floatApproved).length;

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-blue-500 text-white'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className='p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen'>
      <h2 className='font-bold text-xl sm:text-2xl lg:text-3xl'>Dashboard</h2>

      {/* Critical Alerts Banner */}
      {criticalAlertsCount > 0 && (
        <div className='bg-red-50 border-2 border-red-500 rounded p-2 sm:p-3'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
            <div className='flex items-start sm:items-center gap-2'>
              <FaExclamationTriangle className='text-red-600 mt-0.5 sm:mt-0 flex-shrink-0' size={18} />
              <div className='flex-1 min-w-0'>
                <p className='font-bold text-red-800 text-sm sm:text-base truncate'>
                  ⚠️ {criticalAlertsCount} Critical Alert{criticalAlertsCount > 1 ? 's' : ''} Require Immediate Attention
                </p>
                <p className='text-xs text-red-700 mt-0.5 line-clamp-2 sm:line-clamp-1'>
                  {unapprovedFloatsCount > 0 && `${unapprovedFloatsCount} unapproved float${unapprovedFloatsCount > 1 ? 's' : ''}, `}
                  {alerts.filter(a => a.type === 'float_discrepancy').length > 0 && 'Float discrepancies detected, '}
                  {alerts.filter(a => a.type === 'variance').length > 0 && 'Cash variances found'}
                </p>
              </div>
            </div>
            <button className='bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:py-2 rounded text-xs font-semibold self-end sm:self-center'>
              Review Now
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* LEFT SIDE - 8 cols on large screens, full width on smaller */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          
          {/* Business Day Status */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 sm:p-4 flex justify-between items-center">
              <h2 className='font-bold text-base sm:text-lg'>BUSINESS DAY STATUS</h2>
              <button 
                onClick={() => toggleCard('businessDay')}
                className="transition-transform duration-300 flex-shrink-0"
                style={{ transform: collapsedCards.businessDay ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <BiChevronUp size={20} className="sm:w-6 sm:h-6"/>
              </button>
            </div>
            <div className="bg-gray-200 h-1 sm:h-2"></div>
            
            <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.businessDay ? 'max-h-0' : 'max-h-[500px]'}`}>
              <div className="p-2 sm:p-3">
                <div className={`p-3 sm:p-4 rounded ${businessDayStatus.isOpen ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3'>
                    <div className='flex items-center gap-2 sm:gap-3'>
                      <div className={`p-2 sm:p-3 rounded-full ${businessDayStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                        <BsClockHistory className="text-white sm:w-5 sm:h-5" size={16} />
                      </div>
                      <div className='min-w-0'>
                        <p className='font-bold text-sm sm:text-base truncate'>
                          {businessDayStatus.isOpen ? 'Day is Open' : 'Day is Closed'}
                        </p>
                        <p className='text-xs text-gray-600 truncate'>
                          {businessDayStatus.isOpen 
                            ? `Opened at ${businessDayStatus.openedAt} • ${businessDayStatus.activeCashiers} Active Cashiers`
                            : 'Click to open business day'}
                        </p>
                      </div>
                    </div>
                    <button className={`${businessDayStatus.isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs font-bold uppercase w-full sm:w-auto`}>
                      {businessDayStatus.isOpen ? 'Close Day' : 'Open Day'}
                    </button>
                  </div>

                  {businessDayStatus.isOpen && (
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
                      <div className='bg-white p-2 rounded'>
                        <p className='text-gray-600 mb-1 truncate'>Opening Float</p>
                        <p className='font-bold text-sm truncate'>{formatCurrency(businessDayStatus.openingFloat)}</p>
                      </div>
                      <div className='bg-white p-2 rounded'>
                        <p className='text-gray-600 mb-1 truncate'>Distributed</p>
                        <p className='font-bold text-sm truncate'>{formatCurrency(businessDayStatus.floatsDistributed)}</p>
                      </div>
                      <div className='bg-white p-2 rounded'>
                        <p className='text-gray-600 mb-1 truncate'>In Safe</p>
                        <p className={`font-bold text-sm truncate ${businessDayStatus.floatInSafe < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(businessDayStatus.floatInSafe)}
                        </p>
                      </div>
                      <div className='bg-white p-2 rounded'>
                        <p className='text-gray-600 mb-1 truncate'>Current Cash</p>
                        <p className='font-bold text-sm text-green-600 truncate'>{formatCurrency(businessDayStatus.currentCash)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Sales */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 sm:p-4 flex justify-between items-center">
              <h2 className='font-bold text-base sm:text-lg'>TODAY'S SALES</h2>
              <button 
                onClick={() => toggleCard('todaySales')}
                className="transition-transform duration-300 flex-shrink-0"
                style={{ transform: collapsedCards.todaySales ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <BiChevronUp size={20} className="sm:w-6 sm:h-6"/>
              </button>
            </div>
            <div className="bg-gray-200 h-1 sm:h-2"></div>
            
            <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.todaySales ? 'max-h-0' : 'max-h-[1000px]'}`}>
              <div className="p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                <div className="grid grid-cols-2 gap-2">
                  {/* Cash */}
                  <div className="bg-gray-200 flex items-center justify-between p-2 sm:p-3">
                    <div className='min-w-0'>
                      <p className="text-gray-600 text-xs uppercase truncate">Cash</p>
                      <p className="text-green-600 font-bold text-lg sm:text-xl truncate">{formatCurrency(todaySales.cash)}</p>
                    </div>
                    <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <BiMoney className="text-green-600 sm:w-4 sm:h-4" size={14}/>
                    </div>
                  </div>
                  {/* MOMO */}
                  <div className="bg-gray-200 flex items-center justify-between p-2 sm:p-3">
                    <div className='min-w-0'>
                      <p className="text-gray-600 text-xs uppercase truncate">MOMO</p>
                      <p className="text-purple-600 font-bold text-lg sm:text-xl truncate">{formatCurrency(todaySales.momo)}</p>
                    </div>
                    <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <BiMoney className="text-purple-600 sm:w-4 sm:h-4" size={14}/>
                    </div>
                  </div>
                  {/* Card */}
                  <div className="bg-gray-200 flex items-center justify-between p-2 sm:p-3">
                    <div className='min-w-0'>
                      <p className="text-gray-600 text-xs uppercase truncate">Card</p>
                      <p className="text-blue-600 font-bold text-lg sm:text-xl truncate">{formatCurrency(todaySales.card)}</p>
                    </div>
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <BiMoney className="text-blue-600 sm:w-4 sm:h-4" size={14}/>
                    </div>
                  </div>
                  {/* Credit */}
                  <div className="bg-gray-200 flex items-center justify-between p-2 sm:p-3">
                    <div className='min-w-0'>
                      <p className="text-gray-600 text-xs uppercase truncate">Credit</p>
                      <p className="text-orange-600 font-bold text-lg sm:text-xl truncate">{formatCurrency(todaySales.credit)}</p>
                    </div>
                    <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <BiMoney className="text-orange-600 sm:w-4 sm:h-4" size={14}/>
                    </div>
                  </div>
                </div>
                
                {/* Target Progress */}
                <div className='mt-2 sm:mt-0'>
                  <p className="text-gray-400 text-center mb-3 sm:mb-4 uppercase text-xs">Target Progress</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#e5e7eb" strokeWidth="10%"/>
                        <circle 
                          cx="50%" 
                          cy="50%" 
                          r="45%" 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="10%"
                          strokeDasharray={`${(getSalesProgress() / 100) * 282} 282`}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{getSalesProgress()}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                        <span className="text-xs truncate">Current <span className="font-semibold">{formatCurrency(todaySales.total)}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
                        <span className="text-xs truncate">Target <span className="font-semibold">{formatCurrency(todaySales.target)}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        <span className="text-xs truncate">Trans. <span className="font-semibold">{todaySales.transactions}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Sessions */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 sm:p-4 flex justify-between items-center">
              <div className='flex items-center gap-2 min-w-0'>
                <h2 className='font-bold text-base sm:text-lg truncate'>ACTIVE CASH SESSIONS</h2>
                {unapprovedFloatsCount > 0 && (
                  <span className='bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0'>
                    {unapprovedFloatsCount} Pending
                  </span>
                )}
              </div>
              <button 
                onClick={() => toggleCard('cashSessions')}
                className="transition-transform duration-300 flex-shrink-0"
                style={{ transform: collapsedCards.cashSessions ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <BiChevronUp size={20} className="sm:w-6 sm:h-6"/>
              </button>
            </div>
            <div className="bg-gray-200 h-1 sm:h-2"></div>
            
            <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.cashSessions ? 'max-h-0' : 'max-h-[1000px]'}`}>
              <div className="p-2 sm:p-3 space-y-2">
                {cashSessions.map(session => (
                  <div key={session.id} className='bg-gray-200 p-2 sm:p-3'>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-2'>
                      <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
                        <FaCashRegister className='text-blue-600 flex-shrink-0 sm:w-3.5 sm:h-3.5' size={12}/>
                        <span className='font-bold text-sm truncate'>{session.cashier}</span>
                        <span className='text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 rounded truncate'>{session.register}</span>
                        {!session.floatApproved && (
                          <span className='text-xs bg-orange-100 text-orange-700 border border-orange-400 px-1.5 sm:px-2 py-0.5 rounded font-semibold flex items-center gap-1 flex-shrink-0'>
                            <FaClock size={10} /> Needs Approval
                          </span>
                        )}
                        {session.floatDiscrepancy && (
                          <span className='text-xs bg-red-100 text-red-700 border border-red-400 px-1.5 sm:px-2 py-0.5 rounded font-semibold flex-shrink-0'>
                            🚨 Discrepancy
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-1 self-start sm:self-center'>
                        <div className='w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0'></div>
                        <span className='text-xs text-green-700 font-semibold'>Active</span>
                      </div>
                    </div>
                    
                    <div className='grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs'>
                      <div className='min-w-0'>
                        <p className='text-gray-600 truncate'>Opened</p>
                        <p className='font-semibold truncate'>{session.openedAt}</p>
                      </div>
                      <div className='min-w-0'>
                        <p className='text-gray-600 truncate'>Source</p>
                        <p className='font-semibold capitalize text-xs truncate'>{session.floatSource.replace('_', ' ')}</p>
                      </div>
                      <div className='min-w-0'>
                        <p className='text-gray-600 truncate'>Sales</p>
                        <p className='font-semibold truncate'>{formatCurrency(session.sales)}</p>
                      </div>
                      <div className='min-w-0'>
                        <p className='text-gray-600 truncate'>Trans.</p>
                        <p className='font-semibold truncate'>{session.transactions}</p>
                      </div>
                      <div className='min-w-0'>
                        <p className='text-gray-600 truncate'>Approval</p>
                        {session.floatApproved ? (
                          <p className='text-green-600 font-semibold text-xs truncate'>✓ Approved</p>
                        ) : (
                          <button className='text-orange-600 font-semibold hover:underline text-xs truncate'>Approve</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - 4 cols on large, full width on smaller */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          
          {/* Alerts */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 sm:p-4 flex justify-between items-center">
              <div className='flex items-center gap-2 min-w-0'>
                <h2 className='font-bold text-xs sm:text-sm truncate'>ALERTS & WARNINGS</h2>
                <span className='bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0'>{alerts.length}</span>
              </div>
              <button 
                onClick={() => toggleCard('alerts')}
                className="transition-transform duration-300 flex-shrink-0"
                style={{ transform: collapsedCards.alerts ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <BiChevronUp size={18} className="sm:w-5 sm:h-5"/>
              </button>
            </div>
            <div className="bg-gray-200 h-1 sm:h-2"></div>
            
            <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.alerts ? 'max-h-0' : 'max-h-[500px]'}`}>
              <div className="p-3 sm:p-4 space-y-2">
                {alerts.map((alert, idx) => (
                  <div key={idx} className={`p-2 text-xs rounded border-l-2 ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                    alert.severity === 'high' ? 'bg-orange-50 border-orange-500' : 
                    'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className='flex items-start gap-2'>
                      <FaExclamationTriangle className={`${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' : 
                        'text-yellow-500'
                      } mt-0.5 flex-shrink-0`} size={12} />
                      <div className='flex-1 min-w-0'>
                        <p className='font-semibold mb-0.5 line-clamp-2'>{alert.message}</p>
                        <p className='text-gray-600 truncate'>{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 sm:p-4 flex justify-between items-center">
              <div className='flex items-center gap-2 min-w-0'>
                <h2 className='font-bold text-xs sm:text-sm truncate'>PENDING APPROVALS</h2>
                <span className='bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0'>{pendingApprovals.length}</span>
              </div>
              <button 
                onClick={() => toggleCard('pendingApprovals')}
                className="transition-transform duration-300 flex-shrink-0"
                style={{ transform: collapsedCards.pendingApprovals ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <BiChevronUp size={18} className="sm:w-5 sm:h-5"/>
              </button>
            </div>
            <div className="bg-gray-200 h-1 sm:h-2"></div>
            
            <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.pendingApprovals ? 'max-h-0' : 'max-h-[500px]'}`}>
              <div className="p-3 sm:p-4 space-y-2">
                {pendingApprovals.map((approval, idx) => (
                  <div key={idx} className='bg-gray-200 p-2 text-xs'>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1'>
                      <div className='flex items-center gap-1 min-w-0'>
                        <span className={`${getPriorityBadgeColor(approval.priority)} px-2 py-0.5 rounded text-xs font-semibold truncate`}>
                          {approval.type}
                        </span>
                      </div>
                      <span className='font-bold truncate sm:text-right'>{formatCurrency(approval.amount)}</span>
                    </div>
                    <p className='font-semibold mb-1 line-clamp-2'>{approval.item}</p>
                    <div className='flex flex-col sm:flex-row sm:justify-between text-gray-600 mb-2 gap-1'>
                      <span className='truncate'>By: {approval.requester}</span>
                      <span className='truncate sm:text-right'>{approval.time}</span>
                    </div>
                    <div className='flex gap-1'>
                      <button className='flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded text-xs font-semibold truncate'>
                        Approve
                      </button>
                      <button className='flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded text-xs font-semibold truncate'>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 sm:p-4 flex justify-between items-center">
              <h2 className='font-bold text-xs sm:text-sm'>QUICK STATS</h2>
              <button 
                onClick={() => toggleCard('quickStats')}
                className="transition-transform duration-300 flex-shrink-0"
                style={{ transform: collapsedCards.quickStats ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <BiChevronUp size={18} className="sm:w-5 sm:h-5"/>
              </button>
            </div>
            <div className="bg-gray-200 h-1 sm:h-2"></div>
            
            <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.quickStats ? 'max-h-0' : 'max-h-[500px]'}`}>
              <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
                <div className='flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-200 text-xs'>
                  <span className='text-gray-600 truncate'>Opening Float</span>
                  <span className='font-bold truncate'>{formatCurrency(businessDayStatus.openingFloat)}</span>
                </div>
                <div className='flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-200 text-xs'>
                  <span className='text-gray-600 truncate'>Distributed</span>
                  <span className='font-bold truncate'>{formatCurrency(businessDayStatus.floatsDistributed)}</span>
                </div>
                <div className='flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-200 text-xs'>
                  <span className='text-gray-600 truncate'>In Safe</span>
                  <span className={`font-bold truncate ${businessDayStatus.floatInSafe < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(businessDayStatus.floatInSafe)}
                  </span>
                </div>
                <div className='flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-200 text-xs'>
                  <span className='text-gray-600 truncate'>Current Cash</span>
                  <span className='font-bold text-green-600 truncate'>{formatCurrency(businessDayStatus.currentCash)}</span>
                </div>
                <div className='flex justify-between items-center py-1.5 sm:py-2 text-xs'>
                  <span className='text-gray-600 truncate'>Active Staff</span>
                  <span className='font-bold truncate'>{businessDayStatus.activeCashiers} cashiers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}