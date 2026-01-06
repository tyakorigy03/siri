import React, { useState } from 'react';
import { BiSearch, BiRefresh, BiCopy } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { FaPrint } from 'react-icons/fa6';
import { LuSquareArrowDownRight } from 'react-icons/lu';
import { MdCheckCircle, MdClose, MdEdit } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';

export default function PurchaseOrderApproval() {
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    supplier: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    requestedBy: '',
    priority: ''
  });

  // Mock data
  const pendingPOs = [
    {
      id: 1,
      code: 'PO-001',
      supplier: 'Tech Distributors Ltd',
      items: [
        { name: 'USB Cables', quantity: 100, unitPrice: 2500, total: 250000 },
        { name: 'HDMI Cables', quantity: 50, unitPrice: 3000, total: 150000 }
      ],
      subtotal: 400000,
      vat: 72000,
      totalAmount: 472000,
      requestedBy: 'Sarah Williams',
      requestDate: '05/01/2026',
      requiredDate: '10/01/2026',
      status: 'pending',
      priority: 'high',
      justification: 'Stock below reorder point, needed for upcoming sales',
      deliveryAddress: 'Downtown Store Warehouse'
    },
    {
      id: 2,
      code: 'PO-002',
      supplier: 'Office Solutions Inc',
      items: [
        { name: 'Printer Paper A4', quantity: 200, unitPrice: 1500, total: 300000 },
        { name: 'Toner Cartridges', quantity: 10, unitPrice: 15000, total: 150000 }
      ],
      subtotal: 450000,
      vat: 81000,
      totalAmount: 531000,
      requestedBy: 'Mike Johnson',
      requestDate: '04/01/2026',
      requiredDate: '08/01/2026',
      status: 'pending',
      priority: 'medium',
      justification: 'Monthly office supplies replenishment',
      deliveryAddress: 'Main Office'
    },
    {
      id: 3,
      code: 'PO-003',
      supplier: 'Electronics Warehouse',
      items: [
        { name: 'Laptop Dell XPS 15', quantity: 5, unitPrice: 1200000, total: 6000000 },
        { name: 'Laptop Bags', quantity: 5, unitPrice: 25000, total: 125000 }
      ],
      subtotal: 6125000,
      vat: 1102500,
      totalAmount: 7227500,
      requestedBy: 'David Brown',
      requestDate: '03/01/2026',
      requiredDate: '15/01/2026',
      status: 'pending',
      priority: 'high',
      justification: 'New employee onboarding - urgent requirement',
      deliveryAddress: 'Downtown Store'
    }
  ];

  const approvedPOs = [
    {
      id: 4,
      code: 'PO-004',
      supplier: 'Stationery Plus',
      items: [
        { name: 'Notebooks', quantity: 100, unitPrice: 1000, total: 100000 }
      ],
      subtotal: 100000,
      vat: 18000,
      totalAmount: 118000,
      requestedBy: 'Emma Davis',
      requestDate: '02/01/2026',
      approvedDate: '03/01/2026',
      approvedBy: 'Jane Smith',
      status: 'approved',
      justification: 'Training materials for new staff'
    }
  ];

  const rejectedPOs = [
    {
      id: 5,
      code: 'PO-005',
      supplier: 'Luxury Furniture Co',
      items: [
        { name: 'Executive Desk', quantity: 3, unitPrice: 500000, total: 1500000 }
      ],
      subtotal: 1500000,
      vat: 270000,
      totalAmount: 1770000,
      requestedBy: 'John Doe',
      requestDate: '01/01/2026',
      rejectedDate: '02/01/2026',
      rejectedBy: 'Jane Smith',
      rejectionReason: 'Over budget - not approved in current quarter plan',
      status: 'rejected',
      justification: 'Office upgrade'
    }
  ];

  const allPOs = [...pendingPOs, ...approvedPOs, ...rejectedPOs];

  const getCurrentPOs = () => {
    let pos = activeTab === 'pending' ? pendingPOs :
              activeTab === 'approved' ? approvedPOs :
              activeTab === 'rejected' ? rejectedPOs :
              allPOs;
    
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
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Purchase Order ${showApprovalModal.action}d successfully!`);
      setShowApprovalModal(null);
      setApprovalNotes('');
    } catch (error) {
      alert('Error: ' + error.message);
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
  const suppliers = [...new Set(allPOs.map(po => po.supplier))];
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
                    <td className='py-1 px-2 font-semibold'>{item.name}</td>
                    <td className='text-center py-1 px-2'>{item.quantity}</td>
                    <td className='text-right py-1 px-2'>{formatCurrency(item.unitPrice)}</td>
                    <td className='text-right py-1 px-2 font-semibold'>{formatCurrency(item.total)}</td>
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
                    <li key={idx}>• {item.name} (x{item.quantity}) - {formatCurrency(item.total)}</li>
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
          <button onClick={() => setActiveTab('pending')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Pending ({pendingPOs.length})
          </button>
          <button onClick={() => setActiveTab('approved')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Approved ({approvedPOs.length})
          </button>
          <button onClick={() => setActiveTab('rejected')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Rejected ({rejectedPOs.length})
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
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-gray-50 text-xs flex items-center space-x-1 py-1 px-3'>
            <BiRefresh/> Refresh
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
            {pos.length === 0 ? (
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