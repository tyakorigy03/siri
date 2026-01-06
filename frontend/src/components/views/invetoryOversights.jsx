import React, { useState } from 'react';
import { BiSearch, BiRefresh } from 'react-icons/bi';
import { FaBoxOpen, FaExclamationTriangle, FaCheckCircle, FaTruck, FaExchangeAlt } from 'react-icons/fa';
import { MdWarning, MdCheckCircle, MdClose } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload } from 'react-icons/fa6';
import { LuSquareArrowDownRight } from 'react-icons/lu';

export default function InventoryOversight() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(null);

  // Mock data
  const overviewStats = {
    totalItems: 342,
    outOfStock: 8,
    lowStock: 15,
    pendingPOs: 6,
    pendingAdjustments: 3,
    totalValue: 245000000
  };

  const criticalAlerts = [
    { type: 'out_of_stock', item: 'USB Type-C Cables', quantity: 0, reorderPoint: 50, severity: 'critical' },
    { type: 'out_of_stock', item: 'HDMI Cables 2m', quantity: 0, reorderPoint: 30, severity: 'critical' },
    { type: 'low_stock', item: 'Wireless Mouse Logitech', quantity: 12, reorderPoint: 30, severity: 'high' },
    { type: 'low_stock', item: 'Keyboard Mechanical', quantity: 8, reorderPoint: 20, severity: 'high' },
    { type: 'low_stock', item: 'External HDD 1TB', quantity: 15, reorderPoint: 25, severity: 'medium' }
  ];

  const lowStockItems = [
    { 
      id: 1, 
      name: 'Wireless Mouse Logitech', 
      sku: 'MOUSE-WL-001',
      category: 'Accessories',
      currentStock: 12, 
      reorderPoint: 30, 
      optimalStock: 50,
      lastOrdered: '15/12/2025',
      supplier: 'Tech Distributors Ltd',
      unitCost: 35000,
      recommendedOrder: 50,
      daysUntilStockout: 8
    },
    { 
      id: 2, 
      name: 'USB Type-C Cables', 
      sku: 'CABLE-USBC-001',
      category: 'Cables',
      currentStock: 0, 
      reorderPoint: 50, 
      optimalStock: 100,
      lastOrdered: '10/11/2025',
      supplier: 'Tech Distributors Ltd',
      unitCost: 2500,
      recommendedOrder: 100,
      daysUntilStockout: 0
    },
    { 
      id: 3, 
      name: 'External HDD 1TB', 
      sku: 'HDD-EXT-1TB',
      category: 'Storage',
      currentStock: 15, 
      reorderPoint: 25, 
      optimalStock: 40,
      lastOrdered: '20/12/2025',
      supplier: 'Electronics Warehouse',
      unitCost: 85000,
      recommendedOrder: 30,
      daysUntilStockout: 12
    }
  ];

  const pendingPOs = [
    {
      id: 1,
      code: 'PO-001',
      supplier: 'Tech Distributors Ltd',
      items: 3,
      totalAmount: 472000,
      requestedBy: 'Sarah Williams',
      requestDate: '05/01/2026',
      status: 'pending_approval',
      priority: 'high'
    },
    {
      id: 2,
      code: 'PO-002',
      supplier: 'Office Solutions Inc',
      items: 2,
      totalAmount: 531000,
      requestedBy: 'Mike Johnson',
      requestDate: '04/01/2026',
      status: 'pending_approval',
      priority: 'medium'
    }
  ];

  const pendingAdjustments = [
    {
      id: 1,
      item: 'Laptop Dell XPS',
      type: 'Damaged',
      quantityBefore: 10,
      quantityAfter: 9,
      reason: 'Customer return - screen damage',
      requestedBy: 'Sarah Williams',
      requestDate: '05/01/2026',
      status: 'pending'
    },
    {
      id: 2,
      item: 'Wireless Keyboard',
      type: 'Found',
      quantityBefore: 15,
      quantityAfter: 17,
      reason: 'Found during stocktake',
      requestedBy: 'John Doe',
      requestDate: '04/01/2026',
      status: 'pending'
    }
  ];

  const recentMovements = [
    { time: '14:30', type: 'Sale', item: 'Laptop Dell XPS', quantity: -1, location: 'Downtown Store', user: 'Mike Johnson' },
    { time: '13:15', type: 'Purchase', item: 'USB Cables', quantity: 100, location: 'Main Warehouse', user: 'Sarah Williams' },
    { time: '11:20', type: 'Transfer', item: 'Wireless Mouse', quantity: -10, location: 'Downtown → Uptown', user: 'Sarah Williams' },
    { time: '10:45', type: 'Adjustment', item: 'HDMI Cables', quantity: -2, location: 'Downtown Store', user: 'Manager' },
    { time: '09:30', type: 'Sale', item: 'External HDD', quantity: -3, location: 'Downtown Store', user: 'Sarah Lee' }
  ];

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-blue-500 text-white'
    };
    return colors[severity] || colors.medium;
  };

  const getMovementIcon = (type) => {
    if (type === 'Sale') return '📤';
    if (type === 'Purchase') return '📥';
    if (type === 'Transfer') return '🔄';
    if (type === 'Adjustment') return '⚙️';
    return '📦';
  };

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(iid => iid !== id) : [...prev, id]
    );
  };

  const handleApproveAdjustment = (adjustment) => {
    setShowApprovalModal(adjustment);
  };

  const confirmApproval = async () => {
    alert(`Adjustment approved for ${showApprovalModal.item}`);
    setShowApprovalModal(null);
  };

  const ApprovalModal = () => {
    if (!showApprovalModal) return null;
    const adj = showApprovalModal;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowApprovalModal(null)}>
        <div className='bg-white rounded shadow-xl max-w-xl w-full mx-4' onClick={(e) => e.stopPropagation()}>
          <div className='p-4 bg-blue-50 border-b border-blue-200 flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <MdCheckCircle className='text-blue-600' size={24} />
              <h3 className='font-bold text-lg'>Approve Stock Adjustment</h3>
            </div>
            <button onClick={() => setShowApprovalModal(null)} className='text-gray-600 hover:text-gray-800'>
              <MdClose size={24} />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div className='bg-gray-100 p-4 rounded'>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <p className='text-gray-600 mb-1'>Item</p>
                  <p className='font-bold'>{adj.item}</p>
                </div>
                <div>
                  <p className='text-gray-600 mb-1'>Type</p>
                  <p className='font-semibold'>{adj.type}</p>
                </div>
                <div>
                  <p className='text-gray-600 mb-1'>Before</p>
                  <p className='font-semibold'>{adj.quantityBefore} units</p>
                </div>
                <div>
                  <p className='text-gray-600 mb-1'>After</p>
                  <p className='font-semibold'>{adj.quantityAfter} units</p>
                </div>
              </div>
              <div className='mt-3 pt-3 border-t border-gray-300'>
                <p className='text-gray-600 text-xs mb-1'>Reason:</p>
                <p className='text-sm'>{adj.reason}</p>
              </div>
              <div className='mt-2 text-xs text-gray-600'>
                <p>Requested by: <span className='font-semibold'>{adj.requestedBy}</span></p>
                <p>Date: <span className='font-semibold'>{adj.requestDate}</span></p>
              </div>
            </div>

            <div className='bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs'>
              <p className='font-semibold text-yellow-800 mb-1'>⚠️ Important</p>
              <p className='text-gray-700'>This will permanently adjust the inventory count. Ensure the reason is valid.</p>
            </div>
          </div>

          <div className='p-4 bg-gray-50 border-t flex gap-3'>
            <button onClick={() => setShowApprovalModal(null)} className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-semibold'>
              Cancel
            </button>
            <button onClick={confirmApproval} className='flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm font-semibold flex items-center justify-center gap-2'>
              <MdCheckCircle size={18} />
              Approve Adjustment
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ExpandedLowStockDetails = ({ item }) => (
    <tr className='bg-gray-50'>
      <td colSpan='10' className='p-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white border border-gray-300 p-3 rounded'>
            <p className='font-bold text-xs uppercase text-gray-700 mb-3'>Stock Details</p>
            <div className='space-y-2 text-xs'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Current Stock:</span>
                <span className='font-bold text-red-600'>{item.currentStock} units</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Reorder Point:</span>
                <span className='font-semibold'>{item.reorderPoint} units</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Optimal Stock:</span>
                <span className='font-semibold'>{item.optimalStock} units</span>
              </div>
              <div className='flex justify-between border-t border-gray-300 pt-2'>
                <span className='text-gray-600'>Shortage:</span>
                <span className='font-bold text-red-600'>{item.reorderPoint - item.currentStock} units</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Last Ordered:</span>
                <span className='font-semibold'>{item.lastOrdered}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Days Until Stockout:</span>
                <span className={`font-bold ${item.daysUntilStockout === 0 ? 'text-red-600' : item.daysUntilStockout <= 7 ? 'text-orange-600' : 'text-yellow-600'}`}>
                  {item.daysUntilStockout === 0 ? 'Out of Stock' : `${item.daysUntilStockout} days`}
                </span>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='bg-white border border-gray-300 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-gray-700 mb-2'>Supplier Info</p>
              <div className='space-y-1 text-xs'>
                <p className='font-semibold'>{item.supplier}</p>
                <p className='text-gray-600'>Unit Cost: <span className='font-semibold'>RWF {formatCurrency(item.unitCost)}</span></p>
              </div>
            </div>

            <div className='bg-blue-50 border border-blue-200 p-3 rounded'>
              <p className='font-bold text-xs uppercase text-blue-800 mb-2'>Recommended Order</p>
              <p className='text-2xl font-bold text-blue-700'>{item.recommendedOrder} units</p>
              <p className='text-xs text-gray-700 mt-1'>
                Total Cost: <span className='font-semibold'>RWF {formatCurrency(item.recommendedOrder * item.unitCost)}</span>
              </p>
            </div>

            <button className='w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded text-xs font-semibold'>
              Create Purchase Order →
            </button>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Inventory Oversight</h2>
          <p className='text-sm text-gray-600 mt-1'>Monitor stock levels and movements</p>
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

      {/* Overview Stats */}
      <div className='grid grid-cols-6 gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaBoxOpen className='text-blue-600' size={20} />
            <p className='text-xs text-gray-600 uppercase'>Total Items</p>
          </div>
          <p className='text-2xl font-bold'>{overviewStats.totalItems}</p>
        </div>

        <div className='bg-red-50 border border-red-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaExclamationTriangle className='text-red-600' size={18} />
            <p className='text-xs text-gray-600 uppercase'>Out of Stock</p>
          </div>
          <p className='text-2xl font-bold text-red-600'>{overviewStats.outOfStock}</p>
        </div>

        <div className='bg-orange-50 border border-orange-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <MdWarning className='text-orange-600' size={20} />
            <p className='text-xs text-gray-600 uppercase'>Low Stock</p>
          </div>
          <p className='text-2xl font-bold text-orange-600'>{overviewStats.lowStock}</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaTruck className='text-purple-600' size={18} />
            <p className='text-xs text-gray-600 uppercase'>Pending POs</p>
          </div>
          <p className='text-2xl font-bold text-purple-600'>{overviewStats.pendingPOs}</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaExchangeAlt className='text-yellow-600' size={16} />
            <p className='text-xs text-gray-600 uppercase'>Pending Adj.</p>
          </div>
          <p className='text-2xl font-bold text-yellow-600'>{overviewStats.pendingAdjustments}</p>
        </div>

        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <p className='text-xs text-gray-600 uppercase'>Total Value</p>
          </div>
          <p className='text-lg font-bold'>RWF {formatCurrency(overviewStats.totalValue)}</p>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className='bg-red-50 border-2 border-red-500 rounded shadow p-4'>
        <div className='flex items-center gap-2 mb-3'>
          <FaExclamationTriangle className='text-red-600' size={20} />
          <h3 className='font-bold text-sm uppercase text-red-800'>Critical Stock Alerts</h3>
        </div>
        <div className='grid grid-cols-5 gap-2'>
          {criticalAlerts.map((alert, idx) => (
            <div key={idx} className={`${alert.type === 'out_of_stock' ? 'bg-red-100 border-red-300' : 'bg-orange-100 border-orange-300'} border p-2 rounded`}>
              <p className='font-bold text-xs mb-1'>{alert.item}</p>
              <p className='text-xs'>
                Stock: <span className={`font-bold ${alert.quantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  {alert.quantity}/{alert.reorderPoint}
                </span>
              </p>
              <span className={`${getSeverityColor(alert.severity)} px-2 py-0.5 rounded text-2xs font-semibold mt-1 inline-block`}>
                {alert.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-2'>
        <button onClick={() => setActiveTab('overview')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Overview
        </button>
        <button onClick={() => setActiveTab('low_stock')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'low_stock' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Low Stock ({lowStockItems.length})
        </button>
        <button onClick={() => setActiveTab('pending_pos')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'pending_pos' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Pending POs ({pendingPOs.length})
        </button>
        <button onClick={() => setActiveTab('adjustments')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'adjustments' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Adjustments ({pendingAdjustments.length})
        </button>
        <button onClick={() => setActiveTab('movements')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'movements' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Recent Movements
        </button>
        <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1 ml-auto'>
          <BiRefresh size={14} /> Refresh
        </button>
      </div>

      <hr className='text-gray-400' />

      {/* Content based on active tab */}
      {activeTab === 'low_stock' && (
        <div className='bg-white overflow-x-auto'>
          <table className='w-full table-auto text-gray-500 text-xs'>
            <thead className='border-b-4 border-gray-300'>
              <tr>
                <th className='text-left py-2 px-3'>Item</th>
                <th className='text-center py-2 px-3'>Current</th>
                <th className='text-center py-2 px-3'>Reorder Point</th>
                <th className='text-center py-2 px-3'>Shortage</th>
                <th className='text-center py-2 px-3'>Days Left</th>
                <th className='text-left py-2 px-3'>Supplier</th>
                <th className='text-right py-2 px-3'>Recommended Order</th>
                <th className='text-center py-2 px-3'>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map(item => (
                <React.Fragment key={item.id}>
                  <tr className='border-b border-gray-300 hover:bg-gray-50'>
                    <td className='py-3 px-3'>
                      <div>
                        <p className='font-bold'>{item.name}</p>
                        <p className='text-gray-600'>{item.sku}</p>
                      </div>
                    </td>
                    <td className='text-center py-3 px-3'>
                      <span className={`font-bold ${item.currentStock === 0 ? 'text-red-600' : item.currentStock < item.reorderPoint ? 'text-orange-600' : 'text-green-600'}`}>
                        {item.currentStock}
                      </span>
                    </td>
                    <td className='text-center py-3 px-3 font-semibold'>{item.reorderPoint}</td>
                    <td className='text-center py-3 px-3'>
                      <span className='font-bold text-red-600'>{item.reorderPoint - item.currentStock}</span>
                    </td>
                    <td className='text-center py-3 px-3'>
                      <span className={`font-semibold ${item.daysUntilStockout === 0 ? 'text-red-600' : item.daysUntilStockout <= 7 ? 'text-orange-600' : 'text-yellow-600'}`}>
                        {item.daysUntilStockout === 0 ? 'Out' : `${item.daysUntilStockout}d`}
                      </span>
                    </td>
                    <td className='py-3 px-3 font-semibold'>{item.supplier}</td>
                    <td className='text-right py-3 px-3'>
                      <div>
                        <p className='font-bold text-blue-600'>{item.recommendedOrder} units</p>
                        <p className='text-gray-600'>RWF {formatCurrency(item.recommendedOrder * item.unitCost)}</p>
                      </div>
                    </td>
                    <td className='text-center py-3 px-3'>
                      <div className='inline-flex border border-gray-200'>
                        <button className='p-1 px-2 cursor-pointer text-green-600 hover:bg-green-50 text-xs font-semibold'>
                          Create PO
                        </button>
                        <button onClick={() => toggleRow(item.id)} className={`p-1 px-3 cursor-pointer ${expandedRows.includes(item.id) ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <LuSquareArrowDownRight className={`transform transition-transform ${expandedRows.includes(item.id) ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.includes(item.id) && <ExpandedLowStockDetails item={item} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'pending_pos' && (
        <div className='bg-white overflow-x-auto'>
          <table className='w-full table-auto text-gray-500 text-xs'>
            <thead className='border-b-4 border-gray-300'>
              <tr>
                <th className='text-left py-2 px-3'>PO Code</th>
                <th className='text-left py-2 px-3'>Supplier</th>
                <th className='text-center py-2 px-3'>Items</th>
                <th className='text-right py-2 px-3'>Amount</th>
                <th className='text-left py-2 px-3'>Requested By</th>
                <th className='text-center py-2 px-3'>Date</th>
                <th className='text-center py-2 px-3'>Priority</th>
                <th className='text-center py-2 px-3'>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingPOs.map(po => (
                <tr key={po.id} className='border-b border-gray-300 hover:bg-gray-50'>
                  <td className='py-3 px-3 font-bold text-blue-600'>{po.code}</td>
                  <td className='py-3 px-3 font-semibold'>{po.supplier}</td>
                  <td className='text-center py-3 px-3'>{po.items}</td>
                  <td className='text-right py-3 px-3 font-bold'>RWF {formatCurrency(po.totalAmount)}</td>
                  <td className='py-3 px-3'>{po.requestedBy}</td>
                  <td className='text-center py-3 px-3'>{po.requestDate}</td>
                  <td className='text-center py-3 px-3'>
                    <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${adj.type === 'Damaged' ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
                      {adj.type}
                    </span>
                  </td>
                  <td className='text-center py-3 px-3 font-semibold'>{adj.quantityBefore}</td>
                  <td className='text-center py-3 px-3 font-semibold'>{adj.quantityAfter}</td>
                  <td className='text-center py-3 px-3'>
                    <span className={`font-bold ${adj.quantityAfter > adj.quantityBefore ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.quantityAfter > adj.quantityBefore ? '+' : ''}{adj.quantityAfter - adj.quantityBefore}
                    </span>
                  </td>
                  <td className='py-3 px-3'>{adj.reason}</td>
                  <td className='py-3 px-3'>{adj.requestedBy}</td>
                  <td className='text-center py-3 px-3'>
                    <button onClick={() => handleApproveAdjustment(adj)} className='text-green-600 hover:text-green-800 text-xs font-semibold'>
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>Recent Stock Movements</h3>
          </div>
          <div className='p-4'>
            <div className='space-y-2'>
              {recentMovements.map((move, idx) => (
                <div key={idx} className='flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100'>
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>{getMovementIcon(move.type)}</span>
                    <div>
                      <p className='font-semibold text-sm'>{move.item}</p>
                      <p className='text-xs text-gray-600'>{move.location} • {move.user}</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className={`font-bold ${move.quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {move.quantity > 0 ? '+' : ''}{move.quantity}
                    </p>
                    <p className='text-xs text-gray-600'>{move.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className='grid grid-cols-2 gap-6'>
          {/* Quick Stats */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Stock Health Overview</h3>
            </div>
            <div className='p-4 space-y-3'>
              <div className='flex justify-between items-center p-3 bg-green-50 rounded border border-green-200'>
                <div className='flex items-center gap-2'>
                  <FaCheckCircle className='text-green-600' size={20} />
                  <span className='font-semibold text-sm'>Healthy Stock</span>
                </div>
                <span className='text-2xl font-bold text-green-600'>319</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-200'>
                <div className='flex items-center gap-2'>
                  <MdWarning className='text-orange-600' size={20} />
                  <span className='font-semibold text-sm'>Low Stock</span>
                </div>
                <span className='text-2xl font-bold text-orange-600'>{overviewStats.lowStock}</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-red-50 rounded border border-red-200'>
                <div className='flex items-center gap-2'>
                  <FaExclamationTriangle className='text-red-600' size={18} />
                  <span className='font-semibold text-sm'>Out of Stock</span>
                </div>
                <span className='text-2xl font-bold text-red-600'>{overviewStats.outOfStock}</span>
              </div>
            </div>
          </div>

          {/* Top Actions Needed */}
          <div className='bg-white border border-gray-300 rounded shadow'>
            <div className='p-4 bg-gray-100 border-b border-gray-300'>
              <h3 className='font-bold text-sm uppercase'>Actions Needed</h3>
            </div>
            <div className='p-4 space-y-3'>
              <button className='w-full bg-red-50 border border-red-200 p-3 rounded hover:bg-red-100 text-left'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='font-bold text-sm text-red-800'>Order Out of Stock Items</p>
                    <p className='text-xs text-gray-600'>{overviewStats.outOfStock} items need immediate ordering</p>
                  </div>
                  <span className='text-red-600 font-bold'>→</span>
                </div>
              </button>
              <button className='w-full bg-orange-50 border border-orange-200 p-3 rounded hover:bg-orange-100 text-left'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='font-bold text-sm text-orange-800'>Review Low Stock Items</p>
                    <p className='text-xs text-gray-600'>{overviewStats.lowStock} items below reorder point</p>
                  </div>
                  <span className='text-orange-600 font-bold'>→</span>
                </div>
              </button>
              <button className='w-full bg-purple-50 border border-purple-200 p-3 rounded hover:bg-purple-100 text-left'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='font-bold text-sm text-purple-800'>Approve Purchase Orders</p>
                    <p className='text-xs text-gray-600'>{overviewStats.pendingPOs} POs awaiting approval</p>
                  </div>
                  <span className='text-purple-600 font-bold'>→</span>
                </div>
              </button>
              <button className='w-full bg-yellow-50 border border-yellow-200 p-3 rounded hover:bg-yellow-100 text-left'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='font-bold text-sm text-yellow-800'>Review Stock Adjustments</p>
                    <p className='text-xs text-gray-600'>{overviewStats.pendingAdjustments} adjustments pending</p>
                  </div>
                  <span className='text-yellow-600 font-bold'>→</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <ApprovalModal />
    </div>
  );
}