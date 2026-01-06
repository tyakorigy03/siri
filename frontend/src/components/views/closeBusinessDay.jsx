import React, { useState } from 'react';
import { BiChevronDown, BiChevronUp, BiSearch, BiRefresh } from 'react-icons/bi';
import { FaCashRegister, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { MdWarning, MdCheckCircle as MdCheck } from 'react-icons/md';
import { BsClockHistory } from 'react-icons/bs';
import { FiFilter } from 'react-icons/fi';
import { FaPrint } from 'react-icons/fa6';
import { LuSquareArrowDownRight } from 'react-icons/lu';
import { showSuccess, handleApiError } from '../../utils/toast';
import { closeBusinessDay } from '../../services/businessDay';

export default function CloseBusinessDay() {
  const [expandedSessions, setExpandedSessions] = useState([]);
  const [finalCashCount, setFinalCashCount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const businessDayData = {
    date: 'Monday, January 05, 2026',
    openedAt: '07:30 AM',
    openingFloat: 500000,
    branch: 'Downtown Store'
  };

  const closedSessions = [
    {
      id: 1,
      cashier: 'Mike Johnson',
      register: 'POS-01',
      openedAt: '08:00 AM',
      closedAt: '06:00 PM',
      floatGiven: 200000,
      floatReceived: 200000,
      sales: 4500000,
      cashSales: 450000,
      momoSales: 2500000,
      cardSales: 1350000,
      creditSales: 200000,
      transactions: 45,
      expectedCash: 650000,
      actualCash: 645000,
      variance: -5000,
      cashSubmitted: 645000,
      floatApproved: true
    },
    {
      id: 2,
      cashier: 'Sarah Lee',
      register: 'POS-02',
      openedAt: '08:15 AM',
      closedAt: '06:15 PM',
      floatGiven: 200000,
      floatReceived: 200000,
      sales: 3200000,
      cashSales: 380000,
      momoSales: 1800000,
      cardSales: 818000,
      creditSales: 202000,
      transactions: 32,
      expectedCash: 580000,
      actualCash: 582000,
      variance: 2000,
      cashSubmitted: 582000,
      floatApproved: true
    },
    {
      id: 3,
      cashier: 'John Doe',
      register: 'POS-03',
      openedAt: '08:00 AM',
      closedAt: '06:10 PM',
      floatGiven: 200000,
      floatReceived: 200000,
      sales: 5300000,
      cashSales: 580000,
      momoSales: 2800000,
      cardSales: 1720000,
      creditSales: 200000,
      transactions: 38,
      expectedCash: 780000,
      actualCash: 780000,
      variance: 0,
      cashSubmitted: 780000,
      floatApproved: true
    }
  ];

  const activeSessions = [];

  const expenses = [
    { category: 'Utilities', amount: 150000, payee: 'EUCL' },
    { category: 'Office Supplies', amount: 45000, payee: 'Office Mart' },
    { category: 'Fuel', amount: 80000, payee: 'Total' }
  ];

  // Calculations
  const totalSales = closedSessions.reduce((sum, s) => sum + s.sales, 0);
  const totalCashSales = closedSessions.reduce((sum, s) => sum + s.cashSales, 0);
  const totalMomoSales = closedSessions.reduce((sum, s) => sum + s.momoSales, 0);
  const totalCardSales = closedSessions.reduce((sum, s) => sum + s.cardSales, 0);
  const totalCreditSales = closedSessions.reduce((sum, s) => sum + s.creditSales, 0);
  const totalTransactions = closedSessions.reduce((sum, s) => sum + s.transactions, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const totalSessionVariance = closedSessions.reduce((sum, s) => sum + s.variance, 0);
  const cashSubmittedToManager = closedSessions.reduce((sum, s) => sum + s.cashSubmitted, 0);
  const expectedFinalCash = cashSubmittedToManager;
  const finalVariance = parseFloat(finalCashCount || 0) - expectedFinalCash;
  const overallVariance = totalSessionVariance + finalVariance;

  const hasUnapprovedFloats = closedSessions.some(s => !s.floatApproved);
  const hasActiveSessions = activeSessions.length > 0;
  const canClose = !hasUnapprovedFloats && !hasActiveSessions && finalCashCount;

  const toggleSession = (id) => {
    setExpandedSessions(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getVarianceColor = (variance) => {
    if (variance === 0) return 'text-gray-800';
    return variance < 0 ? 'text-red-600' : 'text-green-600';
  };

  const handleCloseDay = () => {
    if (canClose) {
      setShowConfirmation(true);
    }
  };

  const confirmCloseDay = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Get business_day_id from current business day
      const businessDayData = {
        business_day_id: '', // Should be fetched from current business day
        actual_closing_cash: parseFloat(finalCashCount),
        notes: closingNotes || null
      };
      
      await closeBusinessDay(businessDayData);
      showSuccess('Business day closed successfully!');
      // TODO: Navigate back to dashboard after closing
    } catch (error) {
      handleApiError(error, 'Failed to close business day. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ExpandedSessionDetails = ({ session }) => (
    <tr className='bg-gray-50'>
      <td colSpan='10' className='p-4'>
        <div className='grid grid-cols-2 gap-4 text-xs'>
          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Payment Breakdown</p>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Cash Sales:</span>
                <span className='font-semibold'>{formatCurrency(session.cashSales)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>MOMO Sales:</span>
                <span className='font-semibold'>{formatCurrency(session.momoSales)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Card Sales:</span>
                <span className='font-semibold'>{formatCurrency(session.cardSales)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Credit Sales:</span>
                <span className='font-semibold'>{formatCurrency(session.creditSales)}</span>
              </div>
              <div className='flex justify-between border-t border-gray-300 pt-1 mt-1'>
                <span className='font-bold'>Total:</span>
                <span className='font-bold'>{formatCurrency(session.sales)}</span>
              </div>
            </div>
          </div>

          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Cash Reconciliation</p>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Opening Float:</span>
                <span className='font-semibold'>{formatCurrency(session.floatReceived)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>+ Cash Sales:</span>
                <span className='font-semibold'>{formatCurrency(session.cashSales)}</span>
              </div>
              <div className='flex justify-between border-t border-gray-300 pt-1 mt-1'>
                <span className='font-semibold'>Expected:</span>
                <span className='font-bold'>{formatCurrency(session.expectedCash)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-semibold'>Actual:</span>
                <span className='font-bold'>{formatCurrency(session.actualCash)}</span>
              </div>
              <div className={`flex justify-between border-t-2 ${session.variance < 0 ? 'border-red-500' : session.variance > 0 ? 'border-green-500' : 'border-gray-500'} pt-1 mt-1`}>
                <span className='font-bold'>Variance:</span>
                <span className={`font-bold ${getVarianceColor(session.variance)}`}>
                  {session.variance === 0 ? '0' : `${session.variance < 0 ? '-' : '+'}${formatCurrency(Math.abs(session.variance))}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  if (showConfirmation) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-white border-2 border-orange-400 rounded shadow-lg'>
            <div className='bg-orange-50 p-6 border-b-2 border-orange-200'>
              <div className='flex items-center gap-3 mb-2'>
                <MdWarning className='text-orange-500' size={32} />
                <h2 className='font-bold text-2xl'>Confirm Close Business Day</h2>
              </div>
              <p className='text-sm text-gray-600'>Please review the summary before closing</p>
            </div>

            <div className='p-6 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-blue-50 p-4 rounded border border-blue-200'>
                  <p className='text-xs text-gray-600 mb-1'>Business Day</p>
                  <p className='font-bold text-sm'>{businessDayData.date}</p>
                  <p className='text-xs text-gray-600 mt-1'>Opened: {businessDayData.openedAt}</p>
                </div>
                <div className='bg-gray-100 p-4 rounded'>
                  <p className='text-xs text-gray-600 mb-1'>Branch</p>
                  <p className='font-bold text-sm'>{businessDayData.branch}</p>
                </div>
              </div>

              <div className='bg-green-50 p-4 rounded border border-green-200'>
                <p className='text-xs font-semibold text-gray-700 mb-3 uppercase'>Sales Summary</p>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div className='flex justify-between'><span>Total Sales:</span><span className='font-bold'>{formatCurrency(totalSales)}</span></div>
                  <div className='flex justify-between'><span>Transactions:</span><span className='font-bold'>{totalTransactions}</span></div>
                  <div className='flex justify-between'><span>Cash:</span><span className='font-semibold'>{formatCurrency(totalCashSales)}</span></div>
                  <div className='flex justify-between'><span>MOMO:</span><span className='font-semibold'>{formatCurrency(totalMomoSales)}</span></div>
                  <div className='flex justify-between'><span>Card:</span><span className='font-semibold'>{formatCurrency(totalCardSales)}</span></div>
                  <div className='flex justify-between'><span>Credit:</span><span className='font-semibold'>{formatCurrency(totalCreditSales)}</span></div>
                </div>
              </div>

              <div className='bg-purple-50 p-4 rounded border border-purple-200'>
                <p className='text-xs font-semibold text-gray-700 mb-3 uppercase'>Cash Summary</p>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div className='flex justify-between'><span>Expected Cash:</span><span className='font-bold'>{formatCurrency(expectedFinalCash)}</span></div>
                  <div className='flex justify-between'><span>Actual Cash:</span><span className='font-bold'>{formatCurrency(parseFloat(finalCashCount))}</span></div>
                  <div className='flex justify-between'><span>Session Variance:</span><span className={`font-semibold ${getVarianceColor(totalSessionVariance)}`}>{totalSessionVariance === 0 ? '0' : `${totalSessionVariance < 0 ? '-' : '+'}${formatCurrency(Math.abs(totalSessionVariance))}`}</span></div>
                  <div className='flex justify-between'><span>Count Variance:</span><span className={`font-semibold ${getVarianceColor(finalVariance)}`}>{finalVariance === 0 ? '0' : `${finalVariance < 0 ? '-' : '+'}${formatCurrency(Math.abs(finalVariance))}`}</span></div>
                </div>
                <div className='flex justify-between border-t-2 border-purple-300 pt-3 mt-3'>
                  <span className='font-bold'>Overall Variance:</span>
                  <span className={`font-bold text-lg ${getVarianceColor(overallVariance)}`}>
                    {overallVariance === 0 ? 'None' : `${overallVariance < 0 ? '-' : '+'}${formatCurrency(Math.abs(overallVariance))}`}
                  </span>
                </div>
              </div>

              <div className='bg-red-50 p-3 rounded border border-red-200'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs font-semibold text-gray-700 uppercase'>Expenses</span>
                  <span className='text-sm font-bold text-red-700'>{formatCurrency(totalExpenses)}</span>
                </div>
              </div>

              {closingNotes && (
                <div className='bg-gray-100 p-4 rounded'>
                  <p className='text-xs text-gray-600 mb-1'>Notes</p>
                  <p className='text-sm'>{closingNotes}</p>
                </div>
              )}
            </div>

            <div className='p-6 bg-gray-50 flex gap-3'>
              <button onClick={() => setShowConfirmation(false)} disabled={isSubmitting} className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded font-bold text-sm uppercase disabled:opacity-50'>
                Go Back
              </button>
              <button onClick={confirmCloseDay} disabled={isSubmitting} className='flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded font-bold text-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2'>
                {isSubmitting ? (<><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Closing...</>) : (<><MdCheck size={20} />Confirm & Close</>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-3xl'>Close Business Day</h2>
        <div className='text-right'>
          <p className='text-sm text-gray-600'>{businessDayData.date}</p>
          <p className='text-xs text-gray-500'>Opened: {businessDayData.openedAt} • {businessDayData.branch}</p>
        </div>
      </div>

      {/* Blockers */}
      {(hasUnapprovedFloats || hasActiveSessions) && (
        <div className='bg-red-50 border-2 border-red-500 rounded p-3'>
          <div className='flex items-center gap-2'>
            <FaExclamationTriangle className='text-red-600' size={20} />
            <div>
              <p className='font-bold text-red-800 text-sm'>Cannot Close Business Day</p>
              <p className='text-xs text-red-700'>
                {hasActiveSessions && `${activeSessions.length} session(s) still active. `}
                {hasUnapprovedFloats && 'Some floats unapproved.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-between items-center'>
        <div className='flex space-x-2'>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
            <BiRefresh/> Refresh
          </button>
        </div>
        <div className='flex space-x-2'>
          <button className='border text-gray-50 bg-gray-500 hover:bg-gray-50 hover:text-gray-500 text-xs flex items-center space-x-1 py-1 px-3'>
            <FaPrint/> Print Summary
          </button>
        </div>
      </div>

      <hr className='text-gray-400' />

      {/* Sessions Table */}
      <div className='bg-white overflow-x-auto'>
        <table className='w-full table-auto text-gray-500 text-xs'>
          <thead className='border-b-4 border-gray-300'>
            <tr>
              <th className='text-center py-1 px-2'><input type='checkbox' /></th>
              <th className='text-center py-1 px-2'>Cashier</th>
              <th className='text-center py-1 px-2'>Register</th>
              <th className='text-center py-1 px-2'>Opened</th>
              <th className='text-center py-1 px-2'>Closed</th>
              <th className='text-center py-1 px-2'>Sales</th>
              <th className='text-center py-1 px-2'>Trans.</th>
              <th className='text-center py-1 px-2'>Expected</th>
              <th className='text-center py-1 px-2'>Actual</th>
              <th className='text-center py-1 px-2'>Variance</th>
              <th className='text-center py-1 px-2'>Action</th>
            </tr>
          </thead>
          <tbody>
            {closedSessions.map(session => (
              <React.Fragment key={session.id}>
                <tr className='border-b border-gray-300'>
                  <td className='text-center py-1 px-2'><input type='checkbox' /></td>
                  <td className='text-center py-1 px-2 font-semibold'>{session.cashier}</td>
                  <td className='text-center py-1 px-2'>
                    <span className='bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold'>{session.register}</span>
                  </td>
                  <td className='text-center py-1 px-2'>{session.openedAt}</td>
                  <td className='text-center py-1 px-2'>{session.closedAt}</td>
                  <td className='text-center py-1 px-2 font-semibold'>{formatCurrency(session.sales)}</td>
                  <td className='text-center py-1 px-2'>{session.transactions}</td>
                  <td className='text-center py-1 px-2 font-semibold'>{formatCurrency(session.expectedCash)}</td>
                  <td className='text-center py-1 px-2 font-semibold'>{formatCurrency(session.actualCash)}</td>
                  <td className='text-center py-1 px-2'>
                    <span className={`font-bold ${getVarianceColor(session.variance)}`}>
                      {session.variance === 0 ? '0' : `${session.variance < 0 ? '-' : '+'}${formatCurrency(Math.abs(session.variance))}`}
                    </span>
                  </td>
                  <td className='text-center py-1 px-2'>
                    <div className='inline-flex border border-gray-200'>
                      <button onClick={() => toggleSession(session.id)} className={`p-1 px-3 cursor-pointer ${expandedSessions.includes(session.id) ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <LuSquareArrowDownRight className={`transform transition-transform ${expandedSessions.includes(session.id) ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedSessions.includes(session.id) && <ExpandedSessionDetails session={session} />}
              </React.Fragment>
            ))}
            <tr className='bg-gray-100 border-t-4 border-gray-400 font-bold'>
              <td colSpan='5' className='text-right py-2 px-2'>TOTALS:</td>
              <td className='text-center py-2 px-2'>{formatCurrency(totalSales)}</td>
              <td className='text-center py-2 px-2'>{totalTransactions}</td>
              <td className='text-center py-2 px-2'>{formatCurrency(expectedFinalCash)}</td>
              <td className='text-center py-2 px-2'>{formatCurrency(cashSubmittedToManager)}</td>
              <td className='text-center py-2 px-2'>
                <span className={`${getVarianceColor(totalSessionVariance)}`}>
                  {totalSessionVariance === 0 ? '0' : `${totalSessionVariance < 0 ? '-' : '+'}${formatCurrency(Math.abs(totalSessionVariance))}`}
                </span>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Final Cash Count Section */}
      <div className='grid grid-cols-2 gap-6'>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <h3 className='font-bold text-sm mb-3 uppercase text-gray-700'>Final Cash Count</h3>
          <div className='space-y-3'>
            <div className='bg-gray-100 p-3 rounded'>
              <p className='text-xs text-gray-600 mb-1'>Cash from Cashiers</p>
              <p className='text-2xl font-bold text-purple-700'>{formatCurrency(cashSubmittedToManager)}</p>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Count Total Cash *</label>
              <input type='text' value={finalCashCount} onChange={(e) => setFinalCashCount(e.target.value)} placeholder='Enter amount' className='w-full p-3 border-2 border-purple-300 rounded text-lg font-bold focus:border-purple-500 focus:outline-none' />
            </div>
            {finalCashCount && (
              <div className={`p-3 rounded border-2 ${finalVariance === 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <p className='text-xs font-semibold mb-1'>Count Variance</p>
                <p className={`text-xl font-bold ${getVarianceColor(finalVariance)}`}>
                  {finalVariance === 0 ? 'Perfect! ✓' : `${finalVariance < 0 ? '-' : '+'}${formatCurrency(Math.abs(finalVariance))}`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <h3 className='font-bold text-sm mb-3 uppercase text-gray-700'>Summary</h3>
          <div className='space-y-3'>
            <div className='bg-blue-50 p-3 rounded text-xs space-y-2'>
              <div className='flex justify-between'><span>Session Variance:</span><span className={`font-bold ${getVarianceColor(totalSessionVariance)}`}>{totalSessionVariance === 0 ? '0' : `${totalSessionVariance < 0 ? '-' : '+'}${formatCurrency(Math.abs(totalSessionVariance))}`}</span></div>
              {finalCashCount && (
                <>
                  <div className='flex justify-between'><span>Count Variance:</span><span className={`font-bold ${getVarianceColor(finalVariance)}`}>{finalVariance === 0 ? '0' : `${finalVariance < 0 ? '-' : '+'}${formatCurrency(Math.abs(finalVariance))}`}</span></div>
                  <div className='flex justify-between border-t-2 border-blue-300 pt-2'><span className='font-bold'>Overall:</span><span className={`font-bold text-lg ${getVarianceColor(overallVariance)}`}>{overallVariance === 0 ? '0' : `${overallVariance < 0 ? '-' : '+'}${formatCurrency(Math.abs(overallVariance))}`}</span></div>
                </>
              )}
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Notes (Optional)</label>
              <textarea value={closingNotes} onChange={(e) => setClosingNotes(e.target.value)} placeholder='Closing notes...' rows='4' className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none' />
            </div>
            <button onClick={handleCloseDay} disabled={!canClose} className='w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded font-bold text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
              <BsClockHistory size={18} /> Close Business Day
            </button>
            {!canClose && (
              <div className='bg-yellow-50 border border-yellow-300 rounded p-2 text-xs text-yellow-800'>
                {hasActiveSessions && <p>• Close all active sessions</p>}
                {hasUnapprovedFloats && <p>• Approve all floats</p>}
                {!finalCashCount && <p>• Enter final cash count</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}