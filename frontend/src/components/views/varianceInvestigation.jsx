import React, { useState } from 'react';
import { BiSearch, BiRefresh, BiUpload } from 'react-icons/bi';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaChartLine } from 'react-icons/fa';
import { MdWarning, MdCheckCircle, MdClose, MdAttachFile } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload } from 'react-icons/fa6';

export default function VarianceInvestigation() {
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [reasonCategory, setReasonCategory] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('pending');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Mock data - In real app, would come from route params/API
  const sessionData = {
    id: 1,
    cashier: 'Mike Johnson',
    register: 'POS-01',
    date: '05/01/2026',
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
    variancePercentage: -0.77
  };

  const cashierHistory = {
    totalSessions: 156,
    sessionsWithVariance: 12,
    averageVariance: -1200,
    largestVariance: -8000,
    lastVarianceDate: '28/12/2025',
    varianceRate: 7.7, // percentage
    averageSales: 4200000,
    performanceRating: 'good'
  };

  const transactionList = [
    { time: '08:15', type: 'Sale', amount: 45000, payment: 'Cash', items: 2, receipt: 'RCP-001' },
    { time: '08:32', type: 'Sale', amount: 120000, payment: 'MOMO', items: 1, receipt: 'RCP-002' },
    { time: '09:10', type: 'Sale', amount: 85000, payment: 'Card', items: 3, receipt: 'RCP-003' },
    { time: '09:45', type: 'Sale', amount: 35000, payment: 'Cash', items: 1, receipt: 'RCP-004' },
    { time: '10:20', type: 'Sale', amount: 250000, payment: 'MOMO', items: 1, receipt: 'RCP-005' },
    { time: '10:55', type: 'Sale', amount: 15000, payment: 'Cash', items: 2, receipt: 'RCP-006' },
    { time: '11:30', type: 'Sale', amount: 180000, payment: 'Card', items: 4, receipt: 'RCP-007' },
    { time: '12:00', type: 'Sale', amount: 95000, payment: 'MOMO', items: 2, receipt: 'RCP-008' },
    { time: '14:15', type: 'Sale', amount: 320000, payment: 'MOMO', items: 1, receipt: 'RCP-009' },
    { time: '15:30', type: 'Sale', amount: 65000, payment: 'Cash', items: 3, receipt: 'RCP-010' }
  ];

  const hourlyBreakdown = [
    { hour: '08:00-09:00', transactions: 5, sales: 450000, cashSales: 80000 },
    { hour: '09:00-10:00', transactions: 6, sales: 520000, cashSales: 35000 },
    { hour: '10:00-11:00', transactions: 8, sales: 680000, cashSales: 15000 },
    { hour: '11:00-12:00', transactions: 7, sales: 595000, cashSales: 0 },
    { hour: '12:00-13:00', transactions: 4, sales: 380000, cashSales: 95000 },
    { hour: '14:00-15:00', transactions: 5, sales: 620000, cashSales: 0 },
    { hour: '15:00-16:00', transactions: 4, sales: 480000, cashSales: 65000 },
    { hour: '16:00-17:00', transactions: 3, sales: 410000, cashSales: 80000 },
    { hour: '17:00-18:00', transactions: 3, sales: 365000, cashSales: 80000 }
  ];

  const reasonCategories = [
    'Counting Error',
    'Till Shortfall',
    'Till Overage',
    'Transaction Error',
    'System Error',
    'Theft Suspected',
    'Change Given Incorrectly',
    'Unreturned Float',
    'Other'
  ];

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getVarianceColor = (variance) => {
    if (variance === 0) return 'text-gray-800';
    return variance < 0 ? 'text-red-600' : 'text-green-600';
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!investigationNotes || !reasonCategory || !actionTaken) {
      alert('Please fill in all required fields');
      return;
    }
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Investigation saved successfully!');
      setShowSubmitModal(false);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const SubmitModal = () => {
    if (!showSubmitModal) return null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowSubmitModal(false)}>
        <div className='bg-white rounded shadow-xl max-w-2xl w-full mx-4' onClick={(e) => e.stopPropagation()}>
          <div className='p-4 bg-blue-50 border-b border-blue-200 flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <MdCheckCircle className='text-blue-600' size={24} />
              <h3 className='font-bold text-lg'>Confirm Investigation Submission</h3>
            </div>
            <button onClick={() => setShowSubmitModal(false)} className='text-gray-600 hover:text-gray-800'>
              <MdClose size={24} />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div className='bg-gray-100 p-4 rounded'>
              <p className='text-sm font-semibold mb-2'>Investigation Summary</p>
              <div className='space-y-1 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Cashier:</span>
                  <span className='font-semibold'>{sessionData.cashier}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Variance:</span>
                  <span className={`font-bold ${getVarianceColor(sessionData.variance)}`}>
                    {formatCurrency(Math.abs(sessionData.variance))}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Reason:</span>
                  <span className='font-semibold'>{reasonCategory}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Status:</span>
                  <span className='font-semibold capitalize'>{resolutionStatus}</span>
                </div>
              </div>
            </div>

            <div className='bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs'>
              <p className='font-semibold text-yellow-800 mb-1'>Important</p>
              <p className='text-gray-700'>This investigation will be permanently recorded and visible in audit logs.</p>
            </div>
          </div>

          <div className='p-4 bg-gray-50 border-t flex gap-3'>
            <button onClick={() => setShowSubmitModal(false)} disabled={isSubmitting} className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-semibold disabled:opacity-50'>
              Cancel
            </button>
            <button onClick={confirmSubmit} disabled={isSubmitting} className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2'>
              {isSubmitting ? (
                <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Saving...</>
              ) : (
                <><MdCheckCircle size={18} />Confirm & Save</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Variance Investigation</h2>
          <p className='text-sm text-gray-600 mt-1'>Session #{sessionData.id} - {sessionData.cashier} - {sessionData.date}</p>
        </div>
        <div className='flex gap-2'>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <FaDownload size={12} /> Export PDF
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <FaPrint size={12} /> Print
          </button>
        </div>
      </div>

      {/* Variance Alert Banner */}
      <div className={`${sessionData.variance < 0 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'} border-2 rounded p-4`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {sessionData.variance < 0 ? (
              <FaExclamationTriangle className='text-red-600' size={32} />
            ) : (
              <FaCheckCircle className='text-green-600' size={32} />
            )}
            <div>
              <p className='font-bold text-lg'>{sessionData.variance < 0 ? 'Cash Shortage Detected' : 'Cash Overage Detected'}</p>
              <p className='text-sm text-gray-700'>
                Variance: <span className={`font-bold text-xl ${getVarianceColor(sessionData.variance)}`}>
                  {sessionData.variance < 0 ? '-' : '+'}RWF {formatCurrency(Math.abs(sessionData.variance))}
                </span> ({sessionData.variancePercentage}% of cash sales)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-6'>
        {/* Left Column - Session Details */}
        <div className='col-span-2 space-y-6'>
          {/* Session Summary */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Session Summary</h3>
            </div>
            <div className='p-4'>
              <div className='grid grid-cols-3 gap-4 text-xs'>
                <div className='bg-gray-50 p-3 rounded'>
                  <p className='text-gray-600 mb-1'>Cashier</p>
                  <p className='font-bold'>{sessionData.cashier}</p>
                  <p className='text-gray-600'>{sessionData.register}</p>
                </div>
                <div className='bg-gray-50 p-3 rounded'>
                  <p className='text-gray-600 mb-1'>Session Time</p>
                  <p className='font-semibold'>{sessionData.openedAt} - {sessionData.closedAt}</p>
                  <p className='text-gray-600'>{sessionData.date}</p>
                </div>
                <div className='bg-gray-50 p-3 rounded'>
                  <p className='text-gray-600 mb-1'>Transactions</p>
                  <p className='font-bold text-lg'>{sessionData.transactions}</p>
                  <p className='text-gray-600'>Total</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 mt-4'>
                <div className='bg-blue-50 border border-blue-200 p-3 rounded'>
                  <p className='text-xs font-semibold text-gray-700 mb-2 uppercase'>Sales Breakdown</p>
                  <div className='space-y-1 text-xs'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Cash:</span>
                      <span className='font-semibold'>{formatCurrency(sessionData.cashSales)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>MOMO:</span>
                      <span className='font-semibold'>{formatCurrency(sessionData.momoSales)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Card:</span>
                      <span className='font-semibold'>{formatCurrency(sessionData.cardSales)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Credit:</span>
                      <span className='font-semibold'>{formatCurrency(sessionData.creditSales)}</span>
                    </div>
                    <div className='flex justify-between border-t border-blue-300 pt-1 mt-1'>
                      <span className='font-bold'>Total:</span>
                      <span className='font-bold'>{formatCurrency(sessionData.sales)}</span>
                    </div>
                  </div>
                </div>

                <div className='bg-purple-50 border border-purple-200 p-3 rounded'>
                  <p className='text-xs font-semibold text-gray-700 mb-2 uppercase'>Cash Reconciliation</p>
                  <div className='space-y-1 text-xs'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Opening Float:</span>
                      <span className='font-semibold'>{formatCurrency(sessionData.floatReceived)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>+ Cash Sales:</span>
                      <span className='font-semibold'>{formatCurrency(sessionData.cashSales)}</span>
                    </div>
                    <div className='flex justify-between border-t border-purple-300 pt-1 mt-1'>
                      <span className='font-semibold'>Expected:</span>
                      <span className='font-bold'>{formatCurrency(sessionData.expectedCash)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='font-semibold'>Actual:</span>
                      <span className='font-bold'>{formatCurrency(sessionData.actualCash)}</span>
                    </div>
                    <div className={`flex justify-between border-t-2 ${sessionData.variance < 0 ? 'border-red-500' : 'border-green-500'} pt-1 mt-1`}>
                      <span className='font-bold'>Variance:</span>
                      <span className={`font-bold text-lg ${getVarianceColor(sessionData.variance)}`}>
                        {sessionData.variance < 0 ? '-' : '+'}RWF {formatCurrency(Math.abs(sessionData.variance))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Breakdown */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Hourly Transaction Breakdown</h3>
            </div>
            <div className='p-4 overflow-x-auto'>
              <table className='w-full text-xs'>
                <thead className='border-b-2 border-gray-300'>
                  <tr>
                    <th className='text-left py-1 px-2'>Hour</th>
                    <th className='text-center py-1 px-2'>Transactions</th>
                    <th className='text-right py-1 px-2'>Total Sales</th>
                    <th className='text-right py-1 px-2'>Cash Sales</th>
                    <th className='text-right py-1 px-2'>Avg/Trans</th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyBreakdown.map((hour, idx) => (
                    <tr key={idx} className='border-b border-gray-200'>
                      <td className='py-2 px-2 font-semibold'>{hour.hour}</td>
                      <td className='text-center py-2 px-2'>{hour.transactions}</td>
                      <td className='text-right py-2 px-2 font-semibold'>{formatCurrency(hour.sales)}</td>
                      <td className='text-right py-2 px-2'>{formatCurrency(hour.cashSales)}</td>
                      <td className='text-right py-2 px-2'>{formatCurrency(Math.round(hour.sales / hour.transactions))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction List */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center'>
              <h3 className='font-bold text-sm uppercase'>Transaction History ({transactionList.length} shown)</h3>
              <button className='text-xs text-blue-600 hover:text-blue-800 font-semibold'>View All →</button>
            </div>
            <div className='p-4'>
              <table className='w-full text-xs'>
                <thead className='border-b-2 border-gray-300'>
                  <tr>
                    <th className='text-left py-1 px-2'>Time</th>
                    <th className='text-left py-1 px-2'>Receipt</th>
                    <th className='text-center py-1 px-2'>Items</th>
                    <th className='text-center py-1 px-2'>Payment</th>
                    <th className='text-right py-1 px-2'>Amount</th>
                    <th className='text-center py-1 px-2'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionList.map((trans, idx) => (
                    <tr key={idx} className='border-b border-gray-200 hover:bg-gray-50'>
                      <td className='py-2 px-2'>{trans.time}</td>
                      <td className='py-2 px-2 text-blue-600 font-semibold'>{trans.receipt}</td>
                      <td className='text-center py-2 px-2'>{trans.items}</td>
                      <td className='text-center py-2 px-2'>
                        <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                          trans.payment === 'Cash' ? 'bg-green-100 text-green-700' :
                          trans.payment === 'MOMO' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {trans.payment}
                        </span>
                      </td>
                      <td className='text-right py-2 px-2 font-semibold'>{formatCurrency(trans.amount)}</td>
                      <td className='text-center py-2 px-2'>
                        <button className='text-blue-600 hover:text-blue-800 text-xs font-semibold'>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Investigation Form & Cashier History */}
        <div className='space-y-6'>
          {/* Cashier History */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Cashier History</h3>
            </div>
            <div className='p-4 space-y-3 text-xs'>
              <div className='bg-gray-50 p-2 rounded'>
                <p className='text-gray-600 mb-1'>Total Sessions</p>
                <p className='font-bold text-lg'>{cashierHistory.totalSessions}</p>
              </div>
              <div className='bg-orange-50 p-2 rounded border border-orange-200'>
                <p className='text-gray-600 mb-1'>Sessions with Variance</p>
                <p className='font-bold text-lg text-orange-700'>{cashierHistory.sessionsWithVariance}</p>
                <p className='text-gray-600'>({cashierHistory.varianceRate}% rate)</p>
              </div>
              <div className='bg-red-50 p-2 rounded border border-red-200'>
                <p className='text-gray-600 mb-1'>Average Variance</p>
                <p className='font-bold text-red-600'>{cashierHistory.averageVariance < 0 ? '-' : '+'}RWF {formatCurrency(Math.abs(cashierHistory.averageVariance))}</p>
              </div>
              <div className='bg-gray-50 p-2 rounded'>
                <p className='text-gray-600 mb-1'>Largest Variance</p>
                <p className='font-bold text-red-600'>-RWF {formatCurrency(Math.abs(cashierHistory.largestVariance))}</p>
              </div>
              <div className='bg-gray-50 p-2 rounded'>
                <p className='text-gray-600 mb-1'>Last Variance</p>
                <p className='font-semibold'>{cashierHistory.lastVarianceDate}</p>
              </div>
              <div className='bg-blue-50 p-2 rounded border border-blue-200'>
                <p className='text-gray-600 mb-1'>Performance Rating</p>
                <p className='font-bold text-blue-700 capitalize'>{cashierHistory.performanceRating}</p>
              </div>
              <button className='w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-xs font-semibold mt-2'>
                View Full History →
              </button>
            </div>
          </div>

          {/* Investigation Form */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-orange-100 border-b border-orange-300'>
              <h3 className='font-bold text-sm uppercase text-orange-800'>Investigation Form</h3>
            </div>
            <div className='p-4 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Reason Category *
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
                >
                  <option value=''>-- Select Reason --</option>
                  {reasonCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Investigation Notes *
                </label>
                <textarea
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  placeholder='Detailed investigation findings...'
                  rows='4'
                  className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Action Taken *
                </label>
                <textarea
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder='What action was taken to resolve this?'
                  rows='3'
                  className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Resolution Status *
                </label>
                <div className='space-y-2'>
                  <label className='flex items-center gap-2'>
                    <input
                      type='radio'
                      value='pending'
                      checked={resolutionStatus === 'pending'}
                      onChange={(e) => setResolutionStatus(e.target.value)}
                      className='w-4 h-4'
                    />
                    <span className='text-xs'>Pending Investigation</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <input
                      type='radio'
                      value='resolved'
                      checked={resolutionStatus === 'resolved'}
                      onChange={(e) => setResolutionStatus(e.target.value)}
                      className='w-4 h-4'
                    />
                    <span className='text-xs'>Resolved/Explained</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <input
                      type='radio'
                      value='escalated'
                      checked={resolutionStatus === 'escalated'}
                      onChange={(e) => setResolutionStatus(e.target.value)}
                      className='w-4 h-4'
                    />
                    <span className='text-xs'>Escalated to Management</span>
                  </label>
                </div>
              </div>

              <div className='border-t border-gray-300 pt-3'>
                <label className='flex items-center gap-2 mb-3'>
                  <input
                    type='checkbox'
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    className='w-4 h-4'
                  />
                  <span className='text-xs font-semibold'>Follow-up Required</span>
                </label>

                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Attach Supporting Documents
                </label>
                <input
                  type='file'
                  multiple
                  onChange={handleFileUpload}
                  className='hidden'
                  id='file-upload'
                  accept='image/*,.pdf'
                />
                <label
                  htmlFor='file-upload'
                  className='w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded p-3 text-center cursor-pointer hover:bg-gray-200 block'
                >
                  <BiUpload className='mx-auto mb-1' size={20} />
                  <span className='text-xs text-gray-600'>Click to upload or drag files here</span>
                  <span className='text-xs text-gray-500 block'>(Photos, PDFs)</span>
                </label>

                {attachments.length > 0 && (
                  <div className='mt-2 space-y-1'>
                    {attachments.map((file, idx) => (
                      <div key={idx} className='flex items-center justify-between bg-gray-50 p-2 rounded text-xs'>
                        <div className='flex items-center gap-2'>
                          <MdAttachFile size={14} />
                          <span>{file.name}</span>
                        </div>
                        <button onClick={() => removeAttachment(idx)} className='text-red-600 hover:text-red-800'>
                          <MdClose size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                className='w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-bold text-sm uppercase flex items-center justify-center gap-2'
              >
                <MdCheckCircle size={18} />
                Save Investigation
              </button>
            </div>
          </div>
        </div>
      </div>

      <SubmitModal />
    </div>
  );
}