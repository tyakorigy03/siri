import React, { useState } from 'react';
import { BiSearch, BiRefresh, BiCopy } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { FaPrint } from 'react-icons/fa6';
import { LuSquareArrowDownRight } from 'react-icons/lu';
import { MdCheckCircle, MdClose, MdWarning } from 'react-icons/md';

export default function AccountsPayable() {
  const [activeTab, setActiveTab] = useState('all'); // all, overdue, critical, purchase
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const summary = {
    totalPayables: 12400000,
    overdueAmount: 3800000,
    suppliersCount: 8,
    criticalSuppliers: 2,
  };

  const suppliers = [
    {
      id: 1,
      name: 'Tech Distributors Ltd',
      code: 'SUP-001',
      totalPayable: 6000000,
      overdue: 2000000,
      daysOverdue: 45,
      lastInvoice: 'PI-001',
      lastInvoiceDate: '10/11/2025',
      lastPayment: '15/12/2025',
      lastPaymentAmount: 1500000,
      invoices: [
        { invoice: 'PI-001', date: '10/11/2025', amount: 3500000, dueDate: '10/12/2025', status: 'overdue', daysOverdue: 35 },
        { invoice: 'PI-045', date: '28/12/2025', amount: 2500000, dueDate: '28/01/2026', status: 'pending', daysOverdue: 0 },
      ],
    },
    {
      id: 2,
      name: 'Office Depot Rwanda',
      code: 'SUP-002',
      totalPayable: 2400000,
      overdue: 1800000,
      daysOverdue: 65,
      lastInvoice: 'PI-012',
      lastInvoiceDate: '02/10/2025',
      lastPayment: '01/11/2025',
      lastPaymentAmount: 600000,
      invoices: [
        { invoice: 'PI-012', date: '02/10/2025', amount: 2400000, dueDate: '02/11/2025', status: 'overdue', daysOverdue: 65 },
      ],
    },
    {
      id: 3,
      name: 'Kigali Property Management',
      code: 'SUP-003',
      totalPayable: 4000000,
      overdue: 0,
      daysOverdue: 0,
      lastInvoice: 'PI-078',
      lastInvoiceDate: '01/01/2026',
      lastPayment: '01/01/2026',
      lastPaymentAmount: 4000000,
      invoices: [
        { invoice: 'PI-078', date: '01/01/2026', amount: 4000000, dueDate: '01/02/2026', status: 'pending', daysOverdue: 0 },
      ],
    },
  ];

  const formatCurrency = (amount) => `${amount.toLocaleString()}`;

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

  const getFilteredSuppliers = () => {
    let filtered = suppliers;

    if (activeTab === 'overdue') {
      filtered = filtered.filter(s => s.overdue > 0);
    } else if (activeTab === 'critical') {
      filtered = filtered.filter(s => s.daysOverdue >= 60);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const ExpandedRow = ({ supplier }) => (
    <tr className='bg-gray-50'>
      <td colSpan='9' className='p-4'>
        <div className='grid grid-cols-2 gap-4 text-xs'>
          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Supplier Invoices</p>
            <div className='space-y-2'>
              {supplier.invoices.map((inv, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border ${
                    inv.status === 'overdue'
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className='flex justify-between mb-1'>
                    <span className='font-bold text-blue-600'>{inv.invoice}</span>
                    <span className='font-bold'>RWF {formatCurrency(inv.amount)}</span>
                  </div>
                  <div className='flex justify-between text-gray-600'>
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
              <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Last Activity</p>
              <div className='space-y-1'>
                <p>
                  Last Invoice:{' '}
                  <span className='font-semibold'>
                    {supplier.lastInvoice} ({supplier.lastInvoiceDate})
                  </span>
                </p>
                <p>
                  Last Payment:{' '}
                  <span className='font-semibold'>
                    RWF {formatCurrency(supplier.lastPaymentAmount)} on {supplier.lastPayment}
                  </span>
                </p>
              </div>
            </div>

            <div className='bg-white border border-gray-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Actions (Concept)</p>
              <p className='text-gray-600 mb-2'>
                From here, manager/accountant can approve payments, schedule them,
                or link to bank transactions.
              </p>
              <div className='flex gap-2'>
                <button className='flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded text-xs font-semibold'>
                  Mark as Paid
                </button>
                <button className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-xs font-semibold'>
                  Open Expense / PO
                </button>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  const filteredSuppliers = getFilteredSuppliers();

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Accounts Payable</h2>
          <p className='text-sm text-gray-600 mt-1'>
            Track supplier balances, overdue bills, and payment priorities.
          </p>
        </div>
        <div className='flex gap-2'>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <BiCopy size={12} /> Copy
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <FaPrint size={12} /> Print
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className='grid grid-cols-4 gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Total Payables</p>
          <p className='text-2xl font-bold text-blue-600'>
            RWF {formatCurrency(summary.totalPayables)}
          </p>
        </div>
        <div className='bg-white border border-red-300 rounded shadow p-4 bg-red-50'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Overdue Amount</p>
          <p className='text-2xl font-bold text-red-700'>
            RWF {formatCurrency(summary.overdueAmount)}
          </p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Suppliers</p>
          <p className='text-2xl font-bold'>{summary.suppliersCount}</p>
        </div>
        <div className='bg-white border border-orange-300 rounded shadow p-4 bg-orange-50'>
          <p className='text-xs text-gray-600 uppercase mb-1'>Critical Suppliers</p>
          <p className='text-2xl font-bold text-orange-700'>{summary.criticalSuppliers}</p>
        </div>
      </div>

      {/* Tabs & search */}
      <div className='flex justify-between items-center'>
        <div className='flex gap-2'>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'overdue'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Overdue ({suppliers.filter(s => s.overdue > 0).length})
          </button>
          <button
            onClick={() => setActiveTab('critical')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'critical'
                ? 'bg-red-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            60+ Days ({suppliers.filter(s => s.daysOverdue >= 60).length})
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <BiRefresh size={14} /> Refresh
          </button>
          <button className='border text-green-500 hover:bg-green-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <FiFilter size={14} /> Filters
          </button>
        </div>
        <div className='relative flex items-center'>
          <input
            type='text'
            placeholder='Search suppliers...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px] text-xs'
          />
          <BiSearch className='text-gray-500 relative left-[-5px]' />
        </div>
      </div>

      <hr className='text-gray-400' />

      {/* Table */}
      <div className='bg-white overflow-x-auto'>
        <table className='w-full table-auto text-gray-500 text-xs'>
          <thead className='border-b-4 border-gray-300'>
            <tr>
              <th className='text-center py-1 px-2'>
                <input type='checkbox' />
              </th>
              <th className='text-left py-1 px-2'>Supplier</th>
              <th className='text-right py-1 px-2'>Total Payable</th>
              <th className='text-right py-1 px-2'>Overdue</th>
              <th className='text-center py-1 px-2'>Aging</th>
              <th className='text-center py-1 px-2'>Last Invoice</th>
              <th className='text-center py-1 px-2'>Last Payment</th>
              <th className='text-center py-1 px-2'>Status</th>
              <th className='text-center py-1 px-2'>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan='9' className='text-center py-12'>
                  <p className='text-gray-600 font-semibold'>No suppliers found</p>
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((s) => (
                <React.Fragment key={s.id}>
                  <tr className='border-b border-gray-300 hover:bg-gray-50'>
                    <td className='text-center py-1 px-2'>
                      <input type='checkbox' />
                    </td>
                    <td className='py-1 px-2'>
                      <div>
                        <p className='font-bold'>{s.name}</p>
                        <p className='text-gray-600 text-[11px]'>{s.code}</p>
                      </div>
                    </td>
                    <td className='text-right py-1 px-2 font-semibold'>
                      {formatCurrency(s.totalPayable)}
                    </td>
                    <td className='text-right py-1 px-2'>
                      {s.overdue > 0 ? (
                        <span className='font-bold text-red-700'>
                          {formatCurrency(s.overdue)}
                        </span>
                      ) : (
                        <span className='text-gray-400'>-</span>
                      )}
                    </td>
                    <td className='text-center py-1 px-2'>
                      <span
                        className={`${getAgingColor(
                          s.daysOverdue
                        )} px-2 py-0.5 rounded text-2xs font-semibold flex items-center justify-center gap-1`}
                      >
                        {s.daysOverdue >= 60 && (
                          <MdWarning size={10} className='text-red-700' />
                        )}
                        {getAgingLabel(s.daysOverdue)}
                      </span>
                    </td>
                    <td className='text-center py-1 px-2'>
                      <div className='text-[11px]'>
                        <div>{s.lastInvoice}</div>
                        <div className='text-gray-600'>{s.lastInvoiceDate}</div>
                      </div>
                    </td>
                    <td className='text-center py-1 px-2'>
                      <div className='text-[11px]'>
                        <div>RWF {formatCurrency(s.lastPaymentAmount)}</div>
                        <div className='text-gray-600'>{s.lastPayment}</div>
                      </div>
                    </td>
                    <td className='text-center py-1 px-2'>
                      {s.overdue > 0 ? (
                        <div className='bg-red-200 border text-red-700 font-semibold text-2xs p-1'>
                          Overdue
                        </div>
                      ) : (
                        <div className='bg-green-200 border text-green-700 font-semibold text-2xs p-1'>
                          Current
                        </div>
                      )}
                    </td>
                    <td className='text-center py-1 px-2'>
                      <div className='inline-flex border border-gray-200'>
                        <button
                          title='Quick payment'
                          className='p-1 cursor-pointer text-green-600 hover:bg-green-50'
                        >
                          <MdCheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => toggleRow(s.id)}
                          className={`p-1 px-3 cursor-pointer ${
                            expandedRows.includes(s.id) ? 'bg-blue-100' : 'bg-gray-100'
                          }`}
                          title='View details'
                        >
                          <LuSquareArrowDownRight
                            className={`transform transition-transform ${
                              expandedRows.includes(s.id) ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.includes(s.id) && <ExpandedRow supplier={s} />}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
