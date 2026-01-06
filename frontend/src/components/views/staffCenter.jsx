import React, { useState } from 'react';
import StaffPerformance from './staffPerformance';
import { BiRefresh } from 'react-icons/bi';
import { FaPrint, FaDownload } from 'react-icons/fa6';

export default function StaffCenter() {
  const [activeTab, setActiveTab] = useState('performance'); // performance | payroll

  const payrollSummary = {
    period: 'January 2026',
    totalBasicSalary: 1500000,
    totalCommissions: 4700000,
    totalPayrollCost: 6200000,
  };

  const commissionLines = [
    { staff: 'Mike Johnson', role: 'Senior Cashier', commission: 1150000 },
    { staff: 'Sarah Lee', role: 'Cashier', commission: 1280000 },
    { staff: 'John Doe', role: 'Cashier', commission: 1060000 },
    { staff: 'Emma Davis', role: 'Receptionist', commission: 980000 },
  ];

  const formatCurrency = (amount) => `${amount.toLocaleString()}`;

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Staff & Payroll</h2>
          <p className='text-sm text-gray-600 mt-1'>
            Performance, commissions and payroll inputs.
          </p>
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

      {/* Tabs */}
      <div className='flex justify-between items-center'>
        <div className='flex space-x-2'>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'performance'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
              activeTab === 'payroll'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Commissions & Payroll
          </button>
        </div>
        <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
          <BiRefresh size={14} /> Refresh
        </button>
      </div>

      <hr className='text-gray-400' />

      {/* Performance tab reuses StaffPerformance component */}
      {activeTab === 'performance' && (
        <StaffPerformance />
      )}

      {/* Payroll tab */}
      {activeTab === 'payroll' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-3 gap-4'>
            <div className='bg-white border border-gray-300 rounded shadow p-4'>
              <p className='text-xs text-gray-600 mb-1 uppercase'>Total Basic Salary</p>
              <p className='text-2xl font-bold'>RWF {formatCurrency(payrollSummary.totalBasicSalary)}</p>
            </div>
            <div className='bg-white border border-gray-300 rounded shadow p-4'>
              <p className='text-xs text-gray-600 mb-1 uppercase'>Total Commissions</p>
              <p className='text-2xl font-bold text-green-600'>RWF {formatCurrency(payrollSummary.totalCommissions)}</p>
            </div>
            <div className='bg-white border border-gray-300 rounded shadow p-4'>
              <p className='text-xs text-gray-600 mb-1 uppercase'>Total Payroll Cost</p>
              <p className='text-2xl font-bold text-blue-600'>RWF {formatCurrency(payrollSummary.totalPayrollCost)}</p>
            </div>
          </div>

          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Commission Lines (Concept)</h3>
            </div>
            <div className='p-4 overflow-x-auto'>
              <table className='w-full text-xs'>
                <thead className='border-b-2 border-gray-300'>
                  <tr>
                    <th className='text-left py-1 px-2'>Staff</th>
                    <th className='text-left py-1 px-2'>Role</th>
                    <th className='text-right py-1 px-2'>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionLines.map((row, idx) => (
                    <tr key={idx} className='border-b border-gray-200'>
                      <td className='py-2 px-2 font-semibold'>{row.staff}</td>
                      <td className='py-2 px-2'>{row.role}</td>
                      <td className='text-right py-2 px-2 text-green-700 font-semibold'>
                        RWF {formatCurrency(row.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className='bg-blue-50 border border-blue-300 rounded shadow p-4 text-xs'>
            <p className='font-bold text-blue-800 mb-1'>How this will work with the backend</p>
            <p className='text-gray-700'>
              In production, this screen will pull basic salaries from `employees` and commissions from
              `commission_earned` and `commission_rules`, then export a payroll-ready summary for the accountant.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
