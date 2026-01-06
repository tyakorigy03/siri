import React, { useState } from 'react';
import { BiSearch, BiRefresh, BiCopy } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload, FaEnvelope, FaPhone } from 'react-icons/fa6';
import { MdCheckCircle, MdClose, MdWarning } from 'react-icons/md';
import { LuSquareArrowDownRight } from 'react-icons/lu';

export default function CustomerCreditManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Mock data
  const creditSummary = {
    totalOutstanding: 8500000,
    overdueAmount: 2300000,
    totalCustomers: 12,
    overdueCustomers: 5,
    avgDaysToPayment: 42,
    creditUtilization: 65
  };

  const customers = [
    {
      id: 1,
      name: 'ABC Corporation',
      code: 'CUST-001',
      creditLimit: 5000000,
      used: 3200000,
      available: 1800000,
      outstanding: 3200000,
      overdue: 1500000,
      daysOverdue: 45,
      lastPayment: '15/12/2025',
      lastPaymentAmount: 800000,
      invoices: [
        { invoice: 'INV-001', date: '15/11/2025', amount: 1500000, dueDate: '15/12/2025', status: 'overdue', daysOverdue: 21 },
        { invoice: 'INV-045', date: '28/12/2025', amount: 1700000, dueDate: '28/01/2026', status: 'pending', daysOverdue: 0 }
      ],
      contact: { email: 'accounts@abc.com', phone: '+250 788 123 456' }
    },
    {
      id: 2,
      name: 'XYZ Ltd',
      code: 'CUST-002',
      creditLimit: 3000000,
      used: 800000,
      available: 2200000,
      outstanding: 800000,
      overdue: 800000,
      daysOverdue: 95,
      lastPayment: '01/10/2025',
      lastPaymentAmount: 500000,
      invoices: [
        { invoice: 'INV-012', date: '02/10/2025', amount: 800000, dueDate: '02/11/2025', status: 'overdue', daysOverdue: 65 }
      ],
      contact: { email: 'finance@xyz.com', phone: '+250 788 234 567' }
    },
    {
      id: 3,
      name: 'Tech Solutions Inc',
      code: 'CUST-003',
      creditLimit: 4000000,
      used: 2500000,
      available: 1500000,
      outstanding: 2500000,
      overdue: 0,
      daysOverdue: 0,
      lastPayment: '28/12/2025',
      lastPaymentAmount: 1200000,
      invoices: [
        { invoice: 'INV-078', date: '15/12/2025', amount: 1200000, dueDate: '15/01/2026', status: 'pending', daysOverdue: 0 },
        { invoice: 'INV-089', date: '28/12/2025', amount: 1300000, dueDate: '28/01/2026', status: 'pending', daysOverdue: 0 }
      ],
      contact: { email: 'admin@techsolutions.com', phone: '+250 788 345 678' }
    },
    {
      id: 4,
      name: 'Green Energy Ltd',
      code: 'CUST-004',
      creditLimit: 2500000,
      used: 1200000,
      available: 1300000,
      outstanding: 1200000,
      overdue: 0,
      daysOverdue: 0,
      lastPayment: '20/12/2025',
      lastPaymentAmount: 600000,
      invoices: [
        { invoice: 'INV-092', date: '20/12/2025', amount: 1200000, dueDate: '20/01/2026', status: 'pending', daysOverdue: 0 }
      ],
      contact: { email: 'billing@greenenergy.com', phone: '+250 788 456 789' }
    },
    {
      id: 5,
      name: 'Prime Enterprises',
      code: 'CUST-005',
      creditLimit: 3500000,
      used: 800000,
      available: 2700000,
      outstanding: 800000,
      overdue: 0,
      daysOverdue: 0,
      lastPayment: '30/12/2025',
      lastPaymentAmount: 400000,
      invoices: [
        { invoice: 'INV-098', date: '30/12/2025', amount: 800000, dueDate: '30/01/2026', status: 'pending', daysOverdue: 0 }
      ],
      contact: { email: 'accounts@primeent.com', phone: '+250 788 567 890' }
    }
  ];

  const getFilteredCustomers = () => {
    let filtered = customers;
    
    if (activeTab === 'overdue') {
      filtered = filtered.filter(c => c.overdue > 0);
    } else if (activeTab === 'critical') {
      filtered = filtered.filter(c => c.daysOverdue >= 90);
    } else if (activeTab === 'near_limit') {
      filtered = filtered.filter(c => (c.used / c.creditLimit) >= 0.8);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getAgingColor = (days) => {
    if (days === 0) return 'bg-green-200 text-green-700';
    if (days <= 30) return 'bg-yellow-200 text-yellow-700';
    if (days <= 60) return 'bg-orange-200 text-orange-700';
    if (days <= 90) return 'bg-red-200 text-red-700';
    return 'bg-red-500 text-white';
  };

  const getAgingLabel = (days) => {
    if (days === 0) return 'Current';
    if (days <= 30) return '1-30 days';
    if (days <= 60) return '31-60 days';
    if (days <= 90) return '61-90 days';
    return '90+ days';
  };

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleRecordPayment = (customer) => {
    setShowPaymentModal(customer);
    setPaymentAmount('');
  };

  const confirmPayment = async () => {
    alert(`Payment of ${paymentAmount} recorded for ${showPaymentModal.name}`);
    setShowPaymentModal(null);
    setPaymentAmount('');
  };

  const handleSendReminder = (customer) => {
    setShowReminderModal(customer);
  };

  const sendReminder = async (method) => {
    alert(`${method} reminder sent to ${showReminderModal.name}`);
    setShowReminderModal(null);
  };

  const PaymentModal = () => {
    if (!showPaymentModal) return null;
    const customer = showPaymentModal;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowPaymentModal(null)}>
        <div className='bg-white rounded shadow-xl max-w-xl w-full mx-4' onClick={(e) => e.stopPropagation()}>
          <div className='p-4 bg-green-50 border-b border-green-200 flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <MdCheckCircle className='text-green-600' size={24} />
              <h3 className='font-bold text-lg'>Record Payment</h3>
            </div>
            <button onClick={() => setShowPaymentModal(null)} className='text-gray-600 hover:text-gray-800'>
              <MdClose size={24} />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div className='bg-gray-100 p-4 rounded'>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <p className='text-gray-600 mb-1'>Customer</p>
                  <p className='font-bold'>{customer.name}</p>
                </div>
                <div>
                  <p className='text-gray-600 mb-1'>Outstanding</p>
                  <p className='font-bold text-red-600'>RWF {formatCurrency(customer.outstanding)}</p>
                </div>
              </div>
              {customer.overdue > 0 && (
                <div className='mt-2 bg-red-50 border border-red-200 p-2 rounded'>
                  <p className='text-xs text-red-800'><span className='font-semibold'>Overdue:</span> RWF {formatCurrency(customer.overdue)} ({customer.daysOverdue} days)</p>
                </div>
              )}
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Payment Amount (RWF)</label>
              <input
                type='text'
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder='Enter amount...'
                className='w-full p-3 border border-gray-300 rounded text-lg font-bold focus:border-blue-500 focus:outline-none'
              />
              <div className='flex gap-2 mt-2'>
                <button onClick={() => setPaymentAmount(customer.overdue.toString())} className='flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 py-1 rounded text-xs font-semibold'>
                  Pay Overdue ({formatCurrency(customer.overdue)})
                </button>
                <button onClick={() => setPaymentAmount(customer.outstanding.toString())} className='flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-1 rounded text-xs font-semibold'>
                  Pay Full ({formatCurrency(customer.outstanding)})
                </button>
              </div>
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Payment Method</label>
              <select className='w-full p-2 border border-gray-300 rounded text-sm'>
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>MOMO</option>
                <option>Check</option>
              </select>
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Notes (Optional)</label>
              <textarea
                placeholder='Payment notes...'
                rows='2'
                className='w-full p-2 border border-gray-300 rounded text-sm'
              />
            </div>
          </div>

          <div className='p-4 bg-gray-50 border-t flex gap-3'>
            <button onClick={() => setShowPaymentModal(null)} className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-semibold'>
              Cancel
            </button>
            <button onClick={confirmPayment} disabled={!paymentAmount} className='flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm font-semibold disabled:opacity-50'>
              Record Payment
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReminderModal = () => {
    if (!showReminderModal) return null;
    const customer = showReminderModal;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowReminderModal(null)}>
        <div className='bg-white rounded shadow-xl max-w-md w-full mx-4' onClick={(e) => e.stopPropagation()}>
          <div className='p-4 bg-blue-50 border-b border-blue-200 flex justify-between items-center'>
            <h3 className='font-bold text-lg'>Send Payment Reminder</h3>
            <button onClick={() => setShowReminderModal(null)} className='text-gray-600 hover:text-gray-800'>
              <MdClose size={24} />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div className='bg-gray-100 p-3 rounded text-sm'>
              <p className='font-bold mb-2'>{customer.name}</p>
              <p className='text-gray-600'>Outstanding: <span className='font-semibold text-red-600'>RWF {formatCurrency(customer.outstanding)}</span></p>
              {customer.overdue > 0 && (
                <p className='text-red-700 mt-1'>Overdue: <span className='font-semibold'>RWF {formatCurrency(customer.overdue)} ({customer.daysOverdue} days)</span></p>
              )}
            </div>

            <div>
              <p className='text-xs font-semibold text-gray-700 mb-3 uppercase'>Select Method:</p>
              <div className='space-y-2'>
                <button onClick={() => sendReminder('Email')} className='w-full flex items-center gap-3 p-3 border border-gray-300 rounded hover:bg-blue-50'>
                  <FaEnvelope className='text-blue-600' size={20} />
                  <div className='text-left'>
                    <p className='font-semibold text-sm'>Email Reminder</p>
                    <p className='text-xs text-gray-600'>{customer.contact.email}</p>
                  </div>
                </button>
                <button onClick={() => sendReminder('SMS')} className='w-full flex items-center gap-3 p-3 border border-gray-300 rounded hover:bg-green-50'>
                  <FaPhone className='text-green-600' size={18} />
                  <div className='text-left'>
                    <p className='font-semibold text-sm'>SMS Reminder</p>
                    <p className='text-xs text-gray-600'>{customer.contact.phone}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ExpandedRowDetails = ({ customer }) => (
    <tr className='bg-gray-50'>
      <td colSpan='10' className='p-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-3'>Invoices</p>
            <div className='space-y-2 text-xs'>
              {customer.invoices.map((inv, idx) => (
                <div key={idx} className={`p-2 rounded border ${inv.status === 'overdue' ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className='flex justify-between mb-1'>
                    <span className='font-bold text-blue-600'>{inv.invoice}</span>
                    <span className='font-bold'>RWF {formatCurrency(inv.amount)}</span>
                  </div>
                  <div className='flex justify-between text-xs text-gray-600'>
                    <span>Date: {inv.date}</span>
                    <span>Due: {inv.dueDate}</span>
                  </div>
                  {inv.status === 'overdue' && (
                    <div className='mt-1 text-red-700 font-semibold'>
                      ⚠️ {inv.daysOverdue} days overdue
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-3'>
            <div className='bg-white border border-gray-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Contact Information</p>
              <div className='space-y-1 text-xs'>
                <div className='flex items-center gap-2'>
                  <FaEnvelope size={12} className='text-gray-600' />
                  <span>{customer.contact.email}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <FaPhone size={12} className='text-gray-600' />
                  <span>{customer.contact.phone}</span>
                </div>
              </div>
            </div>

            <div className='bg-white border border-gray-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Last Payment</p>
              <div className='space-y-1 text-xs'>
                <p>Amount: <span className='font-semibold'>RWF {formatCurrency(customer.lastPaymentAmount)}</span></p>
                <p>Date: <span className='font-semibold'>{customer.lastPayment}</span></p>
              </div>
            </div>

            <div className='flex gap-2'>
              <button onClick={() => handleRecordPayment(customer)} className='flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded text-xs font-semibold'>
                Record Payment
              </button>
              <button onClick={() => handleSendReminder(customer)} className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-xs font-semibold'>
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  const filteredCustomers = getFilteredCustomers();

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Customer Credit Management</h2>
          <p className='text-sm text-gray-600 mt-1'>Track and manage credit sales & collections</p>
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

      {/* Summary Cards */}
      <div className='grid grid-cols-6 gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Total Outstanding</p>
          <p className='text-2xl font-bold text-red-600'>RWF {formatCurrency(creditSummary.totalOutstanding)}</p>
        </div>
        <div className='bg-white border border-red-300 rounded shadow p-4 bg-red-50'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Overdue Amount</p>
          <p className='text-2xl font-bold text-red-700'>RWF {formatCurrency(creditSummary.overdueAmount)}</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Total Customers</p>
          <p className='text-2xl font-bold'>{creditSummary.totalCustomers}</p>
        </div>
        <div className='bg-white border border-orange-300 rounded shadow p-4 bg-orange-50'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Overdue Customers</p>
          <p className='text-2xl font-bold text-orange-700'>{creditSummary.overdueCustomers}</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Avg Days to Payment</p>
          <p className='text-2xl font-bold'>{creditSummary.avgDaysToPayment}</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Credit Utilization</p>
          <p className='text-2xl font-bold text-blue-600'>{creditSummary.creditUtilization}%</p>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <div className='flex gap-2'>
          <button onClick={() => setActiveTab('all')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            All ({customers.length})
          </button>
          <button onClick={() => setActiveTab('overdue')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'overdue' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Overdue ({customers.filter(c => c.overdue > 0).length})
          </button>
          <button onClick={() => setActiveTab('critical')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'critical' ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            90+ Days ({customers.filter(c => c.daysOverdue >= 90).length})
          </button>
          <button onClick={() => setActiveTab('near_limit')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'near_limit' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Near Limit ({customers.filter(c => (c.used / c.creditLimit) >= 0.8).length})
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <BiRefresh size={14} /> Refresh
          </button>
        </div>
        <div className='relative flex items-center'>
          <input type='text' placeholder='Search customers...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px] text-xs' />
          <BiSearch className='text-gray-500 relative left-[-5px]' />
        </div>
      </div>

      <hr className='text-gray-400' />

      <div className='bg-white overflow-x-auto'>
        <table className='w-full table-auto text-gray-500 text-xs'>
          <thead className='border-b-4 border-gray-300'>
            <tr>
              <th className='text-center py-1 px-2'><input type='checkbox' /></th>
              <th className='text-left py-1 px-2'>Customer</th>
              <th className='text-right py-1 px-2'>Credit Limit</th>
              <th className='text-right py-1 px-2'>Used</th>
              <th className='text-right py-1 px-2'>Available</th>
              <th className='text-right py-1 px-2'>Outstanding</th>
              <th className='text-right py-1 px-2'>Overdue</th>
              <th className='text-center py-1 px-2'>Aging</th>
              <th className='text-center py-1 px-2'>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan='9' className='text-center py-12'>
                  <p className='text-gray-600 font-semibold'>No customers found</p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <React.Fragment key={customer.id}>
                  <tr className='border-b border-gray-300 hover:bg-gray-50'>
                    <td className='text-center py-1 px-2'><input type='checkbox' /></td>
                    <td className='py-1 px-2'>
                      <div>
                        <p className='font-bold'>{customer.name}</p>
                        <p className='text-gray-600'>{customer.code}</p>
                      </div>
                    </td>
                    <td className='text-right py-1 px-2 font-semibold'>{formatCurrency(customer.creditLimit)}</td>
                    <td className='text-right py-1 px-2'>
                      <div>
                        <p className='font-semibold'>{formatCurrency(customer.used)}</p>
                        <p className='text-gray-600'>{((customer.used / customer.creditLimit) * 100).toFixed(0)}%</p>
                      </div>
                    </td>
                    <td className='text-right py-1 px-2 font-semibold'>{formatCurrency(customer.available)}</td>
                    <td className='text-right py-1 px-2 font-bold text-red-600'>{formatCurrency(customer.outstanding)}</td>
                    <td className='text-right py-1 px-2'>
                      {customer.overdue > 0 ? (
                        <span className='font-bold text-red-700'>{formatCurrency(customer.overdue)}</span>
                      ) : (
                        <span className='text-gray-400'>-</span>
                      )}
                    </td>
                    <td className='text-center py-1 px-2'>
                      <span className={`${getAgingColor(customer.daysOverdue)} px-2 py-0.5 rounded text-2xs font-semibold`}>
                        {getAgingLabel(customer.daysOverdue)}
                      </span>
                    </td>
                    <td className='text-center py-1 px-2'>
                      <div className='inline-flex border border-gray-200'>
                        {customer.overdue > 0 && (
                          <>
                            <button onClick={() => handleRecordPayment(customer)} title='Record Payment' className='p-1 cursor-pointer text-green-600 hover:bg-green-50'>
                              <MdCheckCircle size={16} />
                            </button>
                            <button onClick={() => handleSendReminder(customer)} title='Send Reminder' className='p-1 cursor-pointer text-blue-600 hover:bg-blue-50'>
                              <FaEnvelope size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => toggleRow(customer.id)} className={`p-1 px-3 cursor-pointer ${expandedRows.includes(customer.id) ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <LuSquareArrowDownRight className={`transform transition-transform ${expandedRows.includes(customer.id) ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.includes(customer.id) && <ExpandedRowDetails customer={customer} />}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Aging Analysis */}
      <div className='bg-white border border-gray-300 rounded shadow'>
        <div className='p-4 bg-gray-100 border-b border-gray-300'>
          <h3 className='font-bold text-sm uppercase'>Aging Analysis</h3>
        </div>
        <div className='p-4'>
          <div className='grid grid-cols-5 gap-3 text-xs text-center'>
            <div className='bg-green-50 border border-green-200 p-3 rounded'>
              <p className='font-semibold text-green-700 mb-1'>Current</p>
              <p className='text-xl font-bold'>RWF {formatCurrency(4200000)}</p>
              <p className='text-gray-600 mt-1'>3 invoices</p>
            </div>
            <div className='bg-yellow-50 border border-yellow-200 p-3 rounded'>
              <p className='font-semibold text-yellow-700 mb-1'>1-30 Days</p>
              <p className='text-xl font-bold'>RWF {formatCurrency(2000000)}</p>
              <p className='text-gray-600 mt-1'>2 invoices</p>
            </div>
            <div className='bg-orange-50 border border-orange-200 p-3 rounded'>
              <p className='font-semibold text-orange-700 mb-1'>31-60 Days</p>
              <p className='text-xl font-bold'>RWF {formatCurrency(1500000)}</p>
              <p className='text-gray-600 mt-1'>1 invoice</p>
            </div>
            <div className='bg-red-50 border border-red-200 p-3 rounded'>
              <p className='font-semibold text-red-700 mb-1'>61-90 Days</p>
              <p className='text-xl font-bold'>RWF {formatCurrency(0)}</p>
              <p className='text-gray-600 mt-1'>0 invoices</p>
            </div>
            <div className='bg-red-100 border border-red-300 p-3 rounded'>
              <p className='font-semibold text-red-800 mb-1'>90+ Days</p>
              <p className='text-xl font-bold'>RWF {formatCurrency(800000)}</p>
              <p className='text-gray-600 mt-1'>1 invoice</p>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal />
      <ReminderModal />
    </div>
  );
}