import React, { useState, useEffect } from 'react';
import { BsClockHistory, BsCalendar3 } from 'react-icons/bs';
import { FaMoneyBillWave, FaStore, FaPlus, FaTrash } from 'react-icons/fa';
import { MdWarning, MdCheckCircle } from 'react-icons/md';
import { BiChevronDown } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { openBusinessDay, getBusinessDayHistory } from '../../services/businessDay';
import { getBranches } from '../../services/branches';
import { showSuccess, showError, handleApiError } from '../../utils/toast';

export default function OpenBusinessDay() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    branch_id: '',
    opening_float: '',
    notes: '',
    distribute_floats: false
  });

  const [cashierFloats, setCashierFloats] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastBusinessDay, setLastBusinessDay] = useState(null);

  // Load branches and last business day on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load branches
        const branchesData = await getBranches({ active: true });
        setBranches(branchesData || []);
        
        // Load last business day if branch is selected
        if (branchesData && branchesData.length > 0) {
          const branchId = branchesData[0].id;
          try {
            const history = await getBusinessDayHistory({ branch_id: branchId, limit: 1 });
            if (history && history.data && history.data.length > 0) {
              const lastDay = history.data[0];
              setLastBusinessDay({
                date: new Date(lastDay.business_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                closing_float: lastDay.actual_closing_cash || 0,
                total_sales: 0, // Would need to calculate from sales
                variance: lastDay.variance || 0
              });
            }
          } catch (err) {
            console.error('Error loading last business day:', err);
            // Don't show error toast for this as it's not critical
          }
        }

        // Load available cashiers (employees with cashier role)
        // Note: This would require an employees API endpoint
        // For now, set empty array - cashiers can be added manually or fetched when needed
        setAvailableCashiers([]);
      } catch (error) {
        console.error('Error loading data:', error);
        handleApiError(error, 'Failed to load branches. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const [availableCashiers, setAvailableCashiers] = useState([]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addCashierFloat = () => {
    setCashierFloats([...cashierFloats, {
      id: Date.now(),
      cashier_id: '',
      register: '',
      float_amount: ''
    }]);
  };

  const removeCashierFloat = (id) => {
    setCashierFloats(cashierFloats.filter(cf => cf.id !== id));
  };

  const updateCashierFloat = (id, field, value) => {
    setCashierFloats(cashierFloats.map(cf => 
      cf.id === id ? { ...cf, [field]: value } : cf
    ));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.branch_id) {
      newErrors.branch_id = 'Please select a branch';
    }

    if (!formData.opening_float) {
      newErrors.opening_float = 'Opening float is required';
    } else if (isNaN(formData.opening_float) || parseFloat(formData.opening_float) <= 0) {
      newErrors.opening_float = 'Please enter a valid amount';
    } else if (parseFloat(formData.opening_float) < 100000) {
      newErrors.opening_float = 'Opening float should be at least 100,000 RWF';
    }

    if (formData.distribute_floats && cashierFloats.length > 0) {
      const totalDistributed = cashierFloats.reduce((sum, cf) => 
        sum + (parseFloat(cf.float_amount) || 0), 0
      );
      
      if (totalDistributed > parseFloat(formData.opening_float)) {
        newErrors.cashier_floats = `Total distributed (${totalDistributed.toLocaleString()}) exceeds opening float`;
      }

      cashierFloats.forEach(cf => {
        if (!cf.cashier_id) {
          newErrors.cashier_floats = 'Please select cashier for all float distributions';
        }
        if (!cf.float_amount || parseFloat(cf.float_amount) <= 0) {
          newErrors.cashier_floats = 'Please enter valid float amounts';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const confirmOpenDay = async () => {
    setIsSubmitting(true);
    
    try {
      const businessDayData = {
        branch_id: parseInt(formData.branch_id),
        opening_float: parseFloat(formData.opening_float),
        notes: formData.notes || null
      };

      const result = await openBusinessDay(businessDayData);
      
      // Note: Cashier float distribution would be handled separately via cash session API
      // For now, we just open the business day
      
      showSuccess('Business day opened successfully!');
      // Navigate back to dashboard
      setTimeout(() => {
        navigate('/dashboard/manager');
      }, 1500);
      
    } catch (error) {
      handleApiError(error, 'Failed to open business day. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `RWF ${amount.toLocaleString()}`;
  };

  const getTotalDistributed = () => {
    return cashierFloats.reduce((sum, cf) => sum + (parseFloat(cf.float_amount) || 0), 0);
  };

  const getRemaining = () => {
    return parseFloat(formData.opening_float || 0) - getTotalDistributed();
  };

  if (showConfirmation) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white border-2 border-orange-400 rounded shadow-lg'>
            <div className='bg-orange-50 p-6 border-b-2 border-orange-200'>
              <div className='flex items-center gap-3 mb-2'>
                <MdWarning className='text-orange-500' size={32} />
                <h2 className='font-bold text-2xl'>Confirm Open Business Day</h2>
              </div>
              <p className='text-sm text-gray-600'>Please review the details before opening the business day</p>
            </div>

            <div className='p-6 space-y-4'>
              <div className='bg-blue-50 p-4 rounded border border-blue-200'>
                <p className='text-xs text-gray-600 mb-1'>Date & Time</p>
                <p className='font-bold text-sm'>{getCurrentDateTime()}</p>
              </div>

              <div className='bg-gray-100 p-4 rounded'>
                <p className='text-xs text-gray-600 mb-1'>Branch</p>
                <p className='font-bold text-sm'>
                  {branches.find(b => b.id === parseInt(formData.branch_id))?.name}
                </p>
              </div>

              <div className='bg-green-50 p-4 rounded border border-green-200'>
                <p className='text-xs text-gray-600 mb-1'>Opening Float</p>
                <p className='font-bold text-2xl text-green-700'>
                  {formatCurrency(parseFloat(formData.opening_float))}
                </p>
              </div>

              {formData.distribute_floats && cashierFloats.length > 0 && (
                <div className='bg-purple-50 p-4 rounded border border-purple-200'>
                  <p className='text-xs font-semibold text-gray-700 mb-3 uppercase'>Float Distribution</p>
                  <div className='space-y-2'>
                    {cashierFloats.map(cf => {
                      const cashier = availableCashiers.find(c => c.id === parseInt(cf.cashier_id));
                      return (
                        <div key={cf.id} className='flex justify-between text-sm bg-white p-2 rounded'>
                          <span>{cashier?.name} ({cf.register})</span>
                          <span className='font-bold'>{formatCurrency(parseFloat(cf.float_amount))}</span>
                        </div>
                      );
                    })}
                    <div className='border-t-2 border-purple-300 pt-2 flex justify-between font-bold'>
                      <span>Total Distributed:</span>
                      <span>{formatCurrency(getTotalDistributed())}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Remaining in Safe:</span>
                      <span className='font-semibold'>{formatCurrency(getRemaining())}</span>
                    </div>
                  </div>
                </div>
              )}

              {formData.notes && (
                <div className='bg-gray-100 p-4 rounded'>
                  <p className='text-xs text-gray-600 mb-1'>Notes</p>
                  <p className='text-sm'>{formData.notes}</p>
                </div>
              )}

              <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4'>
                <p className='text-xs font-semibold mb-2 flex items-center gap-2'>
                  <MdWarning className='text-yellow-600' />
                  Important Reminders
                </p>
                <ul className='text-xs text-gray-700 space-y-1 list-disc list-inside'>
                  <li>Ensure all cashiers are ready to open their sessions</li>
                  <li>Verify the opening float amount is correct</li>
                  {formData.distribute_floats && <li>Cashiers must confirm receiving their floats</li>}
                  <li>This action cannot be undone</li>
                  <li>All sales will be tracked from this point</li>
                </ul>
              </div>
            </div>

            <div className='p-6 bg-gray-50 flex gap-3'>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded font-bold text-sm uppercase disabled:opacity-50'
              >
                Go Back
              </button>
              <button
                onClick={confirmOpenDay}
                disabled={isSubmitting}
                className='flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded font-bold text-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {isSubmitting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Opening...
                  </>
                ) : (
                  <>
                    <MdCheckCircle size={20} />
                    Confirm & Open Day
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-6'>
          <h2 className='font-bold text-3xl mb-2'>Open Business Day</h2>
          <p className='text-sm text-gray-600'>Initialize the business day and set opening float</p>
        </div>

        <div className='grid grid-cols-3 gap-6'>
          {/* Main Form - Left Side */}
          <div className='col-span-2'>
            <div className='bg-white border border-gray-300 rounded shadow'>
              <div className='p-4 bg-gray-100 border-b border-gray-300'>
                <h3 className='font-bold text-lg flex items-center gap-2'>
                  <BsClockHistory className='text-blue-600' />
                  Business Day Information
                </h3>
              </div>

              <div className='p-6 space-y-6'>
                {/* Current Date/Time Display */}
                <div className='bg-blue-50 p-4 rounded border border-blue-200'>
                  <div className='flex items-center gap-3 mb-2'>
                    <BsCalendar3 className='text-blue-600' size={20} />
                    <span className='text-xs font-semibold text-gray-600 uppercase'>Opening Date & Time</span>
                  </div>
                  <p className='font-bold text-lg'>{getCurrentDateTime()}</p>
                </div>

                {/* Branch Selection */}
                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                    Select Branch *
                  </label>
                  <div className='relative'>
                    <select
                      name='branch_id'
                      value={formData.branch_id}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${errors.branch_id ? 'border-red-500' : 'border-gray-300'} rounded text-sm appearance-none bg-white`}
                    >
                      <option value=''>-- Choose Branch --</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} {branch.code ? `(${branch.code})` : ''}
                        </option>
                      ))}
                    </select>
                    <BiChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                  </div>
                  {errors.branch_id && (
                    <p className='text-xs text-red-500 mt-1'>{errors.branch_id}</p>
                  )}
                </div>

                {/* Opening Float */}
                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                    Opening Float Amount (RWF) *
                  </label>
                  <div className='relative'>
                    <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                      <FaMoneyBillWave className='text-green-600' size={20} />
                    </div>
                    <input
                      type='text'
                      name='opening_float'
                      value={formData.opening_float}
                      onChange={handleInputChange}
                      placeholder='500000'
                      className={`w-full p-3 pl-12 border ${errors.opening_float ? 'border-red-500' : 'border-gray-300'} rounded text-sm`}
                    />
                  </div>
                  {errors.opening_float && (
                    <p className='text-xs text-red-500 mt-1'>{errors.opening_float}</p>
                  )}
                  <p className='text-xs text-gray-500 mt-1'>
                    Recommended: 500,000 - 1,000,000 RWF
                  </p>
                </div>

                {/* Distribute Floats Option */}
                <div className='bg-purple-50 border border-purple-200 rounded p-4'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      name='distribute_floats'
                      checked={formData.distribute_floats}
                      onChange={handleInputChange}
                      className='w-4 h-4'
                    />
                    <span className='text-sm font-semibold text-gray-700'>
                      Distribute floats to cashiers now (Optional)
                    </span>
                  </label>
                  <p className='text-xs text-gray-600 mt-2'>
                    You can give floats to specific cashiers during business day opening, or they can take floats later from the safe/drawer.
                  </p>
                </div>

                {/* Cashier Float Distribution */}
                {formData.distribute_floats && (
                  <div className='bg-gray-50 border border-gray-300 rounded p-4 space-y-4'>
                    <div className='flex justify-between items-center'>
                      <h4 className='font-bold text-sm uppercase text-gray-700'>Float Distribution</h4>
                      <button
                        onClick={addCashierFloat}
                        className='bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1'
                      >
                        <FaPlus size={12} /> Add Cashier
                      </button>
                    </div>

                    {cashierFloats.length === 0 ? (
                      <p className='text-sm text-gray-500 text-center py-4'>
                        Click "Add Cashier" to distribute floats
                      </p>
                    ) : (
                      <div className='space-y-3'>
                        {cashierFloats.map((cf, index) => (
                          <div key={cf.id} className='bg-white border border-gray-300 rounded p-3'>
                            <div className='flex gap-2 items-start'>
                              <div className='flex-1 grid grid-cols-2 gap-2'>
                                <div>
                                  <label className='block text-xs font-semibold text-gray-700 mb-1'>Cashier</label>
                                  <select
                                    value={cf.cashier_id}
                                    onChange={(e) => {
                                      const cashier = availableCashiers.find(c => c.id === parseInt(e.target.value));
                                      updateCashierFloat(cf.id, 'cashier_id', e.target.value);
                                      if (cashier) updateCashierFloat(cf.id, 'register', cashier.register);
                                    }}
                                    className='w-full p-2 border border-gray-300 rounded text-xs'
                                  >
                                    <option value=''>Select...</option>
                                    {availableCashiers.map(cashier => (
                                      <option key={cashier.id} value={cashier.id}>
                                        {cashier.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className='block text-xs font-semibold text-gray-700 mb-1'>Register</label>
                                  <input
                                    type='text'
                                    value={cf.register}
                                    disabled
                                    className='w-full p-2 border border-gray-300 rounded text-xs bg-gray-100'
                                  />
                                </div>
                                <div className='col-span-2'>
                                  <label className='block text-xs font-semibold text-gray-700 mb-1'>Float Amount</label>
                                  <input
                                    type='text'
                                    value={cf.float_amount}
                                    onChange={(e) => updateCashierFloat(cf.id, 'float_amount', e.target.value)}
                                    placeholder='200000'
                                    className='w-full p-2 border border-gray-300 rounded text-xs'
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => removeCashierFloat(cf.id)}
                                className='bg-red-500 hover:bg-red-600 text-white p-2 rounded mt-5'
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className='bg-purple-100 p-3 rounded'>
                          <div className='grid grid-cols-3 gap-4 text-sm'>
                            <div>
                              <p className='text-xs text-gray-600 mb-1'>Opening Float</p>
                              <p className='font-bold'>{formatCurrency(parseFloat(formData.opening_float || 0))}</p>
                            </div>
                            <div>
                              <p className='text-xs text-gray-600 mb-1'>Distributed</p>
                              <p className='font-bold text-purple-700'>{formatCurrency(getTotalDistributed())}</p>
                            </div>
                            <div>
                              <p className='text-xs text-gray-600 mb-1'>Remaining</p>
                              <p className={`font-bold ${getRemaining() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(getRemaining())}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {errors.cashier_floats && (
                      <p className='text-xs text-red-500'>{errors.cashier_floats}</p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                    Notes (Optional)
                  </label>
                  <textarea
                    name='notes'
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder='Any special notes for today...'
                    rows='3'
                    className='w-full p-3 border border-gray-300 rounded text-sm'
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded font-bold text-sm uppercase flex items-center justify-center gap-2'
                >
                  <BsClockHistory size={20} />
                  Open Business Day
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Info Cards */}
          <div className='col-span-1 space-y-6'>
            {/* Last Business Day Info */}
            {lastBusinessDay && (
              <div className='bg-white border border-gray-300 rounded shadow'>
                <div className='p-3 bg-gray-100 border-b border-gray-300'>
                  <h3 className='font-bold text-xs uppercase'>Last Business Day</h3>
                </div>
                <div className='p-4 space-y-3'>
                  <div>
                    <p className='text-xs text-gray-600 mb-1'>Date</p>
                    <p className='text-xs font-semibold'>{lastBusinessDay.date}</p>
                  </div>
                  <div className='border-t border-gray-200 pt-3'>
                    <p className='text-xs text-gray-600 mb-1'>Closing Float</p>
                    <p className='text-sm font-bold text-green-600'>
                      {formatCurrency(lastBusinessDay.closing_float)}
                    </p>
                  </div>
                  <div className='border-t border-gray-200 pt-3'>
                    <p className='text-xs text-gray-600 mb-1'>Total Sales</p>
                    <p className='text-sm font-bold'>
                      {formatCurrency(lastBusinessDay.total_sales)}
                    </p>
                  </div>
                  <div className='border-t border-gray-200 pt-3'>
                    <p className='text-xs text-gray-600 mb-1'>Variance</p>
                    <p className={`text-sm font-bold ${lastBusinessDay.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {lastBusinessDay.variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(lastBusinessDay.variance))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Card */}
            <div className='bg-blue-50 border border-blue-300 rounded shadow'>
              <div className='p-3 bg-blue-100 border-b border-blue-300'>
                <h3 className='font-bold text-xs uppercase text-blue-800'>💡 Tips</h3>
              </div>
              <div className='p-4'>
                <ul className='text-xs text-gray-700 space-y-2'>
                  <li className='flex gap-2'>
                    <span className='text-blue-600'>•</span>
                    <span>Count float carefully before opening</span>
                  </li>
                  <li className='flex gap-2'>
                    <span className='text-blue-600'>•</span>
                    <span>Cashiers will confirm receiving floats</span>
                  </li>
                  <li className='flex gap-2'>
                    <span className='text-blue-600'>•</span>
                    <span>You can distribute floats now or later</span>
                  </li>
                  <li className='flex gap-2'>
                    <span className='text-blue-600'>•</span>
                    <span>Review yesterday's variance</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* What Happens Next */}
            <div className='bg-green-50 border border-green-300 rounded shadow'>
              <div className='p-3 bg-green-100 border-b border-green-300'>
                <h3 className='font-bold text-xs uppercase text-green-800'>What Happens Next</h3>
              </div>
              <div className='p-4'>
                <ul className='text-xs text-gray-700 space-y-2'>
                  <li className='flex items-start gap-2'>
                    <MdCheckCircle className='text-green-600 mt-0.5' size={14} />
                    <span>Business day record created</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <MdCheckCircle className='text-green-600 mt-0.5' size={14} />
                    <span>Opening float recorded in cashbook</span>
                  </li>
                  {formData.distribute_floats && (
                    <li className='flex items-start gap-2'>
                      <MdCheckCircle className='text-green-600 mt-0.5' size={14} />
                      <span>Cashiers notified to confirm floats</span>
                    </li>
                  )}
                  <li className='flex items-start gap-2'>
                    <MdCheckCircle className='text-green-600 mt-0.5' size={14} />
                    <span>All sales tracking begins</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}