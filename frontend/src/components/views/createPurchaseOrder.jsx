import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdAdd, MdDelete } from 'react-icons/md';
import { createPurchaseOrder, getSuppliers, getWarehouses } from '../../services/purchases';
import { getProducts } from '../../services/products';
import { getBranches } from '../../services/branches';
import { showSuccess, showError } from '../../utils/toast';
import { getUserData } from '../../config/api';

export default function CreatePurchaseOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    warehouse_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    notes: ''
  });
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [searchProduct, setSearchProduct] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [productsRes, branchesRes] = await Promise.all([
        getProducts({ limit: 1000, active: true }),
        getBranches()
      ]);
      
      setProducts(Array.isArray(productsRes) ? productsRes : (productsRes?.data || productsRes?.items || []));
      setBranches(Array.isArray(branchesRes) ? branchesRes : (branchesRes?.data || branchesRes || []));
      
      // Fetch suppliers and warehouses
      try {
        const userData = getUserData();
        const businessId = userData?.business_id || 1;
        
        const [suppliersRes, warehousesRes] = await Promise.all([
          getSuppliers({ business_id: businessId, active: true }),
          getWarehouses({ business_id: businessId, active: true })
        ]);
        
        setSuppliers(Array.isArray(suppliersRes) ? suppliersRes : (suppliersRes?.data || []));
        setWarehouses(Array.isArray(warehousesRes) ? warehousesRes : (warehousesRes?.data || []));
      } catch (err) {
        console.error('Error fetching suppliers/warehouses:', err);
        // Fallback to empty arrays
        setSuppliers([]);
        setWarehouses([]);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showError('Failed to load form data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      product_id: '',
      variant_id: null,
      quantity: '',
      unit_cost: '',
      product_name: ''
    }]);
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        if (field === 'product_id') {
          const product = products.find(p => p.id === parseInt(value));
          return {
            ...item,
            [field]: value,
            product_name: product ? product.name : '',
            unit_cost: product ? (product.cost_price || 0) : item.unit_cost
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.supplier_id) newErrors.supplier_id = 'Supplier is required';
    if (!formData.warehouse_id) newErrors.warehouse_id = 'Warehouse is required';
    if (!formData.order_date) newErrors.order_date = 'Order date is required';
    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    
    items.forEach((item, index) => {
      if (!item.product_id) {
        newErrors[`item_${index}_product`] = 'Product is required';
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = 'Valid quantity is required';
      }
      if (!item.unit_cost || parseFloat(item.unit_cost) <= 0) {
        newErrors[`item_${index}_unit_cost`] = 'Valid unit cost is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.unit_cost || 0));
    }, 0);
    const vat = subtotal * 0.18; // 18% VAT
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      showError('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const userData = getUserData();
      const businessId = userData?.business_id || 1;

      const orderData = {
        business_id: businessId,
        supplier_id: parseInt(formData.supplier_id),
        warehouse_id: parseInt(formData.warehouse_id),
        order_date: formData.order_date,
        expected_date: formData.expected_date || null,
        notes: formData.notes || '',
        items: items.map(item => ({
          product_id: parseInt(item.product_id),
          variant_id: item.variant_id ? parseInt(item.variant_id) : null,
          quantity: parseFloat(item.quantity),
          unit_cost: parseFloat(item.unit_cost)
        }))
      };

      await createPurchaseOrder(orderData);
      showSuccess('Purchase order created successfully');
      navigate('/dashboard/manager/purchase-order-approval');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      showError(error.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const { subtotal, vat, total } = calculateTotals();

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-3xl'>Create Purchase Order</h2>
        <button
          onClick={() => navigate('/dashboard/manager/purchase-order-approval')}
          className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
        >
          <MdClose size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className='bg-white p-6 rounded shadow'>
        <div className='grid grid-cols-2 gap-6 mb-6'>
          {/* Supplier */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Supplier <span className='text-red-500'>*</span>
            </label>
            <select
              name='supplier_id'
              value={formData.supplier_id}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.supplier_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value=''>Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {errors.supplier_id && (
              <p className='text-red-500 text-xs mt-1'>{errors.supplier_id}</p>
            )}
          </div>

          {/* Warehouse */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Warehouse <span className='text-red-500'>*</span>
            </label>
            <select
              name='warehouse_id'
              value={formData.warehouse_id}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.warehouse_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value=''>Select Warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
            {errors.warehouse_id && (
              <p className='text-red-500 text-xs mt-1'>{errors.warehouse_id}</p>
            )}
          </div>

          {/* Order Date */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Order Date <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              name='order_date'
              value={formData.order_date}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.order_date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.order_date && (
              <p className='text-red-500 text-xs mt-1'>{errors.order_date}</p>
            )}
          </div>

          {/* Expected Date */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Expected Delivery Date
            </label>
            <input
              type='date'
              name='expected_date'
              value={formData.expected_date}
              onChange={handleChange}
              className='w-full p-3 border border-gray-300 rounded'
            />
          </div>

          {/* Notes */}
          <div className='col-span-2'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Notes / Justification
            </label>
            <textarea
              name='notes'
              value={formData.notes}
              onChange={handleChange}
              placeholder='Enter justification for this purchase order...'
              rows='3'
              className='w-full p-3 border border-gray-300 rounded'
            />
          </div>
        </div>

        {/* Items Section */}
        <div className='border-t pt-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-bold text-lg'>Items</h3>
            <button
              type='button'
              onClick={addItem}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2'
            >
              <MdAdd size={20} /> Add Item
            </button>
          </div>

          {errors.items && (
            <p className='text-red-500 text-xs mb-2'>{errors.items}</p>
          )}

          {items.length === 0 ? (
            <p className='text-gray-500 text-center py-8'>No items added. Click "Add Item" to start.</p>
          ) : (
            <div className='space-y-4'>
              {items.map((item, index) => (
                <div key={index} className='border border-gray-300 rounded p-4 bg-gray-50'>
                  <div className='grid grid-cols-5 gap-4'>
                    <div className='col-span-2'>
                      <label className='block text-xs font-semibold text-gray-700 mb-1'>
                        Product <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        placeholder='Search product...'
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        className='w-full p-2 border border-gray-300 rounded text-sm mb-2'
                      />
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value=''>Select Product</option>
                        {filteredProducts.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} {product.sku ? `(${product.sku})` : ''}
                          </option>
                        ))}
                      </select>
                      {errors[`item_${index}_product`] && (
                        <p className='text-red-500 text-xs mt-1'>{errors[`item_${index}_product`]}</p>
                      )}
                    </div>

                    <div>
                      <label className='block text-xs font-semibold text-gray-700 mb-1'>
                        Quantity <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='number'
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        placeholder='0'
                        step='0.001'
                        min='0.001'
                        className={`w-full p-2 border rounded text-sm ${errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors[`item_${index}_quantity`] && (
                        <p className='text-red-500 text-xs mt-1'>{errors[`item_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div>
                      <label className='block text-xs font-semibold text-gray-700 mb-1'>
                        Unit Cost (RWF) <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='number'
                        value={item.unit_cost}
                        onChange={(e) => updateItem(index, 'unit_cost', e.target.value)}
                        placeholder='0.00'
                        step='0.01'
                        min='0'
                        className={`w-full p-2 border rounded text-sm ${errors[`item_${index}_unit_cost`] ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors[`item_${index}_unit_cost`] && (
                        <p className='text-red-500 text-xs mt-1'>{errors[`item_${index}_unit_cost`]}</p>
                      )}
                    </div>

                    <div className='flex items-end'>
                      <button
                        type='button'
                        onClick={() => removeItem(index)}
                        className='w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-1'
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>

                  {item.product_id && (
                    <div className='mt-2 text-xs text-gray-600'>
                      <span className='font-semibold'>Line Total: </span>
                      RWF {((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <div className='mt-6 border-t pt-4'>
              <div className='flex justify-end'>
                <div className='w-64 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Subtotal:</span>
                    <span className='font-semibold'>{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RWF</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>VAT (18%):</span>
                    <span className='font-semibold'>{vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RWF</span>
                  </div>
                  <div className='flex justify-between text-lg font-bold border-t pt-2'>
                    <span>Total:</span>
                    <span>{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RWF</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-4 mt-6 pt-6 border-t'>
          <button
            type='button'
            onClick={() => navigate('/dashboard/manager/purchase-order-approval')}
            className='px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={loading || items.length === 0}
            className='px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
