import React, { useState } from 'react';
import { BiRefresh } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload } from 'react-icons/fa6';

export default function TaxCenter() {
  const [period, setPeriod] = useState('this_month');

  const taxSummary = {
    periodLabel: 'January 2026',
    vatOutput: 18236610,
    vatInput: 9152542,
    netVat: 9084068,
    whtPayable: 1525424,
    incomeTaxBase: 42000000,
    incomeTaxRate: 30,
    incomeTaxAmount: 12600000,
  };

  const vatSales = [
    { code: 'INV-001', customer: 'ABC Corporation', date: '02/01/2026', taxable: 1500000, vat: 270000 },
    { code: 'INV-002', customer: 'XYZ Ltd', date: '03/01/2026', taxable: 800000, vat: 144000 },
  ];

  const vatPurchases = [
    { code: 'EXP-001', supplier: 'Kigali Property Management', date: '02/01/2026', taxable: 500000, vat: 90000 },
    { code: 'EXP-002', supplier: 'Office Depot Rwanda', date: '02/01/2026', taxable: 150000, vat: 27000 },
  ];

  const formatCurrency = (amount) => `${amount.toLocaleString()}`;

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Tax Center</h2>
          <p className='text-sm text-gray-600 mt-1'>VAT, WHT and income tax overview for submissions.</p>
        </div>
        <div className='flex gap-2'>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
            <FaDownload size={12} /> Export
          </button>
          <button className='border text-gray-50 bg-gray-500 hover:bg-gray-50 hover:text-gray-500 text-xs flex items-center space-x-1 py-1 px-3'>
            <FaPrint size={12} /> Print
          </button>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <div className='flex space-x-2'>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className='border border-gray-400 rounded px-3 py-1 text-xs font-semibold focus:border-blue-500 focus:outline-none'
          >
            <option value='this_month'>This Month</option>
            <option value='last_month'>Last Month</option>
            <option value='this_quarter'>This Quarter</option>
            <option value='last_quarter'>Last Quarter</option>
            <option value='this_year'>This Year</option>
          </select>
          <button className='border text-green-500 hover:bg-green-500 hover:text-gray-50 text-xs flex items-center space-x-1 px-2'>
            <FiFilter /> Filters
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
            <BiRefresh /> Refresh
          </button>
        </div>
      </div>

      <hr className='text-gray-400' />

      {/* Summary cards */}
      <div className='grid grid-cols-4 gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 mb-1 uppercase'>VAT Output (Sales)</p>
          <p className='text-2xl font-bold text-green-600'>RWF {formatCurrency(taxSummary.vatOutput)}</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 mb-1 uppercase'>VAT Input (Purchases)</p>
          <p className='text-2xl font-bold text-purple-600'>RWF {formatCurrency(taxSummary.vatInput)}</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 mb-1 uppercase'>Net VAT</p>
          <p className='text-2xl font-bold text-blue-600'>RWF {formatCurrency(taxSummary.netVat)}</p>
        </div>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <p className='text-xs text-gray-600 mb-1 uppercase'>WHT Payable</p>
          <p className='text-2xl font-bold text-orange-600'>RWF {formatCurrency(taxSummary.whtPayable)}</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        {/* VAT Sales */}
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>VAT on Sales</h3>
          </div>
          <div className='p-4 overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead className='border-b-2 border-gray-300'>
                <tr>
                  <th className='text-left py-1 px-2'>Invoice</th>
                  <th className='text-left py-1 px-2'>Customer</th>
                  <th className='text-center py-1 px-2'>Date</th>
                  <th className='text-right py-1 px-2'>Taxable</th>
                  <th className='text-right py-1 px-2'>VAT</th>
                </tr>
              </thead>
              <tbody>
                {vatSales.map((row, idx) => (
                  <tr key={idx} className='border-b border-gray-200'>
                    <td className='py-2 px-2 font-semibold'>{row.code}</td>
                    <td className='py-2 px-2'>{row.customer}</td>
                    <td className='text-center py-2 px-2'>{row.date}</td>
                    <td className='text-right py-2 px-2'>{formatCurrency(row.taxable)}</td>
                    <td className='text-right py-2 px-2 text-green-700 font-semibold'>{formatCurrency(row.vat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* VAT Purchases */}
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>VAT on Purchases & Expenses</h3>
          </div>
          <div className='p-4 overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead className='border-b-2 border-gray-300'>
                <tr>
                  <th className='text-left py-1 px-2'>Ref</th>
                  <th className='text-left py-1 px-2'>Supplier</th>
                  <th className='text-center py-1 px-2'>Date</th>
                  <th className='text-right py-1 px-2'>Taxable</th>
                  <th className='text-right py-1 px-2'>VAT</th>
                </tr>
              </thead>
              <tbody>
                {vatPurchases.map((row, idx) => (
                  <tr key={idx} className='border-b border-gray-200'>
                    <td className='py-2 px-2 font-semibold'>{row.code}</td>
                    <td className='py-2 px-2'>{row.supplier}</td>
                    <td className='text-center py-2 px-2'>{row.date}</td>
                    <td className='text-right py-2 px-2'>{formatCurrency(row.taxable)}</td>
                    <td className='text-right py-2 px-2 text-purple-700 font-semibold'>{formatCurrency(row.vat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Income tax snapshot */}
      <div className='bg-white border border-gray-300 rounded shadow'>
        <div className='p-4 bg-gray-100 border-b border-gray-300'>
          <h3 className='font-bold text-sm uppercase'>Income Tax Snapshot (Concept)</h3>
        </div>
        <div className='p-4 grid grid-cols-4 gap-3 text-xs'>
          <div className='bg-gray-50 p-3 rounded'>
            <p className='text-gray-600 mb-1'>Taxable Base</p>
            <p className='font-bold text-lg'>RWF {formatCurrency(taxSummary.incomeTaxBase)}</p>
          </div>
          <div className='bg-gray-50 p-3 rounded'>
            <p className='text-gray-600 mb-1'>Tax Rate</p>
            <p className='font-bold text-lg'>{taxSummary.incomeTaxRate}%</p>
          </div>
          <div className='bg-gray-50 p-3 rounded'>
            <p className='text-gray-600 mb-1'>Tax Amount</p>
            <p className='font-bold text-lg text-red-600'>RWF {formatCurrency(taxSummary.incomeTaxAmount)}</p>
          </div>
          <div className='bg-gray-50 p-3 rounded'>
            <p className='text-gray-600 mb-1'>Period</p>
            <p className='font-bold text-lg'>{taxSummary.periodLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
