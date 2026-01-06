import React, { useState } from 'react';
import { BiSearch, BiRefresh, BiChevronUp } from 'react-icons/bi';
import { FaMoneyBillWave, FaShoppingCart, FaCreditCard, FaUndo } from 'react-icons/fa';
import { MdPointOfSale, MdReceipt } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload } from 'react-icons/fa6';
import { LuSquareArrowDownRight } from 'react-icons/lu';

export default function SalesManagementView() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [collapsedCards, setCollapsedCards] = useState({});
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showSaleDetailsModal, setShowSaleDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  // Mock data
  const salesSummary = {
    today: {
      totalSales: 12500000,
      transactions: 115,
      avgTransaction: 108696,
      cash: 4200000,
      momo: 5000000,
      card: 2300000,
      credit: 1000000,
      refunds: 150000,
      refundCount: 2
    },
    thisWeek: {
      totalSales: 88000000,
      transactions: 856,
      avgTransaction: 102804
    },
    thisMonth: {
      totalSales: 350000000,
      transactions: 3420,
      avgTransaction: 102339
    }
  };

  const transactions = [
    {
      id: 1,
      saleNumber: 'SAL-2026-0001',
      date: '06/01/2026',
      time: '14:30',
      customer: 'Walk-in Customer',
      items: 3,
      total: 1500000,
      paid: 1500000,
      paymentMethod: 'CASH',
      status: 'PAID',
      servedBy: 'Mike Johnson',
      channel: 'POS',
      itemsList: [
        { name: 'Laptop Dell XPS', qty: 1, price: 1500000 }
      ]
    },
    {
      id: 2,
      saleNumber: 'SAL-2026-0002',
      date: '06/01/2026',
      time: '13:15',
      customer: 'ABC Corporation',
      items: 4,
      total: 3000000,
      paid: 3000000,
      paymentMethod: 'MOMO',
      status: 'PAID',
      servedBy: 'Sarah Lee',
      channel: 'POS',
      itemsList: [
        { name: 'iPhone 15 Pro', qty: 1, price: 1800000 },
        { name: 'Wireless Mouse', qty: 10, price: 350000 },
        { name: 'USB-C Cable', qty: 30, price: 450000 },
        { name: 'Bluetooth Headphones', qty: 20, price: 2400000 }
      ]
    },
    {
      id: 3,
      saleNumber: 'SAL-2026-0003',
      date: '06/01/2026',
      time: '11:20',
      customer: 'XYZ Enterprises',
      items: 3,
      total: 10000000,
      paid: 0,
      paymentMethod: 'CREDIT',
      status: 'CREDIT',
      servedBy: 'Emma Davis',
      channel: 'FRONTDESK',
      creditDueDate: '06/02/2026',
      itemsList: [
        { name: 'Laptop Dell XPS', qty: 5, price: 7500000 },
        { name: 'External HDD 1TB', qty: 10, price: 1800000 },
        { name: 'Wireless Mouse', qty: 20, price: 700000 }
      ]
    },
    {
      id: 4,
      saleNumber: 'SAL-2026-0004',
      date: '06/01/2026',
      time: '10:45',
      customer: 'Walk-in Customer',
      items: 3,
      total: 6000000,
      paid: 6000000,
      paymentMethod: 'CARD',
      status: 'PAID',
      servedBy: 'Lisa Anderson',
      channel: 'POS',
      itemsList: [
        { name: 'Monitor 27 inch 4K', qty: 10, price: 4500000 },
        { name: 'Keyboard Mechanical RGB', qty: 15, price: 1275000 },
        { name: 'Wireless Mouse', qty: 5, price: 175000 }
      ]
    }
  ];

  const refunds = [
    {
      id: 1,
      refundNumber: 'REF-2026-0001',
      originalSale: 'SAL-2025-0987',
      date: '06/01/2026',
      time: '09:30',
      customer: 'John Doe',
      amount: 85000,
      reason: 'Defective product',
      item: 'Wireless Keyboard',
      status: 'COMPLETED',
      approvedBy: 'Manager',
      method: 'CASH'
    },
    {
      id: 2,
      refundNumber: 'REF-2026-0002',
      originalSale: 'SAL-2025-0995',
      date: '06/01/2026',
      time: '11:45',
      customer: 'Jane Smith',
      amount: 65000,
      reason: 'Wrong item purchased',
      item: 'USB Hub',
      status: 'PENDING',
      approvedBy: null,
      method: null
    }
  ];

  const creditSales = [
    {
      id: 1,
      saleNumber: 'SAL-2026-0003',
      customer: 'XYZ Enterprises',
      amount: 10000000,
      balance: 10000000,
      dueDate: '06/02/2026',
      daysOverdue: 0,
      status: 'CURRENT'
    },
    {
      id: 2,
      saleNumber: 'SAL-2025-0850',
      customer: 'ABC Corporation',
      amount: 5000000,
      balance: 2000000,
      dueDate: '15/12/2025',
      daysOverdue: 22,
      status: 'OVERDUE'
    }
  ];

  const topProducts = [
    { name: 'Laptop Dell XPS', qtySold: 15, revenue: 22500000 },
    { name: 'iPhone 15 Pro', qtySold: 12, revenue: 21600000 },
    { name: 'Wireless Mouse', qtySold: 156, revenue: 5460000 },
    { name: 'USB-C Cable', qtySold: 245, revenue: 3675000 },
    { name: 'Bluetooth Headphones', qtySold: 89, revenue: 10680000 }
  ];

  const formatCurrency = (amount) => `${amount.toLocaleString()}`;

  const toggleCard = (cardName) => {
    setCollapsedCards(prev => ({ ...prev, [cardName]: !prev[cardName] }));
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openSaleDetails = (sale) => {
    setSelectedSale(sale);
    setShowSaleDetailsModal(true);
  };

  const openRefundModal = (sale) => {
    setSelectedSale(sale);
    setShowRefundModal(true);
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      CASH: 'bg-green-200 border text-green-700',
      MOMO: 'bg-purple-200 border text-purple-700',
      CARD: 'bg-blue-200 border text-blue-700',
      CREDIT: 'bg-orange-200 border text-orange-700'
    };
    return colors[method] || 'bg-gray-200 border text-gray-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      PAID: 'bg-green-200 border text-green-700',
      CREDIT: 'bg-orange-200 border text-orange-700',
      PARTIAL: 'bg-yellow-200 border text-yellow-700',
      CURRENT: 'bg-blue-200 border text-blue-700',
      OVERDUE: 'bg-red-200 border text-red-700',
      PENDING: 'bg-yellow-200 border text-yellow-700',
      COMPLETED: 'bg-green-200 border text-green-700'
    };
    return colors[status] || 'bg-gray-200 border text-gray-700';
  };

  // Sale Details Modal
  const SaleDetailsModal = () => {
    if (!showSaleDetailsModal || !selectedSale) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSaleDetailsModal(false)}>
        <div className="bg-white rounded shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-lg uppercase">Sale Details - {selectedSale.saleNumber}</h3>
            <button onClick={() => setShowSaleDetailsModal(false)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-200 p-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Date & Time</p>
                <p className="font-bold text-sm">{selectedSale.date} {selectedSale.time}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Customer</p>
                <p className="font-bold text-sm">{selectedSale.customer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Served By</p>
                <p className="font-bold text-sm">{selectedSale.servedBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Channel</p>
                <p className="font-bold text-sm">{selectedSale.channel}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-sm uppercase mb-2">Items Sold</p>
              <table className="w-full text-xs">
                <thead className="border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left py-1 px-2">Item</th>
                    <th className="text-center py-1 px-2">Qty</th>
                    <th className="text-right py-1 px-2">Price</th>
                    <th className="text-right py-1 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.itemsList.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-1 px-2 font-semibold">{item.name}</td>
                      <td className="text-center py-1 px-2">{item.qty}</td>
                      <td className="text-right py-1 px-2">RWF {formatCurrency(item.price / item.qty)}</td>
                      <td className="text-right py-1 px-2 font-bold">RWF {formatCurrency(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-200 border p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold">Subtotal:</span>
                  <span className="font-bold">RWF {formatCurrency(selectedSale.total * 0.847)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">VAT (18%):</span>
                  <span className="font-bold">RWF {formatCurrency(selectedSale.total * 0.153)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-400 pt-2">
                  <span className="font-bold text-lg">TOTAL:</span>
                  <span className="font-bold text-lg">RWF {formatCurrency(selectedSale.total)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-400 pt-2">
                  <span className="font-bold">Paid:</span>
                  <span className="font-bold text-green-600">RWF {formatCurrency(selectedSale.paid)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-200 p-3">
                <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                <span className={`inline-block px-3 py-1 text-xs font-bold ${getPaymentMethodColor(selectedSale.paymentMethod)}`}>
                  {selectedSale.paymentMethod}
                </span>
              </div>
              <div className="bg-gray-200 p-3">
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 text-xs font-bold ${getStatusColor(selectedSale.status)}`}>
                  {selectedSale.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-200 border-t flex gap-3">
            <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 text-sm font-bold uppercase">
              <FaPrint className="inline mr-2" size={12} /> Print Receipt
            </button>
            {selectedSale.status === 'PAID' && (
              <button onClick={() => { setShowSaleDetailsModal(false); openRefundModal(selectedSale); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 text-sm font-bold uppercase">
                <FaUndo className="inline mr-2" size={12} /> Process Refund
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Refund Modal
  const RefundModal = () => {
    const [formData, setFormData] = useState({
      refundType: 'FULL',
      amount: '',
      reason: '',
      notes: ''
    });

    if (!showRefundModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRefundModal(false)}>
        <div className="bg-white rounded shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-lg uppercase">Process Refund</h3>
            <button onClick={() => setShowRefundModal(false)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>

          <div className="p-6 space-y-4">
            {selectedSale && (
              <div className="bg-gray-200 p-3">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 mb-1">Sale Number</p>
                    <p className="font-bold">{selectedSale.saleNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Customer</p>
                    <p className="font-bold">{selectedSale.customer}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Original Amount</p>
                    <p className="font-bold text-lg">RWF {formatCurrency(selectedSale.total)}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Refund Type *</label>
              <select value={formData.refundType} onChange={(e) => setFormData({...formData, refundType: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0">
                <option value="FULL">Full Refund</option>
                <option value="PARTIAL">Partial Refund</option>
              </select>
            </div>

            {formData.refundType === 'PARTIAL' && (
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Refund Amount *</label>
                <input type="number" max={selectedSale?.total} value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Enter amount" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Reason *</label>
              <select value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0">
                <option value="">Select reason</option>
                <option value="DEFECTIVE">Defective Product</option>
                <option value="WRONG_ITEM">Wrong Item</option>
                <option value="CUSTOMER_CHANGE">Customer Changed Mind</option>
                <option value="NOT_AS_DESCRIBED">Not as Described</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Additional Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3" className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Provide details about the refund"></textarea>
            </div>

            <div className="bg-yellow-200 border p-3 text-xs">
              <p className="font-bold mb-1">⚠️ MANAGER APPROVAL REQUIRED</p>
              <p>This refund will be submitted for manager approval before processing.</p>
            </div>

            {(formData.refundType === 'FULL' || formData.amount) && (
              <div className="bg-red-200 border p-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">REFUND AMOUNT:</span>
                  <span className="font-bold text-lg">RWF {formatCurrency(formData.refundType === 'FULL' ? selectedSale?.total : formData.amount)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-200 border-t flex gap-3">
            <button onClick={() => setShowRefundModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 text-sm font-bold uppercase">Cancel</button>
            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 text-sm font-bold uppercase">Submit Refund Request</button>
          </div>
        </div>
      </div>
    );
  };

  const ExpandedTransactionDetails = ({ transaction }) => (
    <tr className="bg-gray-50">
      <td colSpan="10" className="p-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-white border border-gray-300 p-3">
            <p className="font-bold text-xs uppercase text-gray-700 mb-2">Items Sold</p>
            <div className="space-y-1">
              {transaction.itemsList.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-gray-200">
                  <span>{item.name} × {item.qty}</span>
                  <span className="font-semibold">RWF {formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-gray-300 p-3">
              <p className="font-bold text-xs uppercase text-gray-700 mb-2">Payment Details</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold">{transaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold">RWF {formatCurrency(transaction.paid)}</span>
                </div>
                {transaction.status === 'CREDIT' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold text-orange-600">{transaction.creditDueDate}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => openSaleDetails(transaction)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 text-xs font-bold uppercase">View Full Details</button>
              {transaction.status === 'PAID' && (
                <button onClick={() => openRefundModal(transaction)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 text-xs font-bold uppercase">Refund</button>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl">Sales Management</h2>

      {/* Sales Summary */}
      <div className="bg-white border border-gray-300 rounded shadow">
        <div className="p-3 sm:p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base sm:text-lg uppercase">Sales Summary</h3>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="border border-gray-400 px-2 py-1 text-xs font-bold">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <button onClick={() => toggleCard('summary')} className="transition-transform duration-300" style={{ transform: collapsedCards.summary ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <BiChevronUp size={20} className="sm:w-6 sm:h-6"/>
          </button>
        </div>
        <div className="bg-gray-200 h-1 sm:h-2"></div>
        
        <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.summary ? 'max-h-0' : 'max-h-[1000px]'}`}>
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MdPointOfSale className="text-blue-600" size={18} />
                  <p className="text-xs uppercase text-gray-600">Total Sales</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">RWF {formatCurrency(salesSummary.today.totalSales)}</p>
                <p className="text-xs text-gray-600 mt-1">{salesSummary.today.transactions} transactions</p>
              </div>

              <div className="bg-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FaShoppingCart className="text-green-600" size={16} />
                  <p className="text-xs uppercase text-gray-600">Avg Transaction</p>
                </div>
                <p className="text-2xl font-bold text-green-600">RWF {formatCurrency(salesSummary.today.avgTransaction)}</p>
              </div>

              <div className="bg-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FaUndo className="text-red-600" size={14} />
                  <p className="text-xs uppercase text-gray-600">Refunds</p>
                </div>
                <p className="text-2xl font-bold text-red-600">RWF {formatCurrency(salesSummary.today.refunds)}</p>
                <p className="text-xs text-gray-600 mt-1">{salesSummary.today.refundCount} refunds</p>
              </div>

              <div className="bg-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MdReceipt className="text-purple-600" size={18} />
                  <p className="text-xs uppercase text-gray-600">Net Sales</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">RWF {formatCurrency(salesSummary.today.totalSales - salesSummary.today.refunds)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-green-200 border p-3">
                <p className="text-xs uppercase text-gray-600 mb-1">Cash</p>
                <p className="font-bold text-lg">RWF {formatCurrency(salesSummary.today.cash)}</p>
                <p className="text-xs text-gray-600">{((salesSummary.today.cash / salesSummary.today.totalSales) * 100).toFixed(1)}%</p>
              </div>

              <div className="bg-purple-200 border p-3">
                <p className="text-xs uppercase text-gray-600 mb-1">MOMO</p>
                <p className="font-bold text-lg">RWF {formatCurrency(salesSummary.today.momo)}</p>
                <p className="text-xs text-gray-600">{((salesSummary.today.momo / salesSummary.today.totalSales) * 100).toFixed(1)}%</p>
              </div>

              <div className="bg-blue-200 border p-3">
                <p className="text-xs uppercase text-gray-600 mb-1">Card</p>
                <p className="font-bold text-lg">RWF {formatCurrency(salesSummary.today.card)}</p>
                <p className="text-xs text-gray-600">{((salesSummary.today.card / salesSummary.today.totalSales) * 100).toFixed(1)}%</p>
              </div>

              <div className="bg-orange-200 border p-3">
                <p className="text-xs uppercase text-gray-600 mb-1">Credit</p>
                <p className="font-bold text-lg">RWF {formatCurrency(salesSummary.today.credit)}</p>
                <p className="text-xs text-gray-600">{((salesSummary.today.credit / salesSummary.today.totalSales) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveTab('transactions')} className={`px-3 py-1 rounded text-xs font-bold uppercase ${activeTab === 'transactions' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Transactions ({transactions.length})
        </button>
        <button onClick={() => setActiveTab('refunds')} className={`px-3 py-1 rounded text-xs font-bold uppercase ${activeTab === 'refunds' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Refunds ({refunds.length})
        </button>
        <button onClick={() => setActiveTab('credit')} className={`px-3 py-1 rounded text-xs font-bold uppercase ${activeTab === 'credit' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Credit Sales ({creditSales.length})
        </button>
        <button onClick={() => setActiveTab('top_products')} className={`px-3 py-1 rounded text-xs font-bold uppercase ${activeTab === 'top_products' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Top Products
        </button>
      </div>

      <hr className="text-gray-400" />

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white overflow-x-auto">
          <div className="p-3 flex justify-between items-center border-b border-gray-300">
            <h3 className="font-bold text-sm uppercase">Sales Transactions</h3>
            <div className="flex gap-2">
              <div className="relative flex items-center">
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px] text-xs" />
                <BiSearch className="text-gray-500 relative left-[-5px]" />
              </div>
              <button className="border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-2 py-1">
                <BiRefresh size={14} /> Refresh
              </button>
              <button className="border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-2 py-1">
                <FiFilter size={14} /> Filter
              </button>
            </div>
          </div>
          
          <table className="w-full table-auto text-gray-500 text-xs">
            <thead className="border-b-4 border-gray-300">
              <tr>
                <th className="text-center py-1 px-2"><input type="checkbox" /></th>
                <th className="text-left py-1 px-2">Sale #</th>
                <th className="text-left py-1 px-2">Date & Time</th>
                <th className="text-left py-1 px-2">Customer</th>
                <th className="text-center py-1 px-2">Items</th>
                <th className="text-right py-1 px-2">Total</th>
                <th className="text-center py-1 px-2">Payment</th>
                <th className="text-center py-1 px-2">Status</th>
                <th className="text-left py-1 px-2">Served By</th>
                <th className="text-center py-1 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <React.Fragment key={transaction.id}>
                  <tr className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="text-center py-1 px-2"><input type="checkbox" /></td>
                    <td className="py-1 px-2">
                      <p className="font-bold text-blue-600">{transaction.saleNumber}</p>
                      <p className="text-gray-600 text-[11px]">{transaction.channel}</p>
                    </td>
                    <td className="py-1 px-2">
                      <p className="font-semibold">{transaction.date}</p>
                      <p className="text-gray-600">{transaction.time}</p>
                    </td>
                    <td className="py-1 px-2 font-semibold">{transaction.customer}</td>
                    <td className="text-center py-1 px-2">{transaction.items}</td>
                    <td className="text-right py-1 px-2 font-bold">RWF {formatCurrency(transaction.total)}</td>
                    <td className="text-center py-1 px-2">
                      <span className={`px-2 py-0.5 text-2xs font-bold ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                        {transaction.paymentMethod}
                      </span>
                    </td>
                    <td className="text-center py-1 px-2">
                      <span className={`px-2 py-0.5 text-2xs font-bold ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-1 px-2">{transaction.servedBy}</td>
                    <td className="text-center py-1 px-2">
                      <div className="inline-flex border border-gray-200">
                        <button onClick={() => openSaleDetails(transaction)} className="p-1 px-2 cursor-pointer text-blue-600 hover:bg-blue-50 text-xs font-semibold">
                          View
                        </button>
                        <button onClick={() => toggleRow(transaction.id)} className={`p-1 px-3 cursor-pointer ${expandedRows.includes(transaction.id) ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <LuSquareArrowDownRight className={`transform transition-transform ${expandedRows.includes(transaction.id) ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.includes(transaction.id) && <ExpandedTransactionDetails transaction={transaction} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Refunds Tab */}
      {activeTab === 'refunds' && (
        <div className="bg-white overflow-x-auto">
          <div className="p-3 flex justify-between items-center border-b border-gray-300">
            <h3 className="font-bold text-sm uppercase">Refunds & Returns</h3>
            <div className="flex gap-2">
              <button className="border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-2 py-1">
                <BiRefresh size={14} /> Refresh
              </button>
            </div>
          </div>
          
          <table className="w-full table-auto text-gray-500 text-xs">
            <thead className="border-b-4 border-gray-300">
              <tr>
                <th className="text-left py-1 px-2">Refund #</th>
                <th className="text-left py-1 px-2">Original Sale</th>
                <th className="text-left py-1 px-2">Date & Time</th>
                <th className="text-left py-1 px-2">Customer</th>
                <th className="text-left py-1 px-2">Item</th>
                <th className="text-right py-1 px-2">Amount</th>
                <th className="text-left py-1 px-2">Reason</th>
                <th className="text-center py-1 px-2">Status</th>
                <th className="text-left py-1 px-2">Approved By</th>
                <th className="text-center py-1 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map(refund => (
                <tr key={refund.id} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-1 px-2 font-bold text-red-600">{refund.refundNumber}</td>
                  <td className="py-1 px-2 font-semibold text-blue-600">{refund.originalSale}</td>
                  <td className="py-1 px-2">
                    <p className="font-semibold">{refund.date}</p>
                    <p className="text-gray-600">{refund.time}</p>
                  </td>
                  <td className="py-1 px-2">{refund.customer}</td>
                  <td className="py-1 px-2 font-semibold">{refund.item}</td>
                  <td className="text-right py-1 px-2 font-bold text-red-600">RWF {formatCurrency(refund.amount)}</td>
                  <td className="py-1 px-2">{refund.reason}</td>
                  <td className="text-center py-1 px-2">
                    <span className={`px-2 py-0.5 text-2xs font-bold ${getStatusColor(refund.status)}`}>
                      {refund.status}
                    </span>
                  </td>
                  <td className="py-1 px-2">{refund.approvedBy || '—'}</td>
                  <td className="text-center py-1 px-2">
                    {refund.status === 'PENDING' ? (
                      <div className="inline-flex border border-gray-200">
                        <button className="p-1 px-2 cursor-pointer text-red-600 hover:bg-red-50 text-xs font-semibold">
                          Reject
                        </button>
                        <button className="p-1 px-2 cursor-pointer text-green-600 hover:bg-green-50 text-xs font-semibold">
                          Approve
                        </button>
                      </div>
                    ) : (
                      <button className="p-1 px-2 cursor-pointer text-blue-600 hover:bg-blue-50 text-xs font-semibold border border-gray-200">
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Credit Sales Tab */}
      {activeTab === 'credit' && (
        <div className="bg-white overflow-x-auto">
          <div className="p-3 flex justify-between items-center border-b border-gray-300">
            <h3 className="font-bold text-sm uppercase">Credit Sales & Receivables</h3>
          </div>
          
          <table className="w-full table-auto text-gray-500 text-xs">
            <thead className="border-b-4 border-gray-300">
              <tr>
                <th className="text-left py-1 px-2">Sale #</th>
                <th className="text-left py-1 px-2">Customer</th>
                <th className="text-right py-1 px-2">Amount</th>
                <th className="text-right py-1 px-2">Balance</th>
                <th className="text-center py-1 px-2">Due Date</th>
                <th className="text-center py-1 px-2">Days Overdue</th>
                <th className="text-center py-1 px-2">Status</th>
                <th className="text-center py-1 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {creditSales.map(credit => (
                <tr key={credit.id} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-1 px-2 font-bold text-blue-600">{credit.saleNumber}</td>
                  <td className="py-1 px-2 font-semibold">{credit.customer}</td>
                  <td className="text-right py-1 px-2 font-bold">RWF {formatCurrency(credit.amount)}</td>
                  <td className="text-right py-1 px-2 font-bold text-orange-600">RWF {formatCurrency(credit.balance)}</td>
                  <td className="text-center py-1 px-2 font-semibold">{credit.dueDate}</td>
                  <td className="text-center py-1 px-2">
                    <span className={`font-bold ${credit.daysOverdue > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {credit.daysOverdue > 0 ? credit.daysOverdue : '—'}
                    </span>
                  </td>
                  <td className="text-center py-1 px-2">
                    <span className={`px-2 py-0.5 text-2xs font-bold ${getStatusColor(credit.status)}`}>
                      {credit.status}
                    </span>
                  </td>
                  <td className="text-center py-1 px-2">
                    <div className="inline-flex border border-gray-200">
                      <button className="p-1 px-2 cursor-pointer text-green-600 hover:bg-green-50 text-xs font-semibold">
                        Record Payment
                      </button>
                      <button className="p-1 px-2 cursor-pointer text-blue-600 hover:bg-blue-50 text-xs font-semibold">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Products Tab */}
      {activeTab === 'top_products' && (
        <div className="bg-white border border-gray-300 rounded shadow">
          <div className="p-3 bg-gray-100 border-b border-gray-300">
            <h3 className="font-bold text-sm uppercase">Top Selling Products</h3>
          </div>
          <div className="p-4">
            <table className="w-full text-xs">
              <thead className="border-b-2 border-gray-300">
                <tr>
                  <th className="text-center py-1 px-2">#</th>
                  <th className="text-left py-1 px-2">Product</th>
                  <th className="text-center py-1 px-2">Qty Sold</th>
                  <th className="text-right py-1 px-2">Revenue</th>
                  <th className="text-center py-1 px-2">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, idx) => {
                  const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
                  const percentage = ((product.revenue / totalRevenue) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="text-center py-2 px-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white font-bold">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-bold">{product.name}</td>
                      <td className="text-center py-2 px-2 font-semibold">{product.qtySold}</td>
                      <td className="text-right py-2 px-2 font-bold text-green-600">RWF {formatCurrency(product.revenue)}</td>
                      <td className="text-center py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${percentage}%`}}></div>
                          </div>
                          <span className="font-bold">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <SaleDetailsModal />
      <RefundModal />
    </div>
  );
}