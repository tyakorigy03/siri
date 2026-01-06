import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiSearch, BiRefresh, BiCopy } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { FaPrint } from 'react-icons/fa6';
import { LuSquareArrowDownRight } from 'react-icons/lu';
import { MdCheckCircle, MdClose, MdAttachFile, MdAdd } from 'react-icons/md';
import { getExpenses, approveExpense, rejectExpense } from '../../services/expenses';
import { showSuccess, showError } from '../../utils/toast';

export default function ExpenseApproval() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    payee: '',
    priority: '',
    hasReceipt: ''
  });

  // Fetch expenses from API - load all at once to avoid unnecessary requests
  useEffect(() => {
    fetchExpenses();
  }, []); // Only fetch once on mount

  // Refetch when filters change (but not when tab changes - we filter client-side)
  useEffect(() => {
    if (filters.startDate || filters.endDate || filters.category) {
      fetchExpenses();
    }
  }, [filters.startDate, filters.endDate, filters.category]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      // Load all expenses without status filter - we'll filter on frontend
      const queryParams = {
        page: 1,
        limit: 1000, // Get all expenses
        ...(filters.startDate && { date_from: filters.startDate }),
        ...(filters.endDate && { date_to: filters.endDate }),
        ...(filters.category && { category_id: filters.category })
      };

      const response = await getExpenses(queryParams);
      // Handle different response structures
      let expensesData = [];
      if (Array.isArray(response)) {
        expensesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        expensesData = response.data;
      } else if (response.items && Array.isArray(response.items)) {
        expensesData = response.items;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        expensesData = response.data.data;
      }
      
      // Transform backend data to frontend format
      const transformedExpenses = expensesData.map(exp => ({
        id: exp.id,
        code: exp.id,
        category: exp.category_name || exp.category_name || 'Uncategorized',
        payee: exp.payee,
        amount: parseFloat(exp.amount) || 0,
        vat: parseFloat(exp.vat_amount) || 0,
        totalAmount: (parseFloat(exp.amount) || 0) + (parseFloat(exp.vat_amount) || 0),
        paymentMethod: exp.payment_method?.replace('_', ' ') || exp.payment_method || 'Unknown',
        requestedBy: exp.requested_by_name || 'Unknown',
        requestDate: new Date(exp.expense_date || exp.created_at).toLocaleDateString('en-GB'),
        dueDate: new Date(exp.expense_date || exp.created_at).toLocaleDateString('en-GB'),
        status: exp.display_status?.toLowerCase() || 
                (exp.status === 'PAID' ? 'paid' : 
                 exp.status === 'APPROVED' ? 'approved' : 
                 exp.status === 'DRAFT' ? 'pending' : 
                 exp.status?.toLowerCase() || 'pending'),
        hasReceipt: false, // Receipt URL field needs to be added to database schema
        receiptUrl: null,
        description: exp.description || '',
        priority: 'medium', // Default priority, can be added to backend later
        approvedBy: exp.approved_by_name,
        approvedDate: exp.approved_by ? new Date(exp.created_at).toLocaleDateString('en-GB') : null,
        rejectedBy: exp.display_status === 'REJECTED' ? exp.approved_by_name : null,
        rejectedDate: exp.display_status === 'REJECTED' ? new Date(exp.created_at).toLocaleDateString('en-GB') : null,
        rejectionReason: exp.description?.includes('[REJECTED]') 
          ? exp.description.split('[REJECTED] Reason:')[1]?.trim() || 'No reason provided'
          : null
      }));

      setExpenses(transformedExpenses);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(transformedExpenses.map(e => e.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showError(error.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses based on active tab
  const getFilteredExpenses = () => {
    let filtered = expenses;
    
    if (activeTab === 'pending') {
      filtered = expenses.filter(e => e.status === 'pending');
    } else if (activeTab === 'approved') {
      filtered = expenses.filter(e => e.status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = expenses.filter(e => e.status === 'rejected');
    } else if (activeTab === 'paid') {
      filtered = expenses.filter(e => e.status === 'paid');
    }
    // 'all' tab shows all expenses
    
    return filtered;
  };

  const getCurrentExpenses = () => {
    let filtered = getFilteredExpenses();
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters.payee) {
      filtered = filtered.filter(e => e.payee.toLowerCase().includes(filters.payee.toLowerCase()));
    }
    if (filters.priority) {
      filtered = filtered.filter(e => e.priority === filters.priority);
    }
    if (filters.hasReceipt !== '') {
      const hasReceipt = filters.hasReceipt === 'yes';
      filtered = filtered.filter(e => e.hasReceipt === hasReceipt);
    }
    if (filters.minAmount) {
      filtered = filtered.filter(e => e.totalAmount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(e => e.totalAmount <= parseFloat(filters.maxAmount));
    }
    
    return filtered;
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      payee: '',
      priority: '',
      hasReceipt: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const priorities = ['high', 'medium', 'low'];

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-200 border text-red-600',
      medium: 'bg-yellow-200 border text-yellow-600',
      low: 'bg-blue-200 border text-blue-600'
    };
    return colors[priority] || colors.medium;
  };

  const handleApprove = (expense) => {
    setShowApprovalModal({ expense, action: 'approve' });
    setApprovalNotes('');
  };

  const handleReject = (expense) => {
    setShowApprovalModal({ expense, action: 'reject' });
    setApprovalNotes('');
  };

  const confirmAction = async () => {
    if (showApprovalModal.action === 'reject' && !approvalNotes.trim()) {
      showError('Rejection reason is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { expense } = showApprovalModal;
      
      if (showApprovalModal.action === 'approve') {
        await approveExpense(expense.id, { notes: approvalNotes });
        showSuccess('Expense approved successfully');
      } else if (showApprovalModal.action === 'reject') {
        await rejectExpense(expense.id, approvalNotes);
        showSuccess('Expense rejected successfully');
      }
      
      setShowApprovalModal(null);
      setApprovalNotes('');
      await fetchExpenses(); // Refresh the list
    } catch (error) {
      console.error('Error processing expense:', error);
      showError(error.message || `Failed to ${showApprovalModal.action} expense`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ExpandedRowDetails = ({ expense }) => (
    <tr className='bg-gray-50'>
      <td colSpan='11' className='p-4'>
        <div className='grid grid-cols-2 gap-4 text-xs'>
          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Expense Details</p>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Description:</span>
                <span className='font-semibold text-right'>{expense.description}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Category:</span>
                <span className='font-semibold'>{expense.category}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Payment Method:</span>
                <span className='font-semibold'>{expense.paymentMethod}</span>
              </div>
              {expense.receiptUrl && (
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Receipt:</span>
                  <a href={expense.receiptUrl} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>
                    View Receipt
                  </a>
                </div>
              )}
              <div className='flex justify-between'>
                <span className='text-gray-600'>Receipt:</span>
                <span className='font-semibold flex items-center gap-1'>
                  {expense.hasReceipt ? (
                    <><MdAttachFile size={14} className='text-green-600' /> Available</>
                  ) : (
                    <span className='text-red-600'>Not Attached</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Amount Breakdown</p>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Amount:</span>
                <span className='font-semibold'>{formatCurrency(expense.amount)}</span>
              </div>
              {expense.vat > 0 && (
                <div className='flex justify-between'>
                  <span className='text-gray-600'>VAT:</span>
                  <span className='font-semibold'>{formatCurrency(expense.vat)}</span>
                </div>
              )}
              <div className='flex justify-between border-t border-gray-300 pt-2 mt-2'>
                <span className='font-bold'>Total:</span>
                <span className='font-bold text-lg'>{formatCurrency(expense.totalAmount)}</span>
              </div>
            </div>
          </div>

          {expense.status === 'approved' && (
            <div className='bg-green-50 border border-green-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-green-700 mb-2'>Approval Info</p>
              <div className='space-y-1 text-xs'>
                <p><span className='text-gray-600'>Approved By:</span> <span className='font-semibold'>{expense.approvedBy}</span></p>
                <p><span className='text-gray-600'>Date:</span> <span className='font-semibold'>{expense.approvedDate}</span></p>
              </div>
            </div>
          )}

          {expense.status === 'rejected' && (
            <div className='bg-red-50 border border-red-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-red-700 mb-2'>Rejection Info</p>
              <div className='space-y-1 text-xs'>
                <p><span className='text-gray-600'>Rejected By:</span> <span className='font-semibold'>{expense.rejectedBy}</span></p>
                <p><span className='text-gray-600'>Date:</span> <span className='font-semibold'>{expense.rejectedDate}</span></p>
                <p><span className='text-gray-600'>Reason:</span> <span className='font-semibold'>{expense.rejectionReason}</span></p>
              </div>
            </div>
          )}
        </div>

        {expense.status === 'pending' && (
          <div className='flex gap-2 mt-3'>
            {expense.receiptUrl && (
              <a 
                href={expense.receiptUrl} 
                target='_blank' 
                rel='noopener noreferrer'
                className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold'
              >
                View Receipt
              </a>
            )}
            <button onClick={() => handleApprove(expense)} className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold'>
              Approve
            </button>
            <button onClick={() => handleReject(expense)} className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold'>
              Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );

  const ApprovalModal = () => {
    if (!showApprovalModal) return null;
    const { expense, action } = showApprovalModal;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowApprovalModal(null)}>
        <div className='bg-white rounded shadow-xl max-w-2xl w-full mx-4' onClick={(e) => e.stopPropagation()}>
          <div className={`p-4 ${action === 'approve' ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'} flex justify-between items-center`}>
            <div className='flex items-center gap-2'>
              {action === 'approve' ? <MdCheckCircle className='text-green-600' size={24} /> : <MdClose className='text-red-600' size={24} />}
              <h3 className='font-bold text-lg'>{action === 'approve' ? 'Approve' : 'Reject'} Expense</h3>
            </div>
            <button onClick={() => setShowApprovalModal(null)} className='text-gray-600 hover:text-gray-800'>
              <MdClose size={24} />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div className='bg-gray-100 p-4 rounded'>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div><span className='text-gray-600'>Code:</span> <span className='font-bold'>{expense.code}</span></div>
                <div><span className='text-gray-600'>Category:</span> <span className='font-semibold'>{expense.category}</span></div>
                <div><span className='text-gray-600'>Payee:</span> <span className='font-semibold'>{expense.payee}</span></div>
                <div><span className='text-gray-600'>Amount:</span> <span className='font-bold'>{formatCurrency(expense.totalAmount)}</span></div>
              </div>
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                {action === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={action === 'approve' ? 'Optional notes...' : 'Please provide rejection reason...'}
                rows='4'
                className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
              />
            </div>

            {action === 'reject' && !approvalNotes && (
              <p className='text-xs text-red-600'>* Rejection reason is required</p>
            )}
          </div>

          <div className='p-4 bg-gray-50 border-t flex gap-3'>
            <button onClick={() => setShowApprovalModal(null)} disabled={isSubmitting} className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-semibold disabled:opacity-50'>
              Cancel
            </button>
            <button 
              onClick={confirmAction} 
              disabled={isSubmitting || (action === 'reject' && !approvalNotes)}
              className={`flex-1 ${action === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white py-2 rounded text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Processing...</>
              ) : (
                <>{action === 'approve' ? <><MdCheckCircle size={18} />Confirm Approval</> : <><MdClose size={18} />Confirm Rejection</>}</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const displayExpenses = getCurrentExpenses();

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-3xl'>Expense Approval</h2>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => navigate('/dashboard/manager/create-expense')}
            className='px-3 py-1 rounded text-xs font-semibold uppercase bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1'
          >
            <MdAdd size={16} /> Create Expense
          </button>
          <button onClick={() => setActiveTab('pending')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Pending ({expenses.filter(e => e.status === 'pending').length})
          </button>
          <button onClick={() => setActiveTab('approved')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Approved ({expenses.filter(e => e.status === 'approved').length})
          </button>
          <button onClick={() => setActiveTab('rejected')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Rejected ({expenses.filter(e => e.status === 'rejected').length})
          </button>
          <button onClick={() => setActiveTab('paid')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'paid' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Paid ({expenses.filter(e => e.status === 'paid').length})
          </button>
          <button onClick={() => setActiveTab('all')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'all' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            All ({expenses.length})
          </button>
          <div className='relative flex items-center'>
            <input type='text' placeholder='Search here ...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px] text-xs' />
            <BiSearch className='text-gray-500 relative left-[-5px]'/>
          </div>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <div className='flex space-x-2'>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`border text-xs flex items-center space-x-1 px-2 py-1 ${showFilters ? 'bg-green-500 text-white' : 'text-green-500 hover:bg-green-500 hover:text-gray-50'}`}
          >
            <FiFilter/> {showFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && !showFilters && (
              <span className='bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs ml-1'>
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </button>
          <button 
            onClick={fetchExpenses}
            disabled={loading}
            className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3 disabled:opacity-50'
          >
            <BiRefresh/> {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <div className='flex space-x-2'>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
            <BiCopy/> Copy
          </button>
          <button className='border text-gray-50 bg-gray-500 hover:bg-gray-50 hover:text-gray-500 text-xs flex items-center space-x-1 py-1 px-3'>
            <FaPrint/> Print
          </button>
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

          <div className='grid grid-cols-4 gap-4'>
            {/* Category Filter */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              >
                <option value=''>All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Payee Filter */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Payee</label>
              <input
                type='text'
                value={filters.payee}
                onChange={(e) => handleFilterChange('payee', e.target.value)}
                placeholder='Search payee...'
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              />
            </div>

            {/* Priority Filter */}
            {activeTab === 'pending' && (
              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-1'>Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
                >
                  <option value=''>All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Receipt Filter */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Receipt</label>
              <select
                value={filters.hasReceipt}
                onChange={(e) => handleFilterChange('hasReceipt', e.target.value)}
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              >
                <option value=''>All</option>
                <option value='yes'>Has Receipt</option>
                <option value='no'>No Receipt</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Start Date</label>
              <input
                type='date'
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              />
            </div>

            {/* End Date */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>End Date</label>
              <input
                type='date'
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Min Amount</label>
              <input
                type='number'
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                placeholder='0'
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Max Amount</label>
              <input
                type='number'
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                placeholder='999999999'
                className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <p className='text-xs font-semibold text-gray-700 mb-2'>Active Filters:</p>
              <div className='flex flex-wrap gap-2'>
                {filters.category && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    Category: {filters.category}
                    <button onClick={() => handleFilterChange('category', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
                {filters.payee && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    Payee: {filters.payee}
                    <button onClick={() => handleFilterChange('payee', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
                {filters.priority && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    Priority: {filters.priority}
                    <button onClick={() => handleFilterChange('priority', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
                {filters.hasReceipt && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    Receipt: {filters.hasReceipt === 'yes' ? 'Has Receipt' : 'No Receipt'}
                    <button onClick={() => handleFilterChange('hasReceipt', '')} className='text-blue-900 hover:text-blue-700'>×</button>
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
                {filters.minAmount && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    Min: {formatCurrency(parseFloat(filters.minAmount))}
                    <button onClick={() => handleFilterChange('minAmount', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
                {filters.maxAmount && (
                  <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1'>
                    Max: {formatCurrency(parseFloat(filters.maxAmount))}
                    <button onClick={() => handleFilterChange('maxAmount', '')} className='text-blue-900 hover:text-blue-700'>×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <hr className='text-gray-400' />

      <div className='bg-white overflow-x-auto'>
        <table className='w-full table-auto text-gray-500 text-xs'>
          <thead className='border-b-4 border-gray-300'>
            <tr>
              <th className='text-center py-1 px-2'><input type='checkbox' /></th>
              <th className='text-center py-1 px-2'>Code</th>
              <th className='text-center py-1 px-2'>Category</th>
              <th className='text-center py-1 px-2'>Payee</th>
              <th className='text-center py-1 px-2'>Amount</th>
              <th className='text-center py-1 px-2'>VAT</th>
              <th className='text-center py-1 px-2'>Total</th>
              <th className='text-center py-1 px-2'>Requested By</th>
              <th className='text-center py-1 px-2'>Date</th>
              {activeTab === 'pending' && <th className='text-center py-1 px-2'>Priority</th>}
              <th className='text-center py-1 px-2'>Status</th>
              <th className='text-center py-1 px-2'>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan='12' className='text-center py-12'>
                  <p className='text-gray-600 font-semibold'>Loading expenses...</p>
                </td>
              </tr>
            ) : displayExpenses.length === 0 ? (
              <tr>
                <td colSpan='12' className='text-center py-12'>
                  <p className='text-gray-600 font-semibold'>No expenses found</p>
                </td>
              </tr>
            ) : (
              displayExpenses.map(expense => (
                <React.Fragment key={expense.id}>
                  <tr className='border-b border-gray-300'>
                    <td className='text-center py-1 px-2'><input type='checkbox' /></td>
                    <td className='text-center py-1 px-2 font-semibold'>{expense.code}</td>
                    <td className='text-center py-1 px-2'>{expense.category}</td>
                    <td className='text-center py-1 px-2 font-semibold'>{expense.payee}</td>
                    <td className='text-center py-1 px-2'>{formatCurrency(expense.amount)}</td>
                    <td className='text-center py-1 px-2'>{formatCurrency(expense.vat)}</td>
                    <td className='text-center py-1 px-2 font-bold'>{formatCurrency(expense.totalAmount)}</td>
                    <td className='text-center py-1 px-2'>{expense.requestedBy}</td>
                    <td className='text-center py-1 px-2'>{expense.requestDate}</td>
                    {activeTab === 'pending' && (
                      <td className='text-center py-1 px-2'>
                        <div className={`${getPriorityColor(expense.priority)} font-semibold text-2xs p-1 capitalize`}>
                          {expense.priority}
                        </div>
                      </td>
                    )}
                    <td className='text-center py-1 px-2'>
                      <div className={`${
                        expense.status === 'approved' ? 'bg-green-200 border text-green-600' :
                        expense.status === 'rejected' ? 'bg-red-200 border text-red-600' :
                        'bg-orange-200 border text-orange-600'
                      } font-semibold text-2xs p-1 capitalize`}>
                        {expense.status}
                      </div>
                    </td>
                    <td className='text-center py-1 px-2'>
                      <div className='inline-flex border border-gray-200'>
                        {expense.hasReceipt && (
                          <button 
                            title='View Receipt'
                            className='p-1 cursor-pointer hover:bg-blue-50'
                          >
                            <MdAttachFile size={16} />
                          </button>
                        )}
                        {expense.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(expense)}
                              title='Approve Expense'
                              className='p-1 cursor-pointer text-green-600 hover:bg-green-50'
                            >
                              <MdCheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleReject(expense)}
                              title='Reject Expense'
                              className='p-1 cursor-pointer text-red-500 hover:bg-red-50'
                            >
                              <MdClose size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => toggleRow(expense.id)}
                          title='View Details'
                          className={`p-1 px-3 cursor-pointer ${expandedRows.includes(expense.id) ? 'bg-blue-100' : 'bg-gray-100'}`}
                        >
                          <LuSquareArrowDownRight className={`transform transition-transform ${expandedRows.includes(expense.id) ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.includes(expense.id) && <ExpandedRowDetails expense={expense} />}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ApprovalModal />
    </div>
  );
}