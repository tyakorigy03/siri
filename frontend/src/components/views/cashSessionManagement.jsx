import React, { useState } from 'react';
import { BiSearch, BiRefresh } from 'react-icons/bi';
import { FaCashRegister, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
import { MdClose, MdWarning, MdCheckCircle as MdCheck } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { LuSquareArrowDownRight } from 'react-icons/lu';
import { FaPrint } from 'react-icons/fa6';

export default function CashSessionManagement() {
  const [activeTab, setActiveTab] = useState('active');
  const [filterTab, setFilterTab] = useState('all'); // all, pending, approved
  const [expandedRows, setExpandedRows] = useState([]);
  const [showVarianceModal, setShowVarianceModal] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data with float sources
  const activeSessions = [
    { 
      id: 1, 
      cashier: 'Mike Johnson', 
      register: 'POS-01', 
      openedAt: '08:00 AM',
      floatSource: 'manager',
      sourceCashier: null,
      floatGiven: 200000,
      floatReceived: 200000,
      floatApproved: true,
      approvedBy: 'Jane Smith',
      sales: 4500000, 
      cashSales: 450000,
      transactions: 45, 
      lastTransaction: '2:15 PM',
      status: 'active'
    },
    { 
      id: 2, 
      cashier: 'Sarah Lee', 
      register: 'POS-02', 
      openedAt: '02:15 PM',
      floatSource: 'previous_cashier',
      sourceCashier: 'Mike Johnson',
      sourceSessionId: 15,
      floatGiven: 80000,
      floatReceived: 80000,
      floatApproved: false, // Pending approval
      approvedBy: null,
      sales: 1200000, 
      cashSales: 180000,
      transactions: 15, 
      lastTransaction: '3:30 PM',
      status: 'active'
    },
    { 
      id: 3, 
      cashier: 'John Doe', 
      register: 'POS-03', 
      openedAt: '08:05 AM',
      floatSource: 'overnight',
      sourceCashier: 'Emma Davis',
      sourceSessionId: 14,
      floatGiven: 150000,
      floatReceived: 148000, // Discrepancy!
      floatApproved: false,
      approvedBy: null,
      sales: 3800000, 
      cashSales: 420000,
      transactions: 32, 
      lastTransaction: '3:25 PM',
      status: 'active'
    }
  ];

  const closedSessions = [
    { 
      id: 4, 
      cashier: 'Emma Davis', 
      register: 'POS-04', 
      openedAt: '08:00 AM',
      closedAt: '12:30 PM',
      floatSource: 'manager',
      floatGiven: 150000,
      floatReceived: 150000,
      floatApproved: true,
      closingCash: 417000,
      sales: 2700000, 
      cashSales: 270000,
      transactions: 28, 
      variance: -3000,
      closingAction: 'leave_drawer',
      amountLeft: 150000,
      leftFor: 'overnight',
      status: 'closed'
    }
  ];

  const allSessions = [...activeSessions, ...closedSessions];

  const getCurrentSessions = () => {
    let sessions = activeTab === 'active' ? activeSessions : 
                   activeTab === 'closed' ? closedSessions : 
                   allSessions;
    
    // Filter by approval status
    if (filterTab === 'pending') {
      sessions = sessions.filter(s => !s.floatApproved);
    } else if (filterTab === 'approved') {
      sessions = sessions.filter(s => s.floatApproved);
    }
    
    if (searchQuery) {
      sessions = sessions.filter(s => 
        s.cashier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.register.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return sessions;
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const calculateExpectedCash = (session) => {
    return session.floatReceived + session.cashSales;
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getVarianceColor = (variance) => {
    if (!variance || variance === 0) return 'text-gray-800';
    return variance < 0 ? 'text-red-600' : 'text-green-600';
  };

  const getFloatSourceLabel = (source) => {
    const labels = {
      'manager': 'Manager',
      'previous_cashier': 'Prev. Cashier',
      'overnight': 'Overnight',
      'safe': 'Safe'
    };
    return labels[source] || source;
  };

  const getFloatSourceColor = (source) => {
    const colors = {
      'manager': 'bg-blue-100 text-blue-700',
      'previous_cashier': 'bg-purple-100 text-purple-700',
      'overnight': 'bg-orange-100 text-orange-700',
      'safe': 'bg-green-100 text-green-700'
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  const handleApproveFloat = (sessionId) => {
    alert(`Approving float for session ${sessionId}`);
    // API call here
  };

  const handleRejectFloat = (sessionId) => {
    alert(`Rejecting float for session ${sessionId}`);
    // API call here
  };

  const pendingApprovalsCount = allSessions.filter(s => !s.floatApproved && s.status === 'active').length;

  // Expanded Row Details
  const ExpandedRowDetails = ({ session }) => {
    const expectedCash = calculateExpectedCash(session);
    const hasFloatDiscrepancy = session.floatGiven !== session.floatReceived;

    return (
      <tr className='bg-gray-50'>
        <td colSpan='12' className='p-4'>
          <div className='grid grid-cols-2 gap-4'>
            {/* Left Column */}
            <div className='space-y-3'>
              <h4 className='font-bold text-xs uppercase text-gray-700 border-b border-gray-300 pb-2'>Float Details</h4>
              
              <div className='bg-white border border-gray-300 p-3 rounded text-xs space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Float Source:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getFloatSourceColor(session.floatSource)}`}>
                    {getFloatSourceLabel(session.floatSource)}
                  </span>
                </div>
                
                {session.sourceCashier && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>From:</span>
                    <span className='font-semibold'>{session.sourceCashier}</span>
                  </div>
                )}
                
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Amount Given:</span>
                  <span className='font-semibold'>{formatCurrency(session.floatGiven)}</span>
                </div>
                
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Amount Received:</span>
                  <span className={`font-semibold ${hasFloatDiscrepancy ? 'text-red-600' : ''}`}>
                    {formatCurrency(session.floatReceived)}
                  </span>
                </div>
                
                {hasFloatDiscrepancy && (
                  <div className='flex justify-between bg-red-50 p-2 rounded border border-red-200'>
                    <span className='text-red-700 font-semibold'>Discrepancy:</span>
                    <span className='font-bold text-red-600'>
                      -{formatCurrency(session.floatGiven - session.floatReceived)}
                    </span>
                  </div>
                )}

                <div className='flex justify-between border-t border-gray-300 pt-2'>
                  <span className='text-gray-700 font-semibold'>Approval Status:</span>
                  {session.floatApproved ? (
                    <span className='text-green-600 font-semibold flex items-center gap-1'>
                      <FaCheckCircle size={12} /> Approved
                    </span>
                  ) : (
                    <span className='text-orange-600 font-semibold flex items-center gap-1'>
                      <FaClock size={12} /> Pending
                    </span>
                  )}
                </div>

                {session.floatApproved && session.approvedBy && (
                  <div className='flex justify-between text-xs'>
                    <span className='text-gray-600'>Approved By:</span>
                    <span>{session.approvedBy}</span>
                  </div>
                )}
              </div>

              <h4 className='font-bold text-xs uppercase text-gray-700 border-b border-gray-300 pb-2'>Cash Reconciliation</h4>
              
              <div className='bg-white border border-gray-300 p-3 rounded text-xs space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Opening Float:</span>
                  <span className='font-semibold'>{formatCurrency(session.floatReceived)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>+ Cash Sales:</span>
                  <span className='font-semibold'>{formatCurrency(session.cashSales)}</span>
                </div>
                <div className='flex justify-between border-t border-gray-300 pt-2'>
                  <span className='text-gray-700 font-semibold'>Expected Cash:</span>
                  <span className='font-bold'>{formatCurrency(expectedCash)}</span>
                </div>
                
                {session.closingCash && (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-gray-700 font-semibold'>Actual Cash:</span>
                      <span className='font-bold'>{formatCurrency(session.closingCash)}</span>
                    </div>
                    <div className={`flex justify-between border-t-2 ${session.variance < 0 ? 'border-red-500' : session.variance > 0 ? 'border-green-500' : 'border-gray-500'} pt-2`}>
                      <span className='font-bold'>Variance:</span>
                      <span className={`font-bold ${getVarianceColor(session.variance)}`}>
                        {session.variance === 0 ? 'None' : 
                         `${session.variance < 0 ? '-' : '+'}${formatCurrency(Math.abs(session.variance))}`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {session.closingAction && (
                <div className='bg-purple-50 border border-purple-200 p-3 rounded text-xs'>
                  <p className='font-semibold mb-2'>Closing Action</p>
                  <div className='space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Action:</span>
                      <span className='font-semibold capitalize'>{session.closingAction.replace('_', ' ')}</span>
                    </div>
                    {session.amountLeft && (
                      <>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Amount Left:</span>
                          <span className='font-semibold'>{formatCurrency(session.amountLeft)}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Left For:</span>
                          <span className='font-semibold capitalize'>{session.leftFor}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className='space-y-3'>
              <h4 className='font-bold text-xs uppercase text-gray-700 border-b border-gray-300 pb-2'>Session Statistics</h4>
              
              <div className='grid grid-cols-2 gap-2'>
                <div className='bg-white border border-gray-300 p-2 rounded'>
                  <p className='text-xs text-gray-600 mb-1'>Total Sales</p>
                  <p className='font-bold text-sm'>{formatCurrency(session.sales)}</p>
                </div>
                <div className='bg-white border border-gray-300 p-2 rounded'>
                  <p className='text-xs text-gray-600 mb-1'>Transactions</p>
                  <p className='font-bold text-sm'>{session.transactions}</p>
                </div>
                <div className='bg-white border border-gray-300 p-2 rounded'>
                  <p className='text-xs text-gray-600 mb-1'>Avg. Transaction</p>
                  <p className='font-bold text-sm'>{formatCurrency(Math.round(session.sales / session.transactions))}</p>
                </div>
                <div className='bg-white border border-gray-300 p-2 rounded'>
                  <p className='text-xs text-gray-600 mb-1'>Cash %</p>
                  <p className='font-bold text-sm'>{((session.cashSales / session.sales) * 100).toFixed(1)}%</p>
                </div>
              </div>

              {!session.floatApproved && (
                <div className='bg-orange-50 border-l-4 border-orange-500 p-3'>
                  <p className='text-xs font-semibold text-orange-800 mb-2 flex items-center gap-1'>
                    <MdWarning size={14} /> Approval Required
                  </p>
                  <p className='text-xs text-gray-700 mb-3'>
                    This session's float needs manager approval before final reconciliation.
                  </p>
                  <div className='flex gap-2'>
                    <button 
                      onClick={() => setShowApprovalModal(session.id)}
                      className='flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded text-xs font-semibold'
                    >
                      Review & Approve
                    </button>
                  </div>
                </div>
              )}

              <div className='flex gap-2 mt-4'>
                <button className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-xs font-semibold'>
                  View Transactions
                </button>
                {session.variance && session.variance !== 0 && (
                  <button 
                    onClick={() => setShowVarianceModal(session.id)}
                    className='flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-xs font-semibold'
                  >
                    Investigate
                  </button>
                )}
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Approval Modal
  const ApprovalModal = ({ sessionId }) => {
    const session = allSessions.find(s => s.id === sessionId);
    const [notes, setNotes] = useState('');
    if (!session) return null;

    const hasDiscrepancy = session.floatGiven !== session.floatReceived;

    return (
      <div className='fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowApprovalModal(null)}>
        <div className='bg-white rounded shadow-xl max-w-2xl w-full mx-4' onClick={(e) => e.stopPropagation()}>
          <div className='p-4 bg-orange-50 border-b border-orange-200 flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <FaClock className='text-orange-600' size={20} />
              <h3 className='font-bold text-lg'>Float Approval Required</h3>
            </div>
            <button onClick={() => setShowApprovalModal(null)} className='text-gray-600 hover:text-gray-800'>
              <MdClose size={20} />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div className='grid grid-cols-2 gap-4 text-xs'>
              <div>
                <p className='text-gray-600 mb-1'>Cashier</p>
                <p className='font-bold'>{session.cashier} ({session.register})</p>
              </div>
              <div>
                <p className='text-gray-600 mb-1'>Opened At</p>
                <p className='font-bold'>{session.openedAt}</p>
              </div>
            </div>

            <div className='bg-blue-50 border border-blue-200 p-4 rounded'>
              <p className='text-xs font-semibold text-blue-800 mb-3'>FLOAT SOURCE DETAILS</p>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-700'>Source:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getFloatSourceColor(session.floatSource)}`}>
                    {getFloatSourceLabel(session.floatSource)}
                  </span>
                </div>
                {session.sourceCashier && (
                  <div className='flex justify-between'>
                    <span className='text-gray-700'>From Cashier:</span>
                    <span className='font-semibold'>{session.sourceCashier}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-gray-700'>Amount Left:</span>
                  <span className='font-bold'>{formatCurrency(session.floatGiven)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-700'>Amount Found:</span>
                  <span className={`font-bold ${hasDiscrepancy ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(session.floatReceived)}
                  </span>
                </div>
                {hasDiscrepancy && (
                  <div className='flex justify-between bg-red-50 p-2 rounded border-t-2 border-red-500'>
                    <span className='text-red-800 font-bold'>Discrepancy:</span>
                    <span className='font-bold text-red-600'>
                      -{formatCurrency(session.floatGiven - session.floatReceived)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {hasDiscrepancy && (
              <div className='bg-red-50 border-l-4 border-red-500 p-3'>
                <p className='text-xs font-semibold mb-2 text-red-800'>⚠️ DISCREPANCY DETECTED</p>
                <p className='text-xs text-gray-700 mb-2'>
                  There is a mismatch between what was left and what was found. Investigate before approving.
                </p>
                <p className='text-xs text-gray-700 font-semibold'>
                  Possible reasons: Counting error, theft, incorrect recording
                </p>
              </div>
            )}

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                Approval Notes {hasDiscrepancy && '*'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={hasDiscrepancy ? 'Required: Explain discrepancy resolution...' : 'Optional notes...'}
                rows='3'
                className='w-full p-3 border border-gray-300 rounded text-xs'
              />
            </div>
          </div>

          <div className='p-4 bg-gray-50 border-t flex gap-3'>
            <button 
              onClick={() => setShowApprovalModal(null)}
              className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-semibold'
            >
              Cancel
            </button>
            <button 
              onClick={() => handleRejectFloat(session.id)}
              className='flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm font-semibold'
            >
              Reject
            </button>
            <button 
              onClick={() => handleApproveFloat(session.id)}
              disabled={hasDiscrepancy && !notes}
              className='flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1'
            >
              <MdCheck size={18} /> Approve
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Variance Modal (simplified version)
  const VarianceModal = ({ sessionId }) => {
    const session = allSessions.find(s => s.id === sessionId);
    if (!session) return null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowVarianceModal(null)}>
        <div className='bg-white rounded shadow-xl max-w-xl w-full mx-4' onClick={(e) => e.stopPropagation()}>
          <div className='p-4 bg-red-50 border-b border-red-200 flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <MdWarning className='text-red-600' size={20} />
              <h3 className='font-bold text-lg'>Variance Investigation</h3>
            </div>
            <button onClick={() => setShowVarianceModal(null)}>
              <MdClose size={20} />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>Session Variance</p>
              <p className={`text-3xl font-bold ${getVarianceColor(session.variance)}`}>
                {session.variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(session.variance))}
              </p>
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                Investigation Notes
              </label>
              <textarea
                placeholder='Document findings and resolution...'
                rows='4'
                className='w-full p-3 border border-gray-300 rounded text-xs'
              />
            </div>
          </div>

          <div className='p-4 bg-gray-50 border-t flex gap-3'>
            <button 
              onClick={() => setShowVarianceModal(null)}
              className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-semibold'
            >
              Close
            </button>
            <button className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm font-semibold'>
              Save Investigation
            </button>
          </div>
        </div>
      </div>
    );
  };

  const sessions = getCurrentSessions();

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Cash Sessions</h2>
          {pendingApprovalsCount > 0 && (
            <p className='text-sm text-orange-600 font-semibold mt-1'>
              ⚠️ {pendingApprovalsCount} session{pendingApprovalsCount > 1 ? 's' : ''} pending approval
            </p>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex gap-2'>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                activeTab === 'active' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active ({activeSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                activeTab === 'closed' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Closed ({closedSessions.length})
            </button>
          </div>
          <div className='relative flex items-center'>
            <input 
              type='text' 
              placeholder='Search here ...' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px] text-xs' 
            />
            <BiSearch className='text-gray-500 relative left-[-5px]'/>
          </div>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <div className='flex space-x-2'>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              filterTab === 'all' ? 'bg-blue-500 text-white' : 'border text-gray-500 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
              filterTab === 'pending' ? 'bg-orange-500 text-white' : 'border text-orange-500 hover:bg-orange-50'
            }`}
          >
            <FaClock size={12} /> Pending Approval
          </button>
          <button
            onClick={() => setFilterTab('approved')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
              filterTab === 'approved' ? 'bg-green-500 text-white' : 'border text-green-500 hover:bg-green-50'
            }`}
          >
            <FaCheckCircle size={12} /> Approved
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
            <BiRefresh/> Refresh
          </button>
        </div>
        <div className='flex space-x-2'>
          <button className='border text-gray-50 bg-gray-500 hover:bg-gray-50 hover:text-gray-500 text-xs flex items-center space-x-1 py-1 px-3'>
            <FaPrint/> Print
          </button>
        </div>
      </div>

      <hr className='text-gray-400' />

      <div className='bg-white overflow-x-auto'>
        <table className='w-full table-auto text-gray-500 text-xs'>
          <thead className='border-b-4 border-gray-300'>
            <tr>
              <th className='text-center py-1 px-2'><input type='checkbox' /></th>
              <th className='text-center py-1 px-2'>Cashier</th>
              <th className='text-center py-1 px-2'>Register</th>
              <th className='text-center py-1 px-2'>Opened</th>
              {activeTab === 'closed' && <th className='text-center py-1 px-2'>Closed</th>}
              <th className='text-center py-1 px-2'>Float Source</th>
              <th className='text-center py-1 px-2'>Float Given</th>
              <th className='text-center py-1 px-2'>Float Received</th>
              <th className='text-center py-1 px-2'>Sales</th>
              <th className='text-center py-1 px-2'>Approval</th>
              {activeTab === 'closed' && <th className='text-center py-1 px-2'>Variance</th>}
              <th className='text-center py-1 px-2'>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan='12' className='text-center py-12'>
                  <FaCashRegister className='text-gray-400 mx-auto mb-2' size={32} />
                  <p className='text-gray-600 font-semibold'>No sessions found</p>
                </td>
              </tr>
            ) : (
              sessions.map(session => {
                const hasFloatDiscrepancy = session.floatGiven !== session.floatReceived;
                return (
                  <React.Fragment key={session.id}>
                    <tr className='border-b border-gray-300 hover:bg-gray-50'>
                      <td className='text-center py-1 px-2'><input type='checkbox' /></td>
                      <td className='text-center py-1 px-2 font-semibold'>{session.cashier}</td>
                      <td className='text-center py-1 px-2'>
                        <span className='bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold'>
                          {session.register}
                        </span>
                      </td>
                      <td className='text-center py-1 px-2'>{session.openedAt}</td>
                      {activeTab === 'closed' && <td className='text-center py-1 px-2'>{session.closedAt}</td>}
                      <td className='text-center py-1 px-2'>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getFloatSourceColor(session.floatSource)}`}>
                          {getFloatSourceLabel(session.floatSource)}
                        </span>
                        {session.sourceCashier && (
                          <div className='text-xs text-gray-600 mt-1'>{session.sourceCashier}</div>
                        )}
                      </td>
                      <td className='text-center py-1 px-2 font-semibold'>{formatCurrency(session.floatGiven)}</td>
                      <td className='text-center py-1 px-2'>
                        <span className={hasFloatDiscrepancy ? 'text-red-600 font-bold' : 'font-semibold'}>
                          {formatCurrency(session.floatReceived)}
                          {hasFloatDiscrepancy && (
                            <FaExclamationTriangle className='inline ml-1 text-yellow-600' size={10} />
                          )}
                        </span>
                      </td>
                      <td className='text-center py-1 px-2 font-semibold'>{formatCurrency(session.sales)}</td>
                      <td className='text-center py-1 px-2'>
                        {session.floatApproved ? (
                          <div className='bg-green-200 border font-semibold text-green-600 text-2xs p-1 inline-flex items-center gap-1'>
                            <FaCheckCircle size={10} /> Approved
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowApprovalModal(session.id)}
                            className='bg-orange-200 border font-semibold text-orange-600 text-2xs p-1 hover:bg-orange-300 inline-flex items-center gap-1'
                          >
                            <FaClock size={10} /> Pending
                          </button>
                        )}
                      </td>
                      {activeTab === 'closed' && (
                        <td className='text-center py-1 px-2'>
                          <span className={`font-bold ${getVarianceColor(session.variance)}`}>
                            {session.variance === 0 ? '0' : 
                             `${session.variance < 0 ? '-' : '+'}${formatCurrency(Math.abs(session.variance))}`}
                          </span>
                        </td>
                      )}
                      <td className='text-center py-1 px-2'>
                        <div className='inline-flex border border-gray-200'>
                          <button 
                            onClick={() => toggleRow(session.id)}
                            className={`p-1 px-3 cursor-pointer ${expandedRows.includes(session.id) ? 'bg-blue-100' : 'bg-gray-100'}`}
                          >
                            <LuSquareArrowDownRight className={`transform transition-transform ${expandedRows.includes(session.id) ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.includes(session.id) && <ExpandedRowDetails session={session} />}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showApprovalModal && <ApprovalModal sessionId={showApprovalModal} />}
      {showVarianceModal && <VarianceModal sessionId={showVarianceModal} />}
    </div>
  );
}