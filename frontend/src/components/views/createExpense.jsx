import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdAttachFile } from 'react-icons/md';
import { createExpense, getExpenseCategories } from '../../services/expenses';
import { getBranches } from '../../services/branches';
import { showSuccess, showError } from '../../utils/toast';
import { getUserData } from '../../config/api';

export default function CreateExpense() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    branch_id: '',
    category_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    amount: '',
    vat_amount: '',
    payment_method: 'CASH',
    payee: '',
    description: '',
    receipt: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, branchesRes] = await Promise.all([
        getExpenseCategories(),
        getBranches()
      ]);
      
      setCategories(categoriesRes.data || categoriesRes || []);
      setBranches(branchesRes.data || branchesRes || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showError('Failed to load form data');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'receipt') {
      setFormData(prev => ({ ...prev, receipt: files[0] || null }));
    } else if (name === 'amount') {
      const amount = parseFloat(value) || 0;
      const vatRate = 0.18; // 18% VAT
      const vatAmount = amount * vatRate;
      setFormData(prev => ({
        ...prev,
        amount: value,
        vat_amount: vatAmount.toFixed(2)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.branch_id) newErrors.branch_id = 'Branch is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.expense_date) newErrors.expense_date = 'Date is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.payee.trim()) newErrors.payee = 'Payee is required';
    if (!formData.payment_method) newErrors.payment_method = 'Payment method is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      const expenseData = new FormData();
      expenseData.append('business_id', businessId);
      expenseData.append('branch_id', formData.branch_id);
      expenseData.append('category_id', formData.category_id);
      expenseData.append('expense_date', formData.expense_date);
      expenseData.append('amount', formData.amount);
      expenseData.append('vat_amount', formData.vat_amount || 0);
      expenseData.append('payment_method', formData.payment_method);
      expenseData.append('payee', formData.payee);
      expenseData.append('description', formData.description || '');
      
      if (formData.receipt) {
        expenseData.append('receipt', formData.receipt);
      }

      await createExpense(expenseData);
      showSuccess('Expense created successfully');
      navigate('/dashboard/manager/expense-approval');
    } catch (error) {
      console.error('Error creating expense:', error);
      showError(error.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = (parseFloat(formData.amount) || 0) + (parseFloat(formData.vat_amount) || 0);

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-3xl'>Create Expense</h2>
        <button
          onClick={() => navigate('/dashboard/manager/expense-approval')}
          className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
        >
          <MdClose size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className='bg-white p-6 rounded shadow'>
        <div className='grid grid-cols-2 gap-6'>
          {/* Branch */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Branch <span className='text-red-500'>*</span>
            </label>
            <select
              name='branch_id'
              value={formData.branch_id}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.branch_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value=''>Select Branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {errors.branch_id && (
              <p className='text-red-500 text-xs mt-1'>{errors.branch_id}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Category <span className='text-red-500'>*</span>
            </label>
            <select
              name='category_id'
              value={formData.category_id}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.category_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value=''>Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className='text-red-500 text-xs mt-1'>{errors.category_id}</p>
            )}
          </div>

          {/* Expense Date */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Expense Date <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              name='expense_date'
              value={formData.expense_date}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.expense_date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.expense_date && (
              <p className='text-red-500 text-xs mt-1'>{errors.expense_date}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Payment Method <span className='text-red-500'>*</span>
            </label>
            <select
              name='payment_method'
              value={formData.payment_method}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.payment_method ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value='CASH'>Cash</option>
              <option value='BANK_TRANSFER'>Bank Transfer</option>
              <option value='CARD'>Card</option>
              <option value='MOMO'>Mobile Money</option>
            </select>
            {errors.payment_method && (
              <p className='text-red-500 text-xs mt-1'>{errors.payment_method}</p>
            )}
          </div>

          {/* Payee */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Payee <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='payee'
              value={formData.payee}
              onChange={handleChange}
              placeholder='Enter payee name'
              className={`w-full p-3 border rounded ${errors.payee ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.payee && (
              <p className='text-red-500 text-xs mt-1'>{errors.payee}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Amount (RWF) <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              name='amount'
              value={formData.amount}
              onChange={handleChange}
              placeholder='0.00'
              step='0.01'
              min='0'
              className={`w-full p-3 border rounded ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.amount && (
              <p className='text-red-500 text-xs mt-1'>{errors.amount}</p>
            )}
          </div>

          {/* VAT Amount */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              VAT Amount (RWF)
            </label>
            <input
              type='number'
              name='vat_amount'
              value={formData.vat_amount}
              onChange={handleChange}
              placeholder='0.00'
              step='0.01'
              min='0'
              className='w-full p-3 border border-gray-300 rounded'
              readOnly
            />
            <p className='text-xs text-gray-500 mt-1'>Auto-calculated at 18%</p>
          </div>

          {/* Total Amount */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Total Amount (RWF)
            </label>
            <input
              type='text'
              value={totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              className='w-full p-3 border border-gray-300 rounded bg-gray-100'
              readOnly
            />
          </div>

          {/* Description */}
          <div className='col-span-2'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Description
            </label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='Enter expense description'
              rows='4'
              className='w-full p-3 border border-gray-300 rounded'
            />
          </div>

          {/* Receipt Upload */}
          <div className='col-span-2'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Receipt (Optional)
            </label>
            <div className='flex items-center gap-4'>
              <label className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50'>
                <MdAttachFile size={20} />
                <span>Choose File</span>
                <input
                  type='file'
                  name='receipt'
                  onChange={handleChange}
                  accept='image/*,.pdf'
                  className='hidden'
                />
              </label>
              {formData.receipt && (
                <span className='text-sm text-gray-600'>{formData.receipt.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-4 mt-6 pt-6 border-t'>
          <button
            type='button'
            onClick={() => navigate('/dashboard/manager/expense-approval')}
            className='px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={loading}
            className='px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Creating...' : 'Create Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
