import React, { useState } from 'react';
import { BiSearch, BiRefresh, BiChevronUp } from 'react-icons/bi';
import { FaBoxOpen, FaExclamationTriangle, FaTruck, FaExchangeAlt } from 'react-icons/fa';
import { MdWarning, MdCheckCircle } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';
import { FaPrint, FaDownload, FaPlus } from 'react-icons/fa6';
import { LuSquareArrowDownRight } from 'react-icons/lu';

export default function EnhancedInventoryOversight() {
  const [activeTab, setActiveTab] = useState('low_stock');
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [collapsedCards, setCollapsedCards] = useState({});

  // Mock data
  const overviewStats = {
    totalItems: 342,
    totalValue: 245000000,
    outOfStock: 8,
    lowStock: 15,
    pendingPOs: 6,
    pendingAdjustments: 3
  };

  const lowStockItems = [
    { 
      id: 1,
      name: 'USB Type-C Cables', 
      sku: 'CABLE-USBC-001',
      category: 'Cables',
      warehouse: 'Downtown Main',
      current: 0, 
      reorder: 50, 
      optimal: 100,
      avgDailySales: 8,
      daysUntilStockout: 0,
      lastOrdered: '10/11/2025',
      supplier: 'Tech Distributors Ltd',
      unitCost: 2500,
      leadTime: 7
    },
    { 
      id: 2,
      name: 'Wireless Mouse Logitech', 
      sku: 'MOUSE-WL-001',
      category: 'Accessories',
      warehouse: 'Downtown Main',
      current: 12, 
      reorder: 30, 
      optimal: 50,
      avgDailySales: 1.5,
      daysUntilStockout: 8,
      lastOrdered: '15/12/2025',
      supplier: 'Tech Distributors Ltd',
      unitCost: 35000,
      leadTime: 5
    },
    { 
      id: 3,
      name: 'External HDD 1TB',
      sku: 'HDD-EXT-1TB',
      category: 'Storage',
      warehouse: 'Kimironko Store',
      current: 15,
      reorder: 25,
      optimal: 40,
      avgDailySales: 1.2,
      daysUntilStockout: 12,
      lastOrdered: '20/12/2025',
      supplier: 'Electronics Warehouse',
      unitCost: 85000,
      leadTime: 14
    }
  ];

  const pendingPOs = [
    {
      id: 1,
      code: 'PO-2026-001',
      supplier: 'Tech Distributors Ltd',
      items: 3,
      totalAmount: 4720000,
      requestedBy: 'Sarah Williams',
      requestDate: '05/01/2026',
      expectedDate: '12/01/2026',
      priority: 'urgent'
    },
    {
      id: 2,
      code: 'PO-2026-002',
      supplier: 'Global Electronics',
      items: 2,
      totalAmount: 2850000,
      requestedBy: 'Mike Johnson',
      requestDate: '04/01/2026',
      expectedDate: '18/01/2026',
      priority: 'high'
    }
  ];

  const pendingAdjustments = [
    {
      id: 1,
      item: 'Laptop Dell XPS',
      sku: 'LAP-DELL-XPS',
      warehouse: 'Downtown Main',
      type: 'Damaged',
      quantityBefore: 10,
      quantityAfter: 9,
      reason: 'Customer return - screen damage',
      requestedBy: 'Sarah Williams',
      requestDate: '05/01/2026'
    },
    {
      id: 2,
      item: 'Wireless Keyboard',
      sku: 'KEY-WL-002',
      warehouse: 'Airport Branch',
      type: 'Found',
      quantityBefore: 15,
      quantityAfter: 17,
      reason: 'Found during physical count',
      requestedBy: 'John Doe',
      requestDate: '04/01/2026'
    }
  ];

  const recentMovements = [
    { time: '14:30', type: 'Sale', item: 'Laptop Dell XPS', qty: -1, location: 'Downtown Store', user: 'Mike Johnson' },
    { time: '13:15', type: 'Purchase', item: 'USB Cables', qty: 100, location: 'Main Warehouse', user: 'Sarah Williams' },
    { time: '11:20', type: 'Transfer', item: 'Wireless Mouse', qty: -10, location: 'Downtown → Airport', user: 'Sarah Williams' },
    { time: '10:45', type: 'Adjustment', item: 'HDMI Cables', qty: -2, location: 'Downtown Store', user: 'Manager' }
  ];

  const formatCurrency = (amount) => `${amount.toLocaleString()}`;

  const toggleCard = (cardName) => {
    setCollapsedCards(prev => ({ ...prev, [cardName]: !prev[cardName] }));
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openStockIn = (item) => {
    setSelectedItem(item);
    setShowStockInModal(true);
  };

  const openStockOut = (item) => {
    setSelectedItem(item);
    setShowStockOutModal(true);
  };

  const openAdjustment = (item) => {
    setSelectedItem(item);
    setShowAdjustmentModal(true);
  };

  const openTransfer = (item) => {
    setSelectedItem(item);
    setShowTransferModal(true);
  };

  // Stock In Modal
  const StockInModal = () => {
    const [formData, setFormData] = useState({
      quantity: '',
      supplier: '',
      invoiceNumber: '',
      unitCost: '',
      batchNumber: '',
      expiryDate: '',
      notes: ''
    });

    if (!showStockInModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowStockInModal(false)}>
        <div className="bg-white rounded shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-lg uppercase">Stock In - Purchase Receipt</h3>
            <button onClick={() => setShowStockInModal(false)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {selectedItem && (
              <div className="bg-gray-200 p-3">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 mb-1">Item</p>
                    <p className="font-bold">{selectedItem.name}</p>
                    <p className="text-gray-600">{selectedItem.sku}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Current Stock</p>
                    <p className="font-bold text-lg">{selectedItem.current}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Warehouse</p>
                    <p className="font-bold">{selectedItem.warehouse}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Quantity *</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Enter quantity" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Unit Cost *</label>
                <input type="number" value={formData.unitCost} onChange={(e) => setFormData({...formData, unitCost: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Cost per unit" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Supplier *</label>
                <select value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0">
                  <option value="">Select supplier</option>
                  <option value="Tech Distributors Ltd">Tech Distributors Ltd</option>
                  <option value="Global Electronics">Global Electronics</option>
                  <option value="Electronics Warehouse">Electronics Warehouse</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Invoice Number</label>
                <input type="text" value={formData.invoiceNumber} onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="INV-001" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Batch Number</label>
                <input type="text" value={formData.batchNumber} onChange={(e) => setFormData({...formData, batchNumber: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Expiry Date</label>
                <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3" className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Additional notes"></textarea>
            </div>

            {formData.quantity && formData.unitCost && (
              <div className="bg-blue-200 border p-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">TOTAL VALUE:</span>
                  <span className="font-bold text-lg">RWF {formatCurrency(formData.quantity * formData.unitCost)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-200 border-t flex gap-3">
            <button onClick={() => setShowStockInModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 text-sm font-bold uppercase">Cancel</button>
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 text-sm font-bold uppercase">Receive Stock</button>
          </div>
        </div>
      </div>
    );
  };

  // Stock Out Modal
  const StockOutModal = () => {
    const [formData, setFormData] = useState({
      quantity: '',
      reason: '',
      reference: '',
      notes: ''
    });

    if (!showStockOutModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowStockOutModal(false)}>
        <div className="bg-white rounded shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-lg uppercase">Stock Out</h3>
            <button onClick={() => setShowStockOutModal(false)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>

          <div className="p-6 space-y-4">
            {selectedItem && (
              <div className="bg-gray-200 p-3">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 mb-1">Item</p>
                    <p className="font-bold">{selectedItem.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Current Stock</p>
                    <p className="font-bold text-lg">{selectedItem.current}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Available</p>
                    <p className="font-bold text-green-600">{selectedItem.current}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Quantity *</label>
              <input type="number" max={selectedItem?.current} value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Reason *</label>
              <select value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0">
                <option value="">Select reason</option>
                <option value="SALE">Sale</option>
                <option value="DAMAGED">Damaged</option>
                <option value="LOST">Lost</option>
                <option value="RETURN">Return to Supplier</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Reference Number</label>
              <input type="text" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Sale/Return number" />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3" className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0"></textarea>
            </div>
          </div>

          <div className="p-4 bg-gray-200 border-t flex gap-3">
            <button onClick={() => setShowStockOutModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 text-sm font-bold uppercase">Cancel</button>
            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 text-sm font-bold uppercase">Remove Stock</button>
          </div>
        </div>
      </div>
    );
  };

  // Adjustment Modal
  const AdjustmentModal = () => {
    const [formData, setFormData] = useState({
      adjustmentType: '',
      newQuantity: '',
      reason: '',
      notes: ''
    });

    if (!showAdjustmentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAdjustmentModal(false)}>
        <div className="bg-white rounded shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-lg uppercase">Stock Adjustment</h3>
            <button onClick={() => setShowAdjustmentModal(false)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>

          <div className="p-6 space-y-4">
            {selectedItem && (
              <div className="bg-gray-200 p-3">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 mb-1">Item</p>
                    <p className="font-bold">{selectedItem.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Current Stock</p>
                    <p className="font-bold text-lg">{selectedItem.current}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">New Stock</p>
                    <p className="font-bold text-blue-600 text-lg">{formData.newQuantity || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Adjustment Type *</label>
              <select value={formData.adjustmentType} onChange={(e) => setFormData({...formData, adjustmentType: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0">
                <option value="">Select type</option>
                <option value="COUNT">Physical Count Correction</option>
                <option value="FOUND">Found Stock</option>
                <option value="DAMAGED">Damaged Stock</option>
                <option value="LOST">Lost/Stolen</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">New Quantity *</label>
              <input type="number" value={formData.newQuantity} onChange={(e) => setFormData({...formData, newQuantity: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Actual quantity" />
            </div>

            {formData.newQuantity && selectedItem && (
              <div className="bg-blue-200 border p-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">CHANGE:</span>
                  <span className={`font-bold text-lg ${formData.newQuantity - selectedItem.current >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.newQuantity - selectedItem.current >= 0 ? '+' : ''}{formData.newQuantity - selectedItem.current}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Reason *</label>
              <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} rows="3" className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Explain the reason for adjustment"></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Additional Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="2" className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0"></textarea>
            </div>

            <div className="bg-yellow-200 border p-3 text-xs">
              <p className="font-bold mb-1">⚠️ MANAGER APPROVAL REQUIRED</p>
              <p>This adjustment will be submitted for manager approval before updating inventory.</p>
            </div>
          </div>

          <div className="p-4 bg-gray-200 border-t flex gap-3">
            <button onClick={() => setShowAdjustmentModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 text-sm font-bold uppercase">Cancel</button>
            <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 text-sm font-bold uppercase">Submit for Approval</button>
          </div>
        </div>
      </div>
    );
  };

  // Transfer Modal
  const TransferModal = () => {
    const [formData, setFormData] = useState({
      fromWarehouse: '',
      toWarehouse: '',
      quantity: '',
      reason: '',
      notes: ''
    });

    if (!showTransferModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTransferModal(false)}>
        <div className="bg-white rounded shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-lg uppercase">Transfer Stock</h3>
            <button onClick={() => setShowTransferModal(false)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>

          <div className="p-6 space-y-4">
            {selectedItem && (
              <div className="bg-gray-200 p-3">
                <p className="text-xs text-gray-600 mb-1">Item</p>
                <p className="font-bold">{selectedItem.name}</p>
                <p className="text-xs text-gray-600">{selectedItem.sku}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">From Warehouse *</label>
                <select value={formData.fromWarehouse} onChange={(e) => setFormData({...formData, fromWarehouse: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0">
                  <option value="">Select warehouse</option>
                  <option value="Downtown Main">Downtown Main</option>
                  <option value="Airport Branch">Airport Branch</option>
                  <option value="Kimironko Store">Kimironko Store</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">To Warehouse *</label>
                <select value={formData.toWarehouse} onChange={(e) => setFormData({...formData, toWarehouse: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0">
                  <option value="">Select warehouse</option>
                  <option value="Downtown Main">Downtown Main</option>
                  <option value="Airport Branch">Airport Branch</option>
                  <option value="Kimironko Store">Kimironko Store</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Quantity *</label>
              <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Reason *</label>
              <input type="text" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Stock rebalancing, customer request, etc." />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3" className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0"></textarea>
            </div>
          </div>

          <div className="p-4 bg-gray-200 border-t flex gap-3">
            <button onClick={() => setShowTransferModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 text-sm font-bold uppercase">Cancel</button>
            <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 text-sm font-bold uppercase">Create Transfer</button>
          </div>
        </div>
      </div>
    );
  };

  const ExpandedRowDetails = ({ item }) => (
    <tr className="bg-gray-50">
      <td colSpan="9" className="p-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-white border border-gray-300 p-3">
            <p className="font-bold text-xs uppercase text-gray-700 mb-2">Stock Details</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Stock:</span>
                <span className="font-bold text-red-600">{item.current} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reorder Point:</span>
                <span className="font-semibold">{item.reorder} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Optimal Level:</span>
                <span className="font-semibold">{item.optimal} units</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2">
                <span className="text-gray-600">Shortage:</span>
                <span className="font-bold text-red-600">{item.reorder - item.current} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Daily Sales:</span>
                <span className="font-semibold">{item.avgDailySales} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days Until Stockout:</span>
                <span className={`font-bold ${item.daysUntilStockout === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  {item.daysUntilStockout === 0 ? 'Out of Stock' : `${item.daysUntilStockout} days`}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-gray-300 p-3">
              <p className="font-bold text-xs uppercase text-gray-700 mb-2">Supplier Info</p>
              <p className="font-semibold mb-1">{item.supplier}</p>
              <p className="text-gray-600">Unit Cost: <span className="font-semibold">RWF {formatCurrency(item.unitCost)}</span></p>
              <p className="text-gray-600">Lead Time: <span className="font-semibold">{item.leadTime} days</span></p>
            </div>

            <div className="bg-blue-200 border p-3">
              <p className="font-bold text-xs uppercase mb-2">Recommended Order</p>
              <p className="text-2xl font-bold text-blue-600 mb-1">{Math.max(item.optimal - item.current, Math.ceil(item.avgDailySales * item.leadTime * 1.5))} units</p>
              <p className="text-xs">Total: RWF {formatCurrency(Math.max(item.optimal - item.current, Math.ceil(item.avgDailySales * item.leadTime * 1.5)) * item.unitCost)}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => openStockIn(item)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 text-xs font-bold uppercase">Stock In</button>
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 text-xs font-bold uppercase">Create PO</button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl">Inventory Management</h2>
       <div className="grid grid-cols-3 gap-3">
          {/* Overview Stats */}
      <div className="col-span-2 bg-white border border-gray-300 rounded shadow">
        <div className="p-3 sm:p-4 flex justify-between items-center">
          <h3 className="font-bold text-base sm:text-lg uppercase">Inventory Overview</h3>
          <button onClick={() => toggleCard('overview')} className="transition-transform duration-300" style={{ transform: collapsedCards.overview ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <BiChevronUp size={20} className="sm:w-6 sm:h-6"/>
          </button>
        </div>
        <div className="bg-gray-200 h-1 sm:h-2"></div>
        
        <div className={`overflow-hidden transition-all duration-300 ${collapsedCards.overview ? 'max-h-0' : 'max-h-[500px]'}`}>
        <div className="p-3 sm:p-4">
  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300">

    {/* LEFT COLUMN */}
    <ul className="space-y-3 pr-0 md:pr-4">
      <li className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm uppercase text-gray-600">
          <FaBoxOpen className="text-blue-600" size={16} />
          Items
        </div>
        <span className="text-lg font-bold">{overviewStats.totalItems}</span>
      </li>

      <li className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm uppercase text-gray-600">
          <FaTruck className="text-purple-600" size={16} />
          Pending POs
        </div>
        <span className="text-lg font-bold text-purple-600">
          {overviewStats.pendingPOs}
        </span>
      </li>

      <li className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm uppercase text-gray-600">
          <FaExchangeAlt className="text-yellow-600" size={14} />
          Adjustments
        </div>
        <span className="text-lg font-bold text-yellow-600">
          {overviewStats.pendingAdjustments}
        </span>
      </li>
    </ul>

    {/* RIGHT COLUMN */}
    <ul className="space-y-3 pl-0 md:pl-4 pt-3 md:pt-0">
      <li className="flex justify-between items-center">
        <span className="text-sm uppercase text-gray-600">Total Value</span>
        <span className="text-lg font-bold text-blue-600">
          RWF {formatCurrency(overviewStats.totalValue)}
        </span>
      </li>

      <li className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm uppercase text-gray-600">
          <FaExclamationTriangle className="text-red-600" size={14} />
          Out of Stock
        </div>
        <span className="text-lg font-bold text-red-600">
          {overviewStats.outOfStock}
        </span>
      </li>

      <li className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm uppercase text-gray-600">
          <MdWarning className="text-orange-600" size={16} />
          Low Stock
        </div>
        <span className="text-lg font-bold text-orange-600">
          {overviewStats.lowStock}
        </span>
      </li>
    </ul>

  </div>
</div>

        </div>
      </div>
         {/* Quick Actions Bar */}
      <div className="bg-white border border-gray-300 rounded shadow">
        <div className="p-3 sm:p-4 flex justify-between items-center">
          <h3 className="font-bold text-base sm:text-lg uppercase">Quick Actions</h3>
        </div>
        <div className="bg-gray-200 h-1 sm:h-2"></div>
        <div className="p-3 sm:p-4 grid grid-cols-2  gap-3">
          <button onClick={() => setShowStockInModal(true)} className="bg-green-500 rounded hover:bg-green-600 text-white py-3 text-xs font-bold uppercase flex items-center justify-center gap-2">
            <FaPlus size={14} /> Stock In
          </button>
          <button onClick={() => setShowStockOutModal(true)} className="bg-red-500 rounded hover:bg-red-600 text-white py-3 text-xs font-bold uppercase flex items-center justify-center gap-2">
            <FaPlus size={14} /> Stock Out
          </button>
          <button onClick={() => setShowAdjustmentModal(true)} className="bg-orange-500 rounded hover:bg-orange-600 text-white py-3 text-xs font-bold uppercase flex items-center justify-center gap-2">
            <FaPlus size={14} /> Adjustment
          </button>
          <button onClick={() => setShowTransferModal(true)} className="bg-purple-500 rounded hover:bg-purple-600 text-white py-3 text-xs font-bold uppercase flex items-center justify-center gap-2">
            <FaPlus size={14} /> Transfer
          </button>
        </div>
      </div>

    
       </div>
     

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveTab('low_stock')} className={`px-3 py-1 rounded text-xs font-bold uppercase ${activeTab === 'low_stock' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Low / Out Stock ({lowStockItems.length})
        </button>
        <button onClick={() => setActiveTab('purchase_orders')} className={`px-3 py-1 rounded text-xs font-bold uppercase ${activeTab === 'purchase_orders' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Purchase Orders ({pendingPOs.length})
        </button>
        <button onClick={() => setActiveTab('adjustments')} className={`px-3 py-1 rounded text-xs font-bold uppercase ${activeTab === 'adjustments' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Adjustments ({pendingAdjustments.length})
        </button>
        <button onClick={() => setActiveTab('movements')} className={`px-3 py-1 rounded text-xs font-bold uppercase ${activeTab === 'movements' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Movements
        </button>
      </div>

      <hr className="text-gray-400" />

      {/* Low Stock Tab */}
      {activeTab === 'low_stock' && (
        <div className="bg-white overflow-x-auto">
          <div className="p-3 flex justify-between items-center border-b border-gray-300">
            <h3 className="font-bold text-sm uppercase">Low & Out of Stock Items</h3>
            <div className="flex gap-2">
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
                <th className="text-left py-1 px-2">Item</th>
                <th className="text-center py-1 px-2">Current</th>
                <th className="text-center py-1 px-2">Reorder</th>
                <th className="text-center py-1 px-2">Shortage</th>
                <th className="text-center py-1 px-2">Days Left</th>
                <th className="text-left py-1 px-2">Supplier</th>
                <th className="text-right py-1 px-2">Recommended</th>
                <th className="text-center py-1 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map(item => (
                <React.Fragment key={item.id}>
                  <tr className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="text-center py-1 px-2"><input type="checkbox" /></td>
                    <td className="py-1 px-2">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-gray-600">{item.sku}</p>
                        <p className="text-gray-500 text-[11px]">{item.warehouse}</p>
                      </div>
                    </td>
                    <td className="text-center py-1 px-2">
                      <span className={`font-bold text-lg ${item.current === 0 ? 'text-red-600' : 'text-orange-600'}`}>{item.current}</span>
                    </td>
                    <td className="text-center py-1 px-2 font-semibold">{item.reorder}</td>
                    <td className="text-center py-1 px-2">
                      <span className="font-bold text-red-600">{item.reorder - item.current}</span>
                    </td>
                    <td className="text-center py-1 px-2">
                      <span className={`font-bold ${item.daysUntilStockout === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {item.daysUntilStockout === 0 ? 'OUT' : `${item.daysUntilStockout}d`}
                      </span>
                    </td>
                    <td className="py-1 px-2 font-semibold">{item.supplier}</td>
                    <td className="text-right py-1 px-2">
                      <div>
                        <p className="font-bold text-blue-600">{Math.max(item.optimal - item.current, Math.ceil(item.avgDailySales * item.leadTime * 1.5))} units</p>
                        <p className="text-gray-600">RWF {formatCurrency(Math.max(item.optimal - item.current, Math.ceil(item.avgDailySales * item.leadTime * 1.5)) * item.unitCost)}</p>
                      </div>
                    </td>
                    <td className="text-center py-1 px-2">
                      <div className="inline-flex border border-gray-200">
                        <button onClick={() => openStockIn(item)} className="p-1 px-2 cursor-pointer text-green-600 hover:bg-green-50 text-xs font-semibold">
                          Stock In
                        </button>
                        <button onClick={() => toggleRow(item.id)} className={`p-1 px-3 cursor-pointer ${expandedRows.includes(item.id) ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <LuSquareArrowDownRight className={`transform transition-transform ${expandedRows.includes(item.id) ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.includes(item.id) && <ExpandedRowDetails item={item} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'purchase_orders' && (
        <div className="bg-white overflow-x-auto">
          <div className="p-3 flex justify-between items-center border-b border-gray-300">
            <h3 className="font-bold text-sm uppercase">Pending Purchase Orders</h3>
          </div>
          
          <table className="w-full table-auto text-gray-500 text-xs">
            <thead className="border-b-4 border-gray-300">
              <tr>
                <th className="text-left py-1 px-2">PO Code</th>
                <th className="text-left py-1 px-2">Supplier</th>
                <th className="text-center py-1 px-2">Items</th>
                <th className="text-right py-1 px-2">Amount</th>
                <th className="text-left py-1 px-2">Requested By</th>
                <th className="text-center py-1 px-2">Request Date</th>
                <th className="text-center py-1 px-2">Expected</th>
                <th className="text-center py-1 px-2">Priority</th>
                <th className="text-center py-1 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingPOs.map(po => (
                <tr key={po.id} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-1 px-2 font-bold text-blue-600">{po.code}</td>
                  <td className="py-1 px-2 font-semibold">{po.supplier}</td>
                  <td className="text-center py-1 px-2">{po.items}</td>
                  <td className="text-right py-1 px-2 font-bold">RWF {formatCurrency(po.totalAmount)}</td>
                  <td className="py-1 px-2">{po.requestedBy}</td>
                  <td className="text-center py-1 px-2">{po.requestDate}</td>
                  <td className="text-center py-1 px-2">{po.expectedDate}</td>
                  <td className="text-center py-1 px-2">
                    <span className={`px-2 py-0.5 text-2xs font-bold ${po.priority === 'urgent' ? 'bg-red-200 border text-red-700' : 'bg-orange-200 border text-orange-700'}`}>
                      {po.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-center py-1 px-2">
                    <div className="inline-flex border border-gray-200">
                      <button className="p-1 px-2 cursor-pointer text-red-600 hover:bg-red-50 text-xs font-semibold">
                        Reject
                      </button>
                      <button className="p-1 px-2 cursor-pointer text-green-600 hover:bg-green-50 text-xs font-semibold">
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjustments Tab */}
      {activeTab === 'adjustments' && (
        <div className="bg-white overflow-x-auto">
          <div className="p-3 flex justify-between items-center border-b border-gray-300">
            <h3 className="font-bold text-sm uppercase">Pending Adjustments</h3>
          </div>
          
          <table className="w-full table-auto text-gray-500 text-xs">
            <thead className="border-b-4 border-gray-300">
              <tr>
                <th className="text-left py-1 px-2">Item</th>
                <th className="text-left py-1 px-2">Warehouse</th>
                <th className="text-center py-1 px-2">Type</th>
                <th className="text-center py-1 px-2">Before</th>
                <th className="text-center py-1 px-2">After</th>
                <th className="text-center py-1 px-2">Change</th>
                <th className="text-left py-1 px-2">Reason</th>
                <th className="text-left py-1 px-2">Requested By</th>
                <th className="text-center py-1 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdjustments.map(adj => (
                <tr key={adj.id} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-1 px-2">
                    <div>
                      <p className="font-bold">{adj.item}</p>
                      <p className="text-gray-600">{adj.sku}</p>
                    </div>
                  </td>
                  <td className="py-1 px-2 font-semibold">{adj.warehouse}</td>
                  <td className="text-center py-1 px-2">
                    <span className={`px-2 py-0.5 text-2xs font-bold ${adj.type === 'Damaged' ? 'bg-red-200 border text-red-700' : 'bg-green-200 border text-green-700'}`}>
                      {adj.type}
                    </span>
                  </td>
                  <td className="text-center py-1 px-2 font-semibold">{adj.quantityBefore}</td>
                  <td className="text-center py-1 px-2 font-semibold">{adj.quantityAfter}</td>
                  <td className="text-center py-1 px-2">
                    <span className={`font-bold ${adj.quantityAfter > adj.quantityBefore ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.quantityAfter > adj.quantityBefore ? '+' : ''}{adj.quantityAfter - adj.quantityBefore}
                    </span>
                  </td>
                  <td className="py-1 px-2">{adj.reason}</td>
                  <td className="py-1 px-2">{adj.requestedBy}</td>
                  <td className="text-center py-1 px-2">
                    <div className="inline-flex border border-gray-200">
                      <button className="p-1 px-2 cursor-pointer text-red-600 hover:bg-red-50 text-xs font-semibold">
                        Reject
                      </button>
                      <button className="p-1 px-2 cursor-pointer text-green-600 hover:bg-green-50 text-xs font-semibold">
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <div className="bg-white border border-gray-300 rounded shadow">
          <div className="p-3 bg-gray-100 border-b border-gray-300">
            <h3 className="font-bold text-sm uppercase">Recent Stock Movements</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {recentMovements.map((move, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-200 hover:bg-gray-300">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {move.type === 'Sale' && '📤'}
                      {move.type === 'Purchase' && '📥'}
                      {move.type === 'Transfer' && '🔄'}
                      {move.type === 'Adjustment' && '⚙️'}
                    </span>
                    <div>
                      <p className="font-bold text-sm">{move.item}</p>
                      <p className="text-xs text-gray-600">{move.location} • {move.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${move.qty < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {move.qty > 0 ? '+' : ''}{move.qty}
                    </p>
                    <p className="text-xs text-gray-600">{move.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <StockInModal />
      <StockOutModal />
      <AdjustmentModal />
      <TransferModal />
    </div>
  );
}