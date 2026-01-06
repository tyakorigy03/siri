import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiCopy, BiEdit, BiRefresh, BiScan, BiSearch, BiTrash } from 'react-icons/bi';
import { FaPrint } from 'react-icons/fa6';
import { FiFilter } from 'react-icons/fi';
import { LuSquareArrowDownRight } from 'react-icons/lu';
import { MdWarning } from 'react-icons/md';

export default function BackOfficeInvoice() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // all, credit, overdue, drafts, paid
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);

  const invoices = [
    {
      id: 1,
      code: 'INV-001',
      customerName: 'ABC Corporation',
      customerCode: 'CUST-001',
      dueDate: '15/01/2026',
      taxAmount: 236610,
      grossTotal: 1786610,
      paid: 1000000,
      wht: 0,
      balance: 786610,
      currency: 'RWF',
      status: 'OPEN', // OPEN, CLOSED, DRAFT
      paymentStatus: 'PARTIALLY_PAID',
      createdBy: 'Mike Johnson',
      createdAt: '02/01/2026',
      isCredit: true,
      daysOverdue: 0,
      creditLimit: 5000000,
      customerOutstanding: 3200000
    },
    {
      id: 2,
      code: 'INV-002',
      customerName: 'XYZ Ltd',
      customerCode: 'CUST-002',
      dueDate: '02/11/2025',
      taxAmount: 144000,
      grossTotal: 944000,
      paid: 144000,
      wht: 0,
      balance: 800000,
      currency: 'RWF',
      status: 'OPEN',
      paymentStatus: 'UNPAID',
      createdBy: 'Emma Davis',
      createdAt: '02/10/2025',
      isCredit: true,
      daysOverdue: 65,
      creditLimit: 3000000,
      customerOutstanding: 800000
    },
    {
      id: 3,
      code: 'INV-003',
      customerName: 'Walk-in Customer',
      customerCode: 'CUST-000',
      dueDate: '02/01/2026',
      taxAmount: 180000,
      grossTotal: 1180000,
      paid: 1180000,
      wht: 0,
      balance: 0,
      currency: 'RWF',
      status: 'CLOSED',
      paymentStatus: 'PAID',
      createdBy: 'Mike Johnson',
      createdAt: '02/01/2026',
      isCredit: false,
      daysOverdue: 0,
      creditLimit: 0,
      customerOutstanding: 0
    },
    {
      id: 4,
      code: 'INV-004',
      customerName: 'Tech Solutions Inc',
      customerCode: 'CUST-003',
      dueDate: '28/01/2026',
      taxAmount: 324000,
      grossTotal: 2124000,
      paid: 0,
      wht: 0,
      balance: 2124000,
      currency: 'RWF',
      status: 'DRAFT',
      paymentStatus: 'UNPAID',
      createdBy: 'Lisa Anderson',
      createdAt: '05/01/2026',
      isCredit: true,
      daysOverdue: 0,
      creditLimit: 4000000,
      customerOutstanding: 2500000
    }
  ];

  const formatCurrency = (amount) => `RWF ${amount.toLocaleString()}`;

  const totalAR = invoices
    .filter(inv => inv.status !== 'DRAFT')
    .reduce((sum, inv) => sum + inv.balance, 0);

  const overdueAR = invoices
    .filter(inv => inv.daysOverdue > 0 && inv.balance > 0)
    .reduce((sum, inv) => sum + inv.balance, 0);

  const creditAR = invoices
    .filter(inv => inv.isCredit && inv.balance > 0)
    .reduce((sum, inv) => sum + inv.balance, 0);

  const getFilteredInvoices = () => {
    let filtered = invoices;

    if (activeTab === 'credit') {
      filtered = filtered.filter(inv => inv.isCredit);
    } else if (activeTab === 'overdue') {
      filtered = filtered.filter(inv => inv.daysOverdue > 0 && inv.balance > 0);
    } else if (activeTab === 'drafts') {
      filtered = filtered.filter(inv => inv.status === 'DRAFT');
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(inv => inv.paymentStatus === 'PAID');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.code.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerCode.toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (invoice) => {
    if (invoice.status === 'DRAFT') {
      return <div className="bg-yellow-200 border font-semibold text-yellow-700 text-2xs p-1">Draft</div>;
    }
    if (invoice.paymentStatus === 'PAID') {
      return <div className="bg-green-200 border font-semibold text-green-600 text-2xs p-1">Closed</div>;
    }
    if (invoice.daysOverdue > 0 && invoice.balance > 0) {
      return <div className="bg-red-200 border font-semibold text-red-700 text-2xs p-1 flex items-center justify-center gap-1"><MdWarning size={10}/>Overdue</div>;
    }
    return <div className="bg-blue-200 border font-semibold text-blue-600 text-2xs p-1">Open</div>;
  };

  const ExpandedRow = ({ invoice }) => (
    <tr className='bg-gray-50'>
      <td colSpan='15' className='p-4'>
        <div className='grid grid-cols-2 gap-4 text-xs'>
          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Accounts Receivable Impact</p>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Customer</span>
                <span className='font-semibold'>{invoice.customerName} ({invoice.customerCode})</span>
              </div>
              {invoice.isCredit && (
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Credit Utilization</span>
                  <span className='font-semibold text-blue-700'>
                    {((invoice.customerOutstanding / invoice.creditLimit) * 100).toFixed(0)}% of limit
                  </span>
                </div>
              )}
              <div className='flex justify-between'>
                <span className='text-gray-600'>Gross Total</span>
                <span className='font-semibold'>{formatCurrency(invoice.grossTotal)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Paid</span>
                <span className='font-semibold text-green-700'>{formatCurrency(invoice.paid)}</span>
              </div>
              <div className='flex justify-between border-t border-gray-200 pt-2'>
                <span className='font-bold'>Balance (AR)</span>
                <span className='font-bold text-red-600'>{formatCurrency(invoice.balance)}</span>
              </div>
              {invoice.daysOverdue > 0 && (
                <div className='mt-2 bg-red-50 border border-red-200 p-2 rounded'>
                  <p className='text-red-700 font-semibold flex items-center gap-1'>
                    <MdWarning size={12}/> {invoice.daysOverdue} days overdue
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className='space-y-3'>
            <div className='bg-white border border-gray-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Linked Views</p>
              <p className='text-gray-600 mb-2'>
                Work this invoice from customer credit or full AR dashboards.
              </p>
              <div className='flex gap-2'>
                <button
                  onClick={() => navigate('/dashboard/manager/customer-credit-management')}
                  className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-xs font-semibold'
                >
                  Open Customer Credit
                </button>
                <button
                  onClick={() => navigate('/dashboard/manager/daily-report')}
                  className='flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded text-xs font-semibold'
                >
                  View AR Summary
                </button>
              </div>
            </div>

            <div className='bg-white border border-gray-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Timeline (Concept)</p>
              <ul className='space-y-1 text-gray-600 list-disc list-inside'>
                <li>Sale recorded and inventory reduced.</li>
                <li>VAT & WHT calculated and posted.</li>
                <li>Payments and refunds adjust customer statement.</li>
              </ul>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  const filteredInvoices = getFilteredInvoices();

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className='font-bold text-3xl'>Invoices</h2>
        <div className='flex items-center gap-2'>
          <button className='flex cursor-pointer bg-blue-500 hover:bg-gray-50 text-gray-50 hover:text-blue-500 text-sm space-x-3 px-3 py-1 border uppercase'>
            + New Invoice
          </button>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder='Search here ...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px] text-xs'
            />
            <BiSearch className='text-gray-500 relative left-[-5px]' />
          </div>  
        </div>
      </div>

      {/* Summary for AR */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-3'>
          <p className='text-2xs text-gray-600 uppercase mb-1'>Total Accounts Receivable</p>
          <p className='text-xl font-bold text-blue-600'>{formatCurrency(totalAR)}</p>
        </div>
        <div className='bg-white border border-red-300 rounded shadow p-3 bg-red-50'>
          <p className='text-2xs text-gray-600 uppercase mb-1'>Overdue Receivables</p>
          <p className='text-xl font-bold text-red-700'>{formatCurrency(overdueAR)}</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-3'>
          <p className='text-2xs text-gray-600 uppercase mb-1'>Credit Invoices (Open)</p>
          <p className='text-xl font-bold text-purple-700'>{formatCurrency(creditAR)}</p>
        </div>
      </div>

      {/* Tabs & Actions */}
      <div className="flex justify-between items-center">
        <div className='flex space-x-2'>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('credit')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'credit' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Credit ({invoices.filter(inv => inv.isCredit).length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'overdue' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Overdue ({invoices.filter(inv => inv.daysOverdue > 0 && inv.balance > 0).length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'drafts' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Drafts ({invoices.filter(inv => inv.status === 'DRAFT').length})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Paid ({invoices.filter(inv => inv.paymentStatus === 'PAID').length})
          </button>
        </div>
        <div className='flex space-x-2'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`border text-green-500 hover:bg-green-500 hover:text-gray-50 text-xs flex items-center space-x-1 px-2 py-1 ${
              showFilters ? 'bg-green-500 text-white' : ''
            }`}
          >
            <FiFilter /> Show Filters
          </button>
          <button className="border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3">
            <BiRefresh /> Refresh
          </button>
          <button className="border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3">
            <BiCopy /> Copy
          </button>
          <button className="border text-gray-50 bg-gray-500 hover:bg-gray-50 hover:text-gray-500 text-xs flex items-center space-x-1 py-1 px-3">
            <FaPrint /> Print
          </button>
        </div>
      </div>

      <hr className='text-gray-400' />

      {/* Table */}
      <div className="bg-white overflow-x-auto">
        <table className='w-full table-auto text-gray-500 text-xs'>
          <thead className='border-b-4 border-gray-300'>
            <tr>
              <th className='text-center py-1 px-2'><input type='checkbox' /></th>
              <th className='text-center py-1 px-2'>Code</th>
              <th className='text-left py-1 px-2'>Customer</th>
              <th className='text-center py-1 px-2'>Due Date</th>
              <th className='text-right py-1 px-2'>Taxes</th>
              <th className='text-right py-1 px-2'>G. Total</th>
              <th className='text-right py-1 px-2'>Paid</th>
              <th className='text-right py-1 px-2'>WHT</th>
              <th className='text-right py-1 px-2'>Balance</th>
              <th className='text-center py-1 px-2'>Currency</th>
              <th className='text-center py-1 px-2'>Status</th>
              <th className='text-center py-1 px-2'>Created By</th>
              <th className='text-center py-1 px-2'>P.Status</th>
              <th className='text-center py-1 px-2'>Date</th>
              <th className='text-center py-1 px-2'>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan='15' className='text-center py-12'>
                  <p className='text-gray-600 font-semibold'>No invoices found</p>
                </td>
              </tr>
            ) : (
              filteredInvoices.map(inv => (
                <React.Fragment key={inv.id}>
                  <tr className='border-b border-gray-300 hover:bg-gray-50'>
                    <td className='text-center py-1 px-2'><input type='checkbox' /></td>
                    <td className='text-center py-1 px-2 font-semibold'>{inv.code}</td>
                    <td className='py-1 px-2'>
                      <div>
                        <p className='font-bold'>{inv.customerName}</p>
                        <p className='text-gray-600 text-[11px]'>{inv.customerCode}</p>
                      </div>
                    </td>
                    <td className='text-center py-1 px-2'>{inv.dueDate}</td>
                    <td className='text-right py-1 px-2'>{formatCurrency(inv.taxAmount)}</td>
                    <td className='text-right py-1 px-2'>{formatCurrency(inv.grossTotal)}</td>
                    <td className='text-right py-1 px-2 text-green-700 font-semibold'>{formatCurrency(inv.paid)}</td>
                    <td className='text-right py-1 px-2'>{formatCurrency(inv.wht)}</td>
                    <td className='text-right py-1 px-2 font-bold text-red-600'>{formatCurrency(inv.balance)}</td>
                    <td className='text-center py-1 px-2'>{inv.currency}</td>
                    <td className='text-center py-1 px-2'>
                      {getStatusBadge(inv)}
                    </td>
                    <td className='text-center py-1 px-2'>{inv.createdBy}</td>
                    <td className='text-center py-1 px-2'>
                      <div className={`border text-2xs p-1 font-semibold ${
                        inv.paymentStatus === 'PAID'
                          ? 'bg-green-200 text-green-700'
                          : inv.paymentStatus === 'PARTIALLY_PAID'
                            ? 'bg-blue-200 text-blue-700'
                            : 'bg-orange-200 text-orange-700'
                      }`}>
                        {inv.paymentStatus.replace('_', ' ')}
                      </div>
                    </td>
                    <td className='text-center py-1 px-2'>{inv.createdAt}</td>
                    <td className='text-center py-1 px-2'>
                      <div className="inline-flex border border-gray-200">
                        <button className='p-1 cursor-pointer' title='Preview / Print'>
                          <BiScan />
                        </button>
                        <button className='p-1 cursor-pointer' title='Edit Invoice'>
                          <BiEdit />
                        </button>
                        <button className='p-1 cursor-pointer text-red-500' title='Delete Invoice'>
                          <BiTrash />
                        </button>
                        <button
                          onClick={() => toggleRow(inv.id)}
                          className={`p-1 px-3 cursor-pointer ${expandedRows.includes(inv.id) ? 'bg-blue-100' : 'bg-gray-100'}`}
                          title='View AR / Credit Details'
                        >
                          <LuSquareArrowDownRight className={`transform transition-transform ${expandedRows.includes(inv.id) ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.includes(inv.id) && <ExpandedRow invoice={inv} />}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
