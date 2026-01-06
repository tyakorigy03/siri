import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiSearch, BiRefresh, BiCopy } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { FaPrint } from 'react-icons/fa6';
import { LuSquareArrowDownRight } from 'react-icons/lu';
import { MdCheckCircle, MdClose, MdEdit, MdAdd } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import { getPurchaseOrders, approvePurchaseOrder, rejectPurchaseOrder, getPurchaseOrder } from '../../services/purchases';
import { showSuccess, showError } from '../../utils/toast';

export default function PurchaseOrderApproval() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({
    supplier: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    requestedBy: '',
    priority: ''
  });

  // Fetch purchase orders from API
  useEffect(() => {
    fetchPurchaseOrders();
  }, []); // Load all at once

  useEffect(() => {
    if (filters.startDate || filters.endDate || filters.supplier) {
      fetchPurchaseOrders();
    }
  }, [filters.startDate, filters.endDate, filters.supplier]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: 1,
        limit: 1000, // Get all orders
        ...(filters.supplier && { supplier_id: filters.supplier })
      };

      const response = await getPurchaseOrders(queryParams);
      let ordersData = [];
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.items && Array.isArray(response.items)) {
        ordersData = response.items;
      }

      // Fetch full details for each order to get items
      const ordersWithItems = await Promise.all(
        ordersData.map(async (po) => {
          try {
            const fullOrder = await getPurchaseOrder(po.id);
            return {
              id: po.id,
              code: po.order_number || po.id,
              supplier: po.supplier_name || 'Unknown',
              items: fullOrder.data?.items || fullOrder.items || [],
              subtotal: parseFloat(po.total_amount) || 0,
              vat: (parseFloat(po.total_amount) || 0) * 0.18, // 18% VAT
              totalAmount: (parseFloat(po.total_amount) || 0) * 1.18,
              requestedBy: po.created_by_name || 'Unknown',
              requestDate: new Date(po.order_date || po.created_at).toLocaleDateString('en-GB'),
              requiredDate: po.expected_date ? new Date(po.expected_date).toLocaleDateString('en-GB') : null,
              status: po.status?.toLowerCase() === 'draft' || po.status?.toLowerCase() === 'pending' ? 'pending' :
                      po.status?.toLowerCase() === 'approved' ? 'approved' :
                      po.status?.toLowerCase() === 'cancelled' ? 'rejected' :
                      po.status?.toLowerCase() || 'pending',
              priority: 'medium', // Default, can be added to backend
              justification: po.notes || '',
              deliveryAddress: po.warehouse_name || '',
              approvedBy: po.approved_by_name,
              approvedDate: po.approved_by ? new Date(po.updated_at || po.created_at).toLocaleDateString('en-GB') : null,
              rejectedBy: po.status?.toLowerCase() === 'cancelled' ? po.approved_by_name : null,
              rejectedDate: po.status?.toLowerCase() === 'cancelled' ? new Date(po.updated_at || po.created_at).toLocaleDateString('en-GB') : null,
              rejectionReason: po.notes?.includes('[REJECTED]') 
                ? po.notes.split('[REJECTED] Reason:')[1]?.trim() || 'No reason provided'
                : null
            };
          } catch (error) {
            console.error(`Error fetching order ${po.id}:`, error);
            // Return basic order without items if fetch fails
            return {
              id: po.id,
              code: po.order_number || po.id,
              supplier: po.supplier_name || 'Unknown',
              items: [],
              subtotal: parseFloat(po.total_amount) || 0,
              vat: (parseFloat(po.total_amount) || 0) * 0.18,
              totalAmount: (parseFloat(po.total_amount) || 0) * 1.18,
              requestedBy: po.created_by_name || 'Unknown',
              requestDate: new Date(po.order_date || po.created_at).toLocaleDateString('en-GB'),
              requiredDate: po.expected_date ? new Date(po.expected_date).toLocaleDateString('en-GB') : null,
              status: po.status?.toLowerCase() === 'draft' || po.status?.toLowerCase() === 'pending' ? 'pending' :
                      po.status?.toLowerCase() === 'approved' ? 'approved' :
                      po.status?.toLowerCase() === 'cancelled' ? 'rejected' :
                      po.status?.toLowerCase() || 'pending',
              priority: 'medium',
              justification: po.notes || '',
              deliveryAddress: po.warehouse_name || ''
            };
          }
        })
      );

      setPurchaseOrders(ordersWithItems);
      
      // Extract unique suppliers
      const uniqueSuppliers = [...new Set(ordersWithItems.map(po => po.supplier))];
      setSuppliers(uniqueSuppliers);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      showError(error.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  // Filter purchase orders based on active tab
  const getFilteredPOs = () => {
    let filtered = purchaseOrders;
    
    if (activeTab === 'pending') {
      filtered = purchaseOrders.filter(po => po.status === 'pending');
    } else if (activeTab === 'approved') {
      filtered = purchaseOrders.filter(po => po.status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = purchaseOrders.filter(po => po.status === 'rejected');
    }
    
    return filtered;
  };

  const getCurrentPOs = () => {
    let pos = getFilteredPOs();
    
    if (searchQuery) {
      pos = pos.filter(po =>
        po.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.supplier) {
      pos = pos.filter(po => po.supplier.toLowerCase().includes(filters.supplier.toLowerCase()));
    }
    if (filters.requestedBy) {
      pos = pos.filter(po => po.requestedBy.toLowerCase().includes(filters.requestedBy.toLowerCase()));
    }
    if (filters.priority) {
      pos = pos.filter(po => po.priority === filters.priority);
    }
    if (filters.startDate) {
      pos = pos.filter(po => new Date(po.requestDate.split('/').reverse().join('-')) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      pos = pos.filter(po => new Date(po.requestDate.split('/').reverse().join('-')) <= new Date(filters.endDate));
    }
    if (filters.minAmount) {
      pos = pos.filter(po => po.totalAmount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      pos = pos.filter(po => po.totalAmount <= parseFloat(filters.maxAmount));
    }
    
    return pos;
  };

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

  const handleApprove = (po) => {
    setShowApprovalModal({ po, action: 'approve' });
    setApprovalNotes('');
  };

  const handleReject = (po) => {
    setShowApprovalModal({ po, action: 'reject' });
    setApprovalNotes('');
  };

  const confirmAction = async () => {
    if (showApprovalModal.action === 'reject' && !approvalNotes.trim()) {
      showError('Rejection reason is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { po } = showApprovalModal;
      
      if (showApprovalModal.action === 'approve') {
        await approvePurchaseOrder(po.id);
        showSuccess('Purchase order approved successfully');
      } else if (showApprovalModal.action === 'reject') {
        await rejectPurchaseOrder(po.id, approvalNotes);
        showSuccess('Purchase order rejected successfully');
      }
      
      setShowApprovalModal(null);
      setApprovalNotes('');
      await fetchPurchaseOrders(); // Refresh the list
    } catch (error) {
      console.error('Error processing purchase order:', error);
      showError(error.message || `Failed to ${showApprovalModal.action} purchase order`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      supplier: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      requestedBy: '',
      priority: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  const priorities = ['high', 'medium', 'low'];

  const ExpandedRowDetails = ({ po }) => (
    <tr className='bg-gray-50'>
      <td colSpan='10' className='p-4'>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div className='bg-white border border-gray-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Order Details</p>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Supplier:</span>
                  <span className='font-semibold'>{po.supplier}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Required Date:</span>
                  <span className='font-semibold'>{po.requiredDate || 'N/A'}</span>
                </div>
                {po.deliveryAddress && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Delivery:</span>
                    <span className='font-semibold'>{po.deliveryAddress}</span>
                  </div>
                )}
                <div className='border-t border-gray-300 pt-2'>
                  <p className='text-gray-600 mb-1'>Justification:</p>
                  <p className='font-semibold text-gray-800'>{po.justification}</p>
                </div>
              </div>
            </div>

            <div className='bg-white border border-gray-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Amount Summary</p>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Subtotal:</span>
                  <span className='font-semibold'>{formatCurrency(po.subtotal)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>VAT (18%):</span>
                  <span className='font-semibold'>{formatCurrency(po.vat)}</span>
                </div>
                <div className='flex justify-between border-t border-gray-300 pt-2 mt-2'>
                  <span className='font-bold'>Total:</span>
                  <span className='font-bold text-lg'>{formatCurrency(po.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Items ({po.items.length})</p>
            <table className='w-full text-xs'>
              <thead className='border-b border-gray-300'>
                <tr>
                  <th className='text-left py-1 px-2'>Item</th>
                  <th className='text-center py-1 px-2'>Qty</th>
                  <th className='text-right py-1 px-2'>Unit Price</th>
                  <th className='text-right py-1 px-2'>Total</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item, idx) => (
                  <tr key={idx} className='border-b border-gray-200'>
                    <td className='py-1 px-2 font-semibold'>{item.product_name || item.name || 'Unknown Product'}</td>
                    <td className='text-center py-1 px-2'>{item.quantity}</td>
                    <td className='text-right py-1 px-2'>{formatCurrency(item.unit_cost || item.unitPrice || 0)}</td>
                    <td className='text-right py-1 px-2 font-semibold'>{formatCurrency(item.line_total || item.total || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {po.status === 'approved' && (
            <div className='bg-green-50 border border-green-300 p-3 rounded text-xs'>
              <p className='font-bold uppercase text-green-700 mb-2'>Approval Info</p>
              <p><span className='text-gray-600'>Approved By:</span> <span className='font-semibold'>{po.approvedBy}</span></p>
              <p><span className='text-gray-600'>Date:</span> <span className='font-semibold'>{po.approvedDate}</span></p>
            </div>
          )}

          {po.status === 'rejected' && (
            <div className='bg-red-50 border border-red-300 p-3 rounded text-xs'>
              <p className='font-bold uppercase text-red-700 mb-2'>Rejection Info</p>
              <p><span className='text-gray-600'>Rejected By:</span> <span className='font-semibold'>{po.rejectedBy}</span></p>
              <p><span className='text-gray-600'>Date:</span> <span className='font-semibold'>{po.rejectedDate}</span></p>
              <p><span className='text-gray-600'>Reason:</span> <span className='font-semibold'>{po.rejectionReason}</span></p>
            </div>
          )}

          {po.status === 'pending' && (
            <div className='flex gap-2'>
              <button onClick={() => handleApprove(po)} className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-xs font-semibold'>
                Approve Purchase Order
              </button>
              <button onClick={() => handleReject(po)} className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-xs font-semibold'>
                Reject Purchase Order
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  const ApprovalModal = () => {
    if (!showApprovalModal) return null;
    const { po, action } = showApprovalModal;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowApprovalModal(null)}>
        <div className='bg-white rounded shadow-xl max-w-3xl w-full mx-4' onClick={(e) => e.stopPropagation()}>
          <div className={`p-4 ${action === 'approve' ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'} flex justify-between items-center`}>
            <div className='flex items-center gap-2'>
              {action === 'approve' ? <MdCheckCircle className='text-green-600' size={24} /> : <MdClose className='text-red-600' size={24} />}
              <h3 className='font-bold text-lg'>{action === 'approve' ? 'Approve' : 'Reject'} Purchase Order</h3>
            </div>
            <button onClick={() => setShowApprovalModal(null)} className='text-gray-600 hover:text-gray-800'>
              <MdClose size={24} />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div className='bg-gray-100 p-4 rounded'>
              <div className='grid grid-cols-2 gap-3 text-sm mb-3'>
                <div><span className='text-gray-600'>PO Code:</span> <span className='font-bold'>{po.code}</span></div>
                <div><span className='text-gray-600'>Supplier:</span> <span className='font-semibold'>{po.supplier}</span></div>
                <div><span className='text-gray-600'>Requested By:</span> <span className='font-semibold'>{po.requestedBy}</span></div>
                <div><span className='text-gray-600'>Total Amount:</span> <span className='font-bold text-lg'>{formatCurrency(po.totalAmount)}</span></div>
              </div>
              <div className='border-t border-gray-300 pt-2'>
                <p className='text-xs text-gray-600 mb-1'>Items:</p>
                <ul className='text-xs space-y-1'>
                  {po.items.map((item, idx) => (
                    <li key={idx}>• {item.product_name || item.name || 'Unknown'} (x{item.quantity}) - {formatCurrency(item.line_total || item.total || 0)}</li>
                  ))}
                </ul>
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

  const pos = getCurrentPOs();

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-3xl'>Purchase Order Approval</h2>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => navigate('/dashboard/manager/create-purchase-order')}
            className='px-3 py-1 rounded text-xs font-semibold uppercase bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1'
          >
            <MdAdd size={16} /> Create PO
          </button>
          <button onClick={() => setActiveTab('pending')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Pending ({purchaseOrders.filter(po => po.status === 'pending').length})
          </button>
          <button onClick={() => setActiveTab('approved')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Approved ({purchaseOrders.filter(po => po.status === 'approved').length})
          </button>
          <button onClick={() => setActiveTab('rejected')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Rejected ({purchaseOrders.filter(po => po.status === 'rejected').length})
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
            onClick={fetchPurchaseOrders}
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
              <button onClick={clearFilters} className='text-xs text-red-600 hover:text-red-800 font-semibold'>
                Clear All Filters
              </button>
            )}
          </div>

          <div className='grid grid-cols-4 gap-4'>
            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Supplier</label>
              <select value={filters.supplier} onChange={(e) => handleFilterChange('supplier', e.target.value)} className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'>
                <option value=''>All Suppliers</option>
                {suppliers.map(sup => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Requested By</label>
              <input type='text' value={filters.requestedBy} onChange={(e) => handleFilterChange('requestedBy', e.target.value)} placeholder='Search...' className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none' />
            </div>

            {activeTab === 'pending' && (
              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-1'>Priority</label>
                <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none'>
                  <option value=''>All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Start Date</label>
              <input type='date' value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none' />
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>End Date</label>
              <input type='date' value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none' />
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Min Amount</label>
              <input type='number' value={filters.minAmount} onChange={(e) => handleFilterChange('minAmount', e.target.value)} placeholder='0' className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none' />
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 mb-1'>Max Amount</label>
              <input type='number' value={filters.maxAmount} onChange={(e) => handleFilterChange('maxAmount', e.target.value)} placeholder='999999999' className='w-full p-2 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none' />
            </div>
          </div>
        </div>
      )}

      <hr className='text-gray-400' />

      <div className='bg-white overflow-x-auto'>
        <table className='w-full table-auto text-gray-500 text-xs'>
          <thead className='border-b-4 border-gray-300'>
            <tr>
              <th className='text-center py-1 px-2'><input type='checkbox' /></th>
              <th className='text-center py-1 px-2'>PO Code</th>
              <th className='text-center py-1 px-2'>Supplier</th>
              <th className='text-center py-1 px-2'>Items</th>
              <th className='text-center py-1 px-2'>Total Amount</th>
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
                <td colSpan='11' className='text-center py-12'>
                  <p className='text-gray-600 font-semibold'>Loading purchase orders...</p>
                </td>
              </tr>
            ) : pos.length === 0 ? (
              <tr>
                <td colSpan='11' className='text-center py-12'>
                  <p className='text-gray-600 font-semibold'>No purchase orders found</p>
                </td>
              </tr>
            ) : (
              pos.map(po => (
                <React.Fragment key={po.id}>
                  <tr className='border-b border-gray-300'>
                    <td className='text-center py-1 px-2'><input type='checkbox' /></td>
                    <td className='text-center py-1 px-2 font-semibold'>{po.code}</td>
                    <td className='text-center py-1 px-2 font-semibold'>{po.supplier}</td>
                    <td className='text-center py-1 px-2'>{po.items.length} item{po.items.length > 1 ? 's' : ''}</td>
                    <td className='text-center py-1 px-2 font-bold'>{formatCurrency(po.totalAmount)}</td>
                    <td className='text-center py-1 px-2'>{po.requestedBy}</td>
                    <td className='text-center py-1 px-2'>{po.requestDate}</td>
                    {activeTab === 'pending' && (
                      <td className='text-center py-1 px-2'>
                        <div className={`${getPriorityColor(po.priority)} font-semibold text-2xs p-1 capitalize`}>
                          {po.priority}
                        </div>
                      </td>
                    )}
                    <td className='text-center py-1 px-2'>
                      <div className={`${
                        po.status === 'approved' ? 'bg-green-200 border text-green-600' :
                        po.status === 'rejected' ? 'bg-red-200 border text-red-600' :
                        'bg-orange-200 border text-orange-600'
                      } font-semibold text-2xs p-1 capitalize`}>
                        {po.status}
                      </div>
                    </td>
                    <td className='text-center py-1 px-2'>
                      <div className='inline-flex border border-gray-200'>
                        <button 
                          title='View PO Details'
                          className='p-1 cursor-pointer hover:bg-blue-50'
                        >
                          <FaEye size={16} />
                        </button>
                        {po.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(po)}
                              title='Approve PO'
                              className='p-1 cursor-pointer text-green-600 hover:bg-green-50'
                            >
                              <MdCheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleReject(po)}
                              title='Reject PO'
                              className='p-1 cursor-pointer text-red-500 hover:bg-red-50'
                            >
                              <MdClose size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => toggleRow(po.id)}
                          title='View Details'
                          className={`p-1 px-3 cursor-pointer ${expandedRows.includes(po.id) ? 'bg-blue-100' : 'bg-gray-100'}`}
                        >
                          <LuSquareArrowDownRight className={`transform transition-transform ${expandedRows.includes(po.id) ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.includes(po.id) && <ExpandedRowDetails po={po} />}
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