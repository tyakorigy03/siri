import React, { useState } from 'react';
import { BiSearch, BiRefresh } from 'react-icons/bi';
import { FaShieldAlt, FaUser, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { MdCheckCircle, MdClose, MdWarning } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload } from 'react-icons/fa6';
import { LuSquareArrowDownRight } from 'react-icons/lu';

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    actionType: '',
    user: '',
    result: '',
    startDate: '',
    endDate: ''
  });

  // Mock data
  const auditLogs = [
    {
      id: 1,
      timestamp: '2026-01-06 07:30:15',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'Business Day Opened',
      category: 'business_day',
      details: {
        branch: 'Downtown Store',
        opening_float: 500000
      },
      result: 'success',
      ipAddress: '192.168.1.45',
      device: 'Desktop - Chrome'
    },
    {
      id: 2,
      timestamp: '2026-01-06 08:05:32',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'Float Approved',
      category: 'float_approval',
      details: {
        cashier: 'Mike Johnson',
        register: 'POS-01',
        float_amount: 200000,
        source: 'Manager'
      },
      result: 'success',
      ipAddress: '192.168.1.45',
      device: 'Desktop - Chrome'
    },
    {
      id: 3,
      timestamp: '2026-01-06 10:15:20',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'Purchase Order Approved',
      category: 'purchase_approval',
      details: {
        po_code: 'PO-001',
        supplier: 'Tech Distributors Ltd',
        amount: 472000,
        items: 3
      },
      result: 'success',
      ipAddress: '192.168.1.45',
      device: 'Desktop - Chrome'
    },
    {
      id: 4,
      timestamp: '2026-01-06 11:30:45',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'Expense Approved',
      category: 'expense_approval',
      details: {
        expense_code: 'EXP-001',
        category: 'Utilities',
        payee: 'EUCL',
        amount: 177000
      },
      result: 'success',
      ipAddress: '192.168.1.45',
      device: 'Desktop - Chrome'
    },
    {
      id: 5,
      timestamp: '2026-01-06 14:22:10',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'Variance Investigation',
      category: 'variance',
      details: {
        session_id: 1,
        cashier: 'Mike Johnson',
        variance: -5000,
        reason: 'Counting Error',
        status: 'Resolved'
      },
      result: 'success',
      ipAddress: '192.168.1.45',
      device: 'Desktop - Chrome'
    },
    {
      id: 6,
      timestamp: '2026-01-06 15:45:00',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'Float Approval Rejected',
      category: 'float_approval',
      details: {
        cashier: 'Sarah Lee',
        register: 'POS-02',
        float_amount: 80000,
        reason: 'Discrepancy not explained'
      },
      result: 'rejected',
      ipAddress: '192.168.1.45',
      device: 'Desktop - Chrome'
    },
    {
      id: 7,
      timestamp: '2026-01-05 19:00:30',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'Business Day Closed',
      category: 'business_day',
      details: {
        branch: 'Downtown Store',
        total_sales: 13000000,
        closing_float: 4425000,
        variance: -3000
      },
      result: 'success',
      ipAddress: '192.168.1.45',
      device: 'Desktop - Chrome'
    },
    {
      id: 8,
      timestamp: '2026-01-05 16:30:15',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'Stock Adjustment Approved',
      category: 'inventory',
      details: {
        item: 'Laptop Dell XPS',
        adjustment_type: 'Damaged',
        quantity_before: 10,
        quantity_after: 9,
        reason: 'Customer return - screen damage'
      },
      result: 'success',
      ipAddress: '192.168.1.45',
      device: 'Desktop - Chrome'
    },
    {
      id: 9,
      timestamp: '2026-01-05 13:20:00',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'User Permission Changed',
      category: 'system',
      details: {
        target_user: 'John Doe',
        permission: 'Can Approve PO',
        action: 'Granted'
      },
      result: 'success',
      ipAddress: '192.168.1.45',
      device: 'Desktop - Chrome'
    },
    {
      id: 10,
      timestamp: '2026-01-05 09:15:00',
      user: 'System',
      role: 'System',
      action: 'Password Reset',
      category: 'security',
      details: {
        user: 'Emma Davis',
        method: 'Email Link'
      },
      result: 'success',
      ipAddress: '192.168.1.125',
      device: 'Mobile - Safari'
    }
  ];

  const actionCategories = [
    'All Actions',
    'Business Day',
    'Float Approval',
    'Purchase Approval',
    'Expense Approval',
    'Variance',
    'Inventory',
    'System',
    'Security'
  ];

  const users = [...new Set(auditLogs.map(log => log.user))];

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      business_day: 'bg-blue-200 text-blue-700',
      float_approval: 'bg-purple-200 text-purple-700',
      purchase_approval: 'bg-green-200 text-green-700',
      expense_approval: 'bg-orange-200 text-orange-700',
      variance: 'bg-red-200 text-red-700',
      inventory: 'bg-yellow-200 text-yellow-700',
      system: 'bg-gray-200 text-gray-700',
      security: 'bg-pink-200 text-pink-700'
    };
    return colors[category] || colors.system;
  };

  const getResultIcon = (result) => {
    if (result === 'success') return <FaCheckCircle className='text-green-600' size={16} />;
    if (result === 'rejected') return <FaTimesCircle className='text-red-600' size={16} />;
    return <MdWarning className='text-yellow-600' size={16} />;
  };

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      actionType: '',
      user: '',
      result: '',
      startDate: '',
      endDate: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const getFilteredLogs = () => {
    let filtered = auditLogs;

    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.actionType && filters.actionType !== 'All Actions') {
      filtered = filtered.filter(log => 
        log.category === filters.actionType.toLowerCase().replace(' ', '_')
      );
    }

    if (filters.user) {
      filtered = filtered.filter(log => log.user === filters.user);
    }

    if (filters.result) {
      filtered = filtered.filter(log => log.result === filters.result);
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(filters.endDate + ' 23:59:59')
      );
    }

    return filtered;
  };

  const ExpandedRowDetails = ({ log }) => (
    <tr className='bg-gray-50'>
      <td colSpan='7' className='p-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-3'>Action Details</p>
            <div className='space-y-2 text-xs'>
              {Object.entries(log.details).map(([key, value]) => (
                <div key={key} className='flex justify-between'>
                  <span className='text-gray-600 capitalize'>{key.replace('_', ' ')}:</span>
                  <span className='font-semibold'>
                    {typeof value === 'number' && key.includes('amount') 
                      ? `RWF ${formatCurrency(value)}` 
                      : value?.toString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-3'>System Information</p>
            <div className='space-y-2 text-xs'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>User:</span>
                <span className='font-semibold'>{log.user}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Role:</span>
                <span className='font-semibold'>{log.role}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>IP Address:</span>
                <span className='font-semibold'>{log.ipAddress}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Device:</span>
                <span className='font-semibold'>{log.device}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Result:</span>
                <span className={`font-semibold ${log.result === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {log.result.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  const filteredLogs = getFilteredLogs();

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Audit Trail</h2>
          <p className='text-sm text-gray-600 mt-1'>Track all system actions and changes</p>
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
      <div className='grid grid-cols-4 gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaShieldAlt className='text-blue-600' size={20} />
            <p className='text-xs text-gray-600 uppercase'>Total Actions</p>
          </div>
          <p className='text-2xl font-bold'>{auditLogs.length}</p>
          <p className='text-xs text-gray-600 mt-1'>All time</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaUser className='text-purple-600' size={18} />
            <p className='text-xs text-gray-600 uppercase'>Active Users</p>
          </div>
          <p className='text-2xl font-bold'>{users.length}</p>
          <p className='text-xs text-gray-600 mt-1'>Tracked users</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaCheckCircle className='text-green-600' size={18} />
            <p className='text-xs text-gray-600 uppercase'>Successful</p>
          </div>
          <p className='text-2xl font-bold text-green-600'>
            {auditLogs.filter(l => l.result === 'success').length}
          </p>
          <p className='text-xs text-gray-600 mt-1'>Actions</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaTimesCircle className='text-red-600' size={18} />
            <p className='text-xs text-gray-600 uppercase'>Rejected</p>
          </div>
          <p className='text-2xl font-bold text-red-600'>
            {auditLogs.filter(l => l.result === 'rejected').length}
          </p>
          <p className='text-xs text-gray-600 mt-1'>Actions</p>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <div className='flex gap-2'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`border text-xs flex items-center gap-1 px-2 py-1 ${showFilters ? 'bg-green-500 text-white' : 'text-green-500 hover:bg-green-500 hover:text-white'}`}
          >
            <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && !showFilters && (
              <span className='bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs ml-1'>
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <BiRefresh size={14} /> Refresh
          </button>
        </div>

        <div className='relative flex items-center'>
          <input
            type='text'
            placeholder='Search actions...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px] text-xs'
          />
          <BiSearch className='text-gray-500 relative left-[-5px]' />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-bold text-sm uppercase text-gray-700'>Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className='text-xs text-red-600 hover:text-red-800 font-semibold'
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className='grid grid-cols-5 gap-4'>
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Action Type</label>
              <select
                value={filters.actionType}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              >
                {actionCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>User</label>
              <select
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              >
                <option value=''>All Users</option>
                {users.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Result</label>
              <select
                value={filters.result}
                onChange={(e) => handleFilterChange('result', e.target.value)}
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              >
                <option value=''>All Results</option>
                <option value='success'>Success</option>
                <option value='rejected'>Rejected</option>
                <option value='failed'>Failed</option>
              </select>
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Start Date</label>
              <input
                type='date'
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>End Date</label>
              <input
                type='date'
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <p className='text-xs font-semibold text-gray-700 mb-2'>Active Filters:</p>
              <div className='flex flex-wrap gap-2'>
                {filters.actionType && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    Type: {filters.actionType}
                    <button onClick={() => handleFilterChange('actionType', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
                {filters.user && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    User: {filters.user}
                    <button onClick={() => handleFilterChange('user', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
                {filters.result && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    Result: {filters.result}
                    <button onClick={() => handleFilterChange('result', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
                {filters.startDate && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    From: {filters.startDate}
                    <button onClick={() => handleFilterChange('startDate', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
                {filters.endDate && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    To: {filters.endDate}
                    <button onClick={() => handleFilterChange('endDate', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <hr className='text-gray-400' />

      {/* Audit Log Table */}
      <div className='bg-white overflow-x-auto'>
        <table className='w-full table-auto text-gray-500 text-xs'>
          <thead className='border-b-4 border-gray-300'>
            <tr>
              <th className='text-left py-2 px-3'>Timestamp</th>
              <th className='text-left py-2 px-3'>User</th>
              <th className='text-left py-2 px-3'>Action</th>
              <th className='text-center py-2 px-3'>Category</th>
              <th className='text-center py-2 px-3'>Result</th>
              <th className='text-left py-2 px-3'>Device</th>
              <th className='text-center py-2 px-3'>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan='7' className='text-center py-12'>
                  <FaShieldAlt className='text-gray-400 mx-auto mb-2' size={32} />
                  <p className='text-gray-600 font-semibold'>No audit logs found</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <React.Fragment key={log.id}>
                  <tr className='border-b border-gray-300 hover:bg-gray-50'>
                    <td className='py-3 px-3'>
                      <div>
                        <p className='font-semibold'>{log.timestamp.split(' ')[1]}</p>
                        <p className='text-gray-600'>{log.timestamp.split(' ')[0]}</p>
                      </div>
                    </td>
                    <td className='py-3 px-3'>
                      <div>
                        <p className='font-bold'>{log.user}</p>
                        <p className='text-gray-600'>{log.role}</p>
                      </div>
                    </td>
                    <td className='py-3 px-3 font-semibold'>{log.action}</td>
                    <td className='text-center py-3 px-3'>
                      <span className={`${getCategoryColor(log.category)} px-2 py-0.5 rounded text-2xs font-semibold capitalize`}>
                        {log.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className='text-center py-3 px-3'>
                      {getResultIcon(log.result)}
                    </td>
                    <td className='py-3 px-3 text-xs text-gray-600'>{log.device}</td>
                    <td className='text-center py-3 px-3'>
                      <button
                        onClick={() => toggleRow(log.id)}
                        className={`p-1 px-3 cursor-pointer border border-gray-200 rounded ${expandedRows.includes(log.id) ? 'bg-blue-100' : 'bg-gray-100'}`}
                      >
                        <LuSquareArrowDownRight className={`transform transition-transform ${expandedRows.includes(log.id) ? 'rotate-90' : ''}`} />
                      </button>
                    </td>
                  </tr>
                  {expandedRows.includes(log.id) && <ExpandedRowDetails log={log} />}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}