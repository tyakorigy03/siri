import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiChevronUp, BiMoney } from 'react-icons/bi';
import { FaCashRegister, FaExclamationTriangle, FaUsers } from 'react-icons/fa';
import { BsClockHistory } from 'react-icons/bs';
import { FaClock, FaFileInvoiceDollar } from 'react-icons/fa';
import { FaSackDollar } from 'react-icons/fa6';
import { getCurrentBusinessDay, getCashbookEntries } from '../../services/businessDay';
import { getSalesSummary } from '../../services/sales';
import { getCashSessions } from '../../services/cashSessions';
import { getVATReport } from '../../services/reports';
import { getExpenses } from '../../services/expenses';
import { getPurchaseOrders } from '../../services/purchases';
import { getUserData, getAuthToken } from '../../config/api';

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const [collapsedCards, setCollapsedCards] = useState({
    businessDay: false,
    todaySales: false,
    cashSessions: false,
    alerts: false,
    pendingApprovals: false,
    quickStats: false
  });

  const [loading, setLoading] = useState(true);
  const [businessDayStatus, setBusinessDayStatus] = useState({
    isOpen: false,
    openedAt: null,
    openingFloat: 0,
    floatsDistributed: 0,
    floatInSafe: 0,
    currentCash: 0,
    activeCashiers: 0
  });

  const [cashSessions, setCashSessions] = useState([]);
  const [todaySales, setTodaySales] = useState({
    total: 0,
    cash: 0,
    momo: 0,
    card: 0,
    credit: 0,
    transactions: 0,
    target: 15000000
  });

  const [alerts, setAlerts] = useState([]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const token = getAuthToken();
        const user = getUserData();
        
        if (!token || !user) {
          console.warn('No authentication token or user data found');
          setLoading(false);
          return;
        }
        
        const branchId = user?.branch_id || null;

        // Load current business day
        try {
          const currentDay = await getCurrentBusinessDay(branchId);
          if (currentDay) {
            const openedAt = new Date(currentDay.opened_at);
            setBusinessDayStatus({
              isOpen: currentDay.status === 'OPEN',
              openedAt: openedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              openingFloat: parseFloat(currentDay.opening_float || 0),
              floatsDistributed: 0, // Would need to calculate from cash sessions
              floatInSafe: parseFloat(currentDay.opening_float || 0),
              currentCash: 0, // Would need to calculate from cashbook
              activeCashiers: 0 // Would need to count active sessions
            });

            // Load cashbook entries to calculate current cash
            try {
              const entries = await getCashbookEntries({ business_day_id: currentDay.id });
              if (entries && entries.summary) {
                setBusinessDayStatus(prev => ({
                  ...prev,
                  currentCash: entries.summary.net || 0
                }));
              }
            } catch (err) {
              console.error('Error loading cashbook:', err);
              // Don't show error toast - not critical for dashboard
            }
          }
        } catch (err) {
          console.error('No open business day:', err);
          setBusinessDayStatus(prev => ({ ...prev, isOpen: false }));
          // Don't show error toast - it's normal if no business day is open
        }

        // Load sales summary for today
        try {
          const today = new Date().toISOString().split('T')[0];
          const salesSummary = await getSalesSummary({ 
            branch_id: branchId,
            date_from: today,
            date_to: today 
          });
          if (salesSummary) {
            setTodaySales({
              total: parseFloat(salesSummary.total_sales || 0),
              cash: parseFloat(salesSummary.cash_sales || 0),
              momo: parseFloat(salesSummary.momo_sales || 0),
              card: parseFloat(salesSummary.card_sales || 0),
              credit: parseFloat(salesSummary.credit_sales || 0),
              transactions: parseInt(salesSummary.total_transactions || 0),
              target: 15000000
            });
          }
        } catch (err) {
          console.error('Error loading sales summary:', err);
          // Don't show error toast - dashboard can still function
        }

        // Load cash sessions
        let loadedSessions = [];
        let sessionsData = [];
        try {
          const sessions = await getCashSessions({ 
            branch_id: branchId,
            status: 'OPEN',
            limit: 50
          });
          sessionsData = Array.isArray(sessions) ? sessions : [];
          if (sessionsData.length > 0) {
            loadedSessions = sessionsData.map(session => ({
              id: session.id,
              cashier: session.staff_name || session.user_name || 'Unknown',
              register: session.register || 'N/A',
              openedAt: new Date(session.opened_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              floatSource: 'manager', // Would need to determine from session data
              floatApproved: session.float_approved || false,
              sales: parseFloat(session.total_cash_in || 0),
              transactions: parseInt(session.transaction_count || 0),
              variance: parseFloat(session.variance || 0),
              status: session.status?.toLowerCase() || 'active',
              opening_float: parseFloat(session.opening_float || 0)
            }));
            setCashSessions(loadedSessions);
            setBusinessDayStatus(prev => ({
              ...prev,
              activeCashiers: loadedSessions.length
            }));
          }
        } catch (err) {
          console.error('Error loading cash sessions:', err);
          // Don't show error toast - dashboard can still function
        }

        // Generate alerts from loaded sessions
        const generatedAlerts = [];
        if (loadedSessions.some(s => !s.floatApproved)) {
          const unapprovedCount = loadedSessions.filter(s => !s.floatApproved).length;
          generatedAlerts.push({
            type: 'unapproved_float',
            message: `${unapprovedCount} cash session${unapprovedCount > 1 ? 's' : ''} pending float approval`,
            severity: 'high',
            time: 'Now'
          });
        }
        loadedSessions.forEach(session => {
          if (session.variance !== 0) {
            generatedAlerts.push({
              type: 'variance',
              message: `${session.cashier} (${session.register}): ${session.variance < 0 ? '-' : '+'}${Math.abs(session.variance).toLocaleString()} cash variance`,
              severity: Math.abs(session.variance) > 10000 ? 'high' : 'warning',
              time: 'Recent'
            });
          }
        });
        setAlerts(generatedAlerts);

        // Update staff snapshot
        setStaffSnapshot({
          staffOnShift: 0, // Would need to fetch from employees API
          cashiersOnShift: loadedSessions.length,
          sessionsWithVariance: loadedSessions.filter(s => s.variance !== 0).length,
          commissionToday: 0 // Would need to calculate from commission API
        });

        // Load tax summary (VAT report)
        try {
          const today = new Date().toISOString().split('T')[0];
          const vatReport = await getVATReport({ 
            branch_id: branchId,
            date_from: today,
            date_to: today 
          });
          if (vatReport) {
            setTaxSummary({
              periodLabel: 'Today',
              vatOutput: parseFloat(vatReport.vat_output || 0),
              vatInput: parseFloat(vatReport.vat_input || 0),
              whtPayable: parseFloat(vatReport.wht_payable || 0)
            });
          }
        } catch (err) {
          console.error('Error loading VAT report:', err);
          // Don't show error toast - not critical for dashboard
        }

        // Load pending approvals (expenses and purchase orders)
        const approvals = [];
        try {
          // Get expenses with DRAFT status (pending)
          const expensesResponse = await getExpenses({ 
            branch_id: branchId,
            status: 'DRAFT',
            limit: 10
          });
          
          // Handle different response structures
          let pendingExpenses = [];
          if (Array.isArray(expensesResponse)) {
            pendingExpenses = expensesResponse;
          } else if (expensesResponse?.data && Array.isArray(expensesResponse.data)) {
            pendingExpenses = expensesResponse.data;
          } else if (expensesResponse?.items && Array.isArray(expensesResponse.items)) {
            pendingExpenses = expensesResponse.items;
          }
          
          // Filter out rejected expenses (those with [REJECTED] in description)
          pendingExpenses = pendingExpenses.filter(exp => 
            !exp.description?.includes('[REJECTED]')
          );
          
          if (pendingExpenses && pendingExpenses.length > 0) {
            pendingExpenses.slice(0, 5).forEach(expense => {
              approvals.push({
                type: 'Expense',
                item: `${expense.category_name || expense.category || 'Expense'} - ${(expense.description || '').substring(0, 50)}`,
                amount: parseFloat(expense.amount || 0) + parseFloat(expense.vat_amount || 0),
                requester: expense.requested_by_name || expense.created_by_name || 'Unknown',
                priority: (parseFloat(expense.amount || 0) + parseFloat(expense.vat_amount || 0)) > 100000 ? 'high' : 'medium',
                time: new Date(expense.expense_date || expense.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                id: expense.id,
                approvalType: 'expense'
              });
            });
          }
        } catch (err) {
          console.error('Error loading pending expenses:', err);
          // Don't show error toast - dashboard can still function
        }

        try {
          // Get purchase orders with DRAFT or PENDING status
          const poResponse = await getPurchaseOrders({ 
            branch_id: branchId,
            limit: 10
          });
          
          // Handle different response structures
          let allPOs = [];
          if (Array.isArray(poResponse)) {
            allPOs = poResponse;
          } else if (poResponse?.data && Array.isArray(poResponse.data)) {
            allPOs = poResponse.data;
          } else if (poResponse?.items && Array.isArray(poResponse.items)) {
            allPOs = poResponse.items;
          }
          
          // Filter for pending orders (DRAFT or PENDING status, not CANCELLED)
          const pendingPOs = allPOs.filter(po => 
            (po.status === 'DRAFT' || po.status === 'PENDING') && 
            po.status !== 'CANCELLED' &&
            !po.notes?.includes('[REJECTED]')
          );
          
          if (pendingPOs && pendingPOs.length > 0) {
            pendingPOs.slice(0, 5).forEach(po => {
              const totalAmount = parseFloat(po.total_amount || 0);
              approvals.push({
                type: 'Purchase Order',
                item: `PO ${po.order_number || po.id} - ${po.supplier_name || 'Supplier'}`,
                amount: totalAmount,
                requester: po.created_by_name || 'Unknown',
                priority: totalAmount > 500000 ? 'high' : 'medium',
                time: new Date(po.order_date || po.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                id: po.id,
                approvalType: 'purchase_order'
              });
            });
          }
        } catch (err) {
          console.error('Error loading pending purchase orders:', err);
          // Don't show error toast - dashboard can still function
        }

        // Add unapproved float sessions to approvals
        loadedSessions.filter(s => !s.floatApproved).forEach(session => {
          const sessionData = sessionsData.find(s => s.id === session.id);
          approvals.push({
            type: 'Float Approval',
            item: `${session.cashier} - ${session.register}`,
            amount: parseFloat(sessionData?.opening_float || 0),
            requester: session.cashier,
            priority: 'high',
            time: session.openedAt,
            id: session.id,
            approvalType: 'float'
          });
        });

        setPendingApprovals(approvals);

        // Refund summary - would need refunds API
        setRefundSummary({
          countToday: 0,
          amountToday: 0,
          monthToDate: 0
        });

      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const [taxSummary, setTaxSummary] = useState({
    periodLabel: 'Today',
    vatOutput: 0,
    vatInput: 0,
    whtPayable: 0
  });

  const [refundSummary, setRefundSummary] = useState({
    countToday: 0,
    amountToday: 0,
    monthToDate: 0
  });

  const [staffSnapshot, setStaffSnapshot] = useState({
    staffOnShift: 0,
    cashiersOnShift: 0,
    sessionsWithVariance: 0,
    commissionToday: 0
  });

  const [pendingApprovals, setPendingApprovals] = useState([]);

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

  if (loading) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
                    <button 
                      onClick={() => navigate(businessDayStatus.isOpen ? 'close-business-day' : 'open-business-day')}
                      className={`${businessDayStatus.isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs font-bold uppercase w-full sm:w-auto`}
                    >
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('cash-session-management')}
                  className="hidden sm:inline-flex text-[10px] sm:text-xs border border-gray-400 text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Manage Sessions
                </button>
                <button 
                  onClick={() => toggleCard('cashSessions')}
                  className="transition-transform duration-300 flex-shrink-0"
                  style={{ transform: collapsedCards.cashSessions ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <BiChevronUp size={20} className="sm:w-6 sm:h-6"/>
                </button>
              </div>
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
             {/* Backoffice Snapshot: taxes, refunds, staff */}
             <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 sm:p-4 flex justify-between items-center">
              <h2 className='font-bold text-xs sm:text-sm'>BACKOFFICE SNAPSHOT</h2>
              <button 
                onClick={() => toggleCard('quickStats')}
                className="transition-transform duration-300 flex-shrink-0"
                style={{ transform: collapsedCards.quickStats ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <BiChevronUp size={18} className="sm:w-5 sm:h-5"/>
              </button>
            </div>
            <div className="bg-gray-200 h-1 sm:h-2"></div>
            
            <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.quickStats ? 'max-h-0' : 'max-h-[520px]'}`}>
              <div className="p-3 sm:p-4 space-y-3">
                {/* Taxes */}
                <div className="bg-gray-50 border border-gray-200 rounded p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FaFileInvoiceDollar className="text-blue-600 flex-shrink-0" size={14} />
                      <p className="font-semibold text-xs sm:text-sm truncate">Taxes (VAT & WHT) – {taxSummary.periodLabel}</p>
                    </div>
                    <button
                      onClick={() => navigate('daily-report')}
                      className="hidden sm:inline-flex text-[10px] sm:text-xs text-blue-600 hover:underline"
                    >
                      View report
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">VAT Output (Sales)</span>
                      <span className="font-bold text-green-700 truncate">{formatCurrency(taxSummary.vatOutput)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">VAT Input (Purchases)</span>
                      <span className="font-bold text-purple-700 truncate">{formatCurrency(taxSummary.vatInput)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">WHT to remit</span>
                      <span className="font-bold text-orange-700 truncate">{formatCurrency(taxSummary.whtPayable)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">Net VAT Position</span>
                      <span className="font-bold text-blue-700 truncate">
                        {formatCurrency(taxSummary.vatOutput - taxSummary.vatInput)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refunds & Exceptions */}
                <div className="bg-gray-50 border border-gray-200 rounded p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FaSackDollar className="text-orange-600 flex-shrink-0" size={14} />
                      <p className="font-semibold text-xs sm:text-sm truncate">Refunds & Exceptions</p>
                    </div>
                    <button
                      onClick={() => navigate('variance-investigation')}
                      className="hidden sm:inline-flex text-[10px] sm:text-xs text-orange-700 hover:underline"
                    >
                      Investigate
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">Refunds today</span>
                      <span className="font-bold text-gray-800 truncate">{refundSummary.countToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">Refund value today</span>
                      <span className="font-bold text-red-600 truncate">{formatCurrency(refundSummary.amountToday)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">Month-to-date refunds</span>
                      <span className="font-bold text-gray-800 truncate">{formatCurrency(refundSummary.monthToDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">Cash / tax impact</span>
                      <span className="font-semibold text-gray-700 truncate">Tracked in cashbook & VAT</span>
                    </div>
                  </div>
                </div>

                {/* Staff & Payroll Inputs */}
                <div className="bg-gray-50 border border-gray-200 rounded p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FaUsers className="text-green-600 flex-shrink-0" size={14} />
                      <p className="font-semibold text-xs sm:text-sm truncate">Staff & Commissions (Today)</p>
                    </div>
                    <button
                      onClick={() => navigate('staff-performance')}
                      className="hidden sm:inline-flex text-[10px] sm:text-xs text-green-700 hover:underline"
                    >
                      Staff view
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">Staff on shift</span>
                      <span className="font-bold text-gray-800 truncate">{staffSnapshot.staffOnShift}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">Active cashiers</span>
                      <span className="font-bold text-gray-800 truncate">{staffSnapshot.cashiersOnShift}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">Sessions with variance</span>
                      <span className="font-bold text-orange-700 truncate">{staffSnapshot.sessionsWithVariance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">Commission today</span>
                      <span className="font-bold text-green-700 truncate">{formatCurrency(staffSnapshot.commissionToday)}</span>
                    </div>
                  </div>
                </div>

                {/* Cash quick stats (float & current cash) */}
                <div className='border-t border-gray-200 pt-2 mt-1 space-y-1 text-[10px] sm:text-xs'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 truncate'>Opening Float</span>
                    <span className='font-bold truncate'>{formatCurrency(businessDayStatus.openingFloat)}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 truncate'>Distributed</span>
                    <span className='font-bold truncate'>{formatCurrency(businessDayStatus.floatsDistributed)}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 truncate'>In Safe</span>
                    <span className={`font-bold truncate ${businessDayStatus.floatInSafe < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(businessDayStatus.floatInSafe)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 truncate'>Current Cash</span>
                    <span className='font-bold text-green-600 truncate'>{formatCurrency(businessDayStatus.currentCash)}</span>
                  </div>
                </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('notifications')}
                  className="hidden sm:inline-flex text-[10px] sm:text-xs border border-gray-400 text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Open Center
                </button>
                <button 
                  onClick={() => toggleCard('alerts')}
                  className="transition-transform duration-300 flex-shrink-0"
                  style={{ transform: collapsedCards.alerts ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <BiChevronUp size={18} className="sm:w-5 sm:h-5"/>
                </button>
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('expense-approval')}
                  className="hidden sm:inline-flex text-[10px] sm:text-xs border border-gray-400 text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                >
                  View Queue
                </button>
                <button 
                  onClick={() => toggleCard('pendingApprovals')}
                  className="transition-transform duration-300 flex-shrink-0"
                  style={{ transform: collapsedCards.pendingApprovals ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <BiChevronUp size={18} className="sm:w-5 sm:h-5"/>
                </button>
              </div>
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

       
        </div>
      </div>
    </div>
  );
}