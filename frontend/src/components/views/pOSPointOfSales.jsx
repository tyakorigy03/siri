import React, { useState } from 'react';
import { BiSearch, BiTrash, BiPlus, BiMinus } from 'react-icons/bi';
import { FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaUndo, FaBarcode } from 'react-icons/fa';
import { MdShoppingCart, MdClose } from 'react-icons/md';

export default function POSPointOfSale() {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Mock products database
  const products = [
    { id: 1, name: 'Laptop Dell XPS', sku: 'SKU-LAP-001', barcode: 'BAR-123456789', price: 1500000, stock: 25, category: 'Electronics' },
    { id: 2, name: 'iPhone 15 Pro', sku: 'SKU-PHN-001', barcode: 'BAR-987654321', price: 1800000, stock: 15, category: 'Electronics' },
    { id: 3, name: 'Wireless Mouse', sku: 'SKU-ACC-001', barcode: 'BAR-789123456', price: 35000, stock: 150, category: 'Accessories' },
    { id: 4, name: 'USB-C Cable', sku: 'SKU-ACC-002', barcode: 'BAR-321654987', price: 15000, stock: 400, category: 'Accessories' },
    { id: 5, name: 'External HDD 1TB', sku: 'SKU-STR-001', barcode: 'BAR-147258369', price: 180000, stock: 45, category: 'Storage' },
    { id: 6, name: 'Bluetooth Headphones', sku: 'SKU-AUD-001', barcode: 'BAR-963852741', price: 120000, stock: 60, category: 'Audio' },
    { id: 7, name: 'HDMI Cable 2m', sku: 'SKU-CABLE-001', barcode: 'BAR-456789012', price: 25000, stock: 200, category: 'Cables' },
    { id: 8, name: 'Keyboard Mechanical', sku: 'SKU-ACC-003', barcode: 'BAR-753951456', price: 85000, stock: 35, category: 'Accessories' }
  ];

  const customers = [
    { id: 1, name: 'Walk-in Customer', phone: null, credit: false },
    { id: 2, name: 'ABC Corporation', phone: '+250788123456', credit: true, creditLimit: 5000000 },
    { id: 3, name: 'XYZ Enterprises', phone: '+250788987654', credit: true, creditLimit: 3000000 },
    { id: 4, name: 'John Doe', phone: '+250788555777', credit: false }
  ];

  const formatCurrency = (amount) => `${amount.toLocaleString()}`;

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity <= product.stock) {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const searchProducts = () => {
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query) ||
      p.barcode.toLowerCase().includes(query)
    );
  };

  const handleBarcodeInput = (e) => {
    if (e.key === 'Enter' && barcodeInput) {
      const product = products.find(p => p.barcode === barcodeInput || p.sku === barcodeInput);
      if (product) {
        addToCart(product);
        setBarcodeInput('');
      }
    }
  };

  // Payment Modal
  const PaymentModal = () => {
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [amountReceived, setAmountReceived] = useState('');
    const [reference, setReference] = useState('');

    if (!showPaymentModal) return null;

    const total = calculateTotal();
    const change = amountReceived ? parseFloat(amountReceived) - total : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPaymentModal(false)}>
        <div className="bg-white rounded shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-lg uppercase">Process Payment</h3>
            <button onClick={() => setShowPaymentModal(false)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-blue-200 border p-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">TOTAL TO PAY:</span>
                <span className="font-bold text-3xl">RWF {formatCurrency(total)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 uppercase">Payment Method *</label>
              <div className="grid grid-cols-4 gap-3">
                <button onClick={() => setPaymentMethod('CASH')} className={`p-4 border-2 rounded flex flex-col items-center gap-2 ${paymentMethod === 'CASH' ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}>
                  <FaMoneyBillWave className={paymentMethod === 'CASH' ? 'text-green-600' : 'text-gray-600'} size={24} />
                  <span className="font-bold text-xs">CASH</span>
                </button>
                <button onClick={() => setPaymentMethod('MOMO')} className={`p-4 border-2 rounded flex flex-col items-center gap-2 ${paymentMethod === 'MOMO' ? 'border-purple-500 bg-purple-100' : 'border-gray-300'}`}>
                  <FaMobileAlt className={paymentMethod === 'MOMO' ? 'text-purple-600' : 'text-gray-600'} size={24} />
                  <span className="font-bold text-xs">MOMO</span>
                </button>
                <button onClick={() => setPaymentMethod('CARD')} className={`p-4 border-2 rounded flex flex-col items-center gap-2 ${paymentMethod === 'CARD' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}>
                  <FaCreditCard className={paymentMethod === 'CARD' ? 'text-blue-600' : 'text-gray-600'} size={24} />
                  <span className="font-bold text-xs">CARD</span>
                </button>
                <button onClick={() => setPaymentMethod('CREDIT')} disabled={!selectedCustomer?.credit} className={`p-4 border-2 rounded flex flex-col items-center gap-2 ${paymentMethod === 'CREDIT' ? 'border-orange-500 bg-orange-100' : 'border-gray-300'} ${!selectedCustomer?.credit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <FaCreditCard className={paymentMethod === 'CREDIT' ? 'text-orange-600' : 'text-gray-600'} size={24} />
                  <span className="font-bold text-xs">CREDIT</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'CASH' && (
              <>
                <div>
                  <label className="block text-xs font-bold mb-1 uppercase">Amount Received *</label>
                  <input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} className="w-full border border-gray-400 rounded-0 p-3 text-lg font-bold focus:border-blue-500 focus:outline-0" placeholder="Enter amount" autoFocus />
                </div>
                {change >= 0 && amountReceived && (
                  <div className="bg-green-200 border p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">CHANGE:</span>
                      <span className="font-bold text-3xl text-green-600">RWF {formatCurrency(change)}</span>
                    </div>
                  </div>
                )}
                {change < 0 && amountReceived && (
                  <div className="bg-red-200 border p-3">
                    <p className="font-bold text-red-700">⚠️ Insufficient amount received</p>
                  </div>
                )}
              </>
            )}

            {(paymentMethod === 'MOMO' || paymentMethod === 'CARD') && (
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Reference/Transaction Number *</label>
                <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full border border-gray-400 rounded-0 p-2 text-sm focus:border-blue-500 focus:outline-0" placeholder="Enter reference number" />
              </div>
            )}

            {paymentMethod === 'CREDIT' && selectedCustomer && (
              <div className="bg-orange-200 border p-3">
                <p className="text-xs mb-2"><span className="font-bold">Customer:</span> {selectedCustomer.name}</p>
                <p className="text-xs"><span className="font-bold">Credit Limit:</span> RWF {formatCurrency(selectedCustomer.creditLimit)}</p>
              </div>
            )}

            <div className="bg-gray-200 p-3">
              <p className="text-xs font-bold mb-2 uppercase">Order Summary</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Items ({cart.length}):</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">RWF {formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (18%):</span>
                  <span className="font-semibold">RWF {formatCurrency(calculateVAT())}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-200 border-t flex gap-3">
            <button onClick={() => setShowPaymentModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 text-sm font-bold uppercase">Cancel</button>
            <button disabled={paymentMethod === 'CASH' ? change < 0 || !amountReceived : false} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 text-sm font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed">
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Customer Selection Modal
  const CustomerModal = () => {
    if (!showCustomerModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCustomerModal(false)}>
        <div className="bg-white rounded shadow-xl max-w-xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-bold text-lg uppercase">Select Customer</h3>
            <button onClick={() => setShowCustomerModal(false)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {customers.map(customer => (
                <button key={customer.id} onClick={() => { setSelectedCustomer(customer); setShowCustomerModal(false); }} className={`w-full p-3 text-left border-2 rounded hover:bg-gray-50 ${selectedCustomer?.id === customer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{customer.name}</p>
                      {customer.phone && <p className="text-xs text-gray-600">{customer.phone}</p>}
                    </div>
                    {customer.credit && (
                      <span className="bg-orange-200 border text-orange-700 text-xs px-2 py-1 font-bold">
                        CREDIT
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-200 border-t">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 text-sm font-bold uppercase">
              <BiPlus className="inline mr-2" size={16} /> Add New Customer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 md:p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl">Point of Sale</h2>
        <div className="flex gap-2">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-xs font-bold uppercase">
            Hold Sale
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 text-xs font-bold uppercase">
            Retrieve Hold
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT SIDE - Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="bg-white border border-gray-300 rounded shadow p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative flex items-center">
                <input type="text" placeholder="Search by name, SKU, or scan barcode..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 p-2 pr-10 text-sm" />
                <BiSearch className="absolute right-3 text-gray-500" size={20} />
              </div>
              <div className="flex items-center gap-2 border border-gray-400 px-3">
                <FaBarcode className="text-gray-600" size={18} />
                <input type="text" placeholder="Scan..." value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={handleBarcodeInput} className="w-32 focus:outline-0 text-sm" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 bg-gray-100 border-b border-gray-300">
              <h3 className="font-bold text-sm uppercase">Products</h3>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
              {searchProducts().map(product => (
                <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock === 0} className={`p-3 border-2 rounded text-left hover:border-blue-500 ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}>
                  <p className="font-bold text-sm mb-1">{product.name}</p>
                  <p className="text-xs text-gray-600 mb-2">{product.sku}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-bold text-lg text-blue-600">RWF {formatCurrency(product.price)}</p>
                      <p className={`text-xs ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                        Stock: {product.stock}
                      </p>
                    </div>
                    <BiPlus className="text-blue-600" size={24} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Cart & Checkout */}
        <div className="space-y-4">
          {/* Customer Selection */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 bg-gray-100 border-b border-gray-300">
              <h3 className="font-bold text-sm uppercase">Customer</h3>
            </div>
            <div className="p-3">
              {selectedCustomer ? (
                <div className="flex justify-between items-center p-2 bg-blue-100 border border-blue-300 rounded">
                  <div>
                    <p className="font-bold text-sm">{selectedCustomer.name}</p>
                    {selectedCustomer.phone && <p className="text-xs text-gray-600">{selectedCustomer.phone}</p>}
                  </div>
                  <button onClick={() => setShowCustomerModal(true)} className="text-blue-600 hover:text-blue-800 text-xs font-bold">
                    Change
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowCustomerModal(true)} className="w-full bg-gray-200 hover:bg-gray-300 p-3 rounded text-sm font-bold uppercase flex items-center justify-center gap-2">
                  <BiPlus size={16} /> Select Customer
                </button>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MdShoppingCart size={20} />
                <h3 className="font-bold text-sm uppercase">Cart ({cart.length})</h3>
              </div>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-red-600 hover:text-red-800 text-xs font-bold uppercase">
                  Clear All
                </button>
              )}
            </div>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MdShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-gray-200 p-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">RWF {formatCurrency(item.price)} each</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-800">
                        <BiTrash size={16} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-gray-400 hover:bg-gray-500 text-white w-6 h-6 flex items-center justify-center">
                          <BiMinus size={14} />
                        </button>
                        <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)} className="w-12 text-center border border-gray-400 p-1 text-sm font-bold" />
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="bg-gray-400 hover:bg-gray-500 text-white w-6 h-6 flex items-center justify-center disabled:opacity-50">
                          <BiPlus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-sm">RWF {formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white border border-gray-300 rounded shadow">
            <div className="p-3 bg-gray-100 border-b border-gray-300">
              <h3 className="font-bold text-sm uppercase">Order Summary</h3>
            </div>
            <div className="p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">RWF {formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (18%):</span>
                <span className="font-semibold">RWF {formatCurrency(calculateVAT())}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-2 flex justify-between items-center">
                <span className="font-bold text-lg">TOTAL:</span>
                <span className="font-bold text-2xl text-blue-600">RWF {formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Checkout Actions */}
          <div className="space-y-2">
            <button onClick={() => cart.length > 0 && setShowPaymentModal(true)} disabled={cart.length === 0} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed rounded">
              Process Payment
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 text-xs font-bold uppercase rounded">
                <FaUndo className="inline mr-2" size={12} /> Cancel Sale
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 text-xs font-bold uppercase rounded">
                Quick Actions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal />
      <CustomerModal />
    </div>
  );
}