import React, { useState } from 'react';
import { BiSave } from 'react-icons/bi';
import { FaCog, FaUser, FaBell, FaShieldAlt, FaStore, FaMoneyBillWave } from 'react-icons/fa';
import { MdCheckCircle, MdClose } from 'react-icons/md';

export default function ManagerSettings() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [personalSettings, setPersonalSettings] = useState({
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+250 788 123 456',
    role: 'Manager',
    branch: 'Downtown Store',
    language: 'English',
    timezone: 'Africa/Kigali'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    varianceAlerts: true,
    lowStockAlerts: true,
    overdueInvoiceAlerts: true,
    dailyReports: true,
    weeklyReports: true
  });

  const [businessRules, setBusinessRules] = useState({
    varianceThreshold: 5000,
    autoApproveFloatUnder: 50000,
    maxCreditLimit: 5000000,
    defaultCreditTerm: 30,
    reorderPointDefault: 20,
    lowStockThreshold: 10,
    overdueInvoiceDays: 30
  });

  const [systemPreferences, setSystemPreferences] = useState({
    defaultDashboardView: 'overview',
    showRealtimeUpdates: true,
    compactMode: false,
    darkMode: false,
    autoRefreshInterval: 30,
    dateFormat: 'DD/MM/YYYY',
    currencyDisplay: 'symbol'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    requirePasswordChange: 90,
    allowMultipleSessions: true
  });

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Manager Settings</h2>
          <p className='text-sm text-gray-600 mt-1'>Customize your experience and business rules</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold text-sm flex items-center gap-2 disabled:opacity-50'
        >
          {isSubmitting ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              Saving...
            </>
          ) : (
            <>
              <BiSave size={18} />
              Save All Changes
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className='bg-green-50 border-2 border-green-500 rounded p-4 flex items-center gap-3'>
          <MdCheckCircle className='text-green-600' size={24} />
          <div>
            <p className='font-bold text-green-800'>Settings Saved Successfully!</p>
            <p className='text-sm text-green-700'>Your changes have been applied.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className='flex gap-2 flex-wrap'>
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded text-xs font-semibold uppercase flex items-center gap-2 ${
            activeTab === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaUser size={14} /> Personal Info
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded text-xs font-semibold uppercase flex items-center gap-2 ${
            activeTab === 'notifications' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaBell size={14} /> Notifications
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`px-4 py-2 rounded text-xs font-semibold uppercase flex items-center gap-2 ${
            activeTab === 'business' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaMoneyBillWave size={14} /> Business Rules
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded text-xs font-semibold uppercase flex items-center gap-2 ${
            activeTab === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaCog size={14} /> System
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded text-xs font-semibold uppercase flex items-center gap-2 ${
            activeTab === 'security' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaShieldAlt size={14} /> Security
        </button>
      </div>

      <hr className='text-gray-400' />

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>Personal Information</h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Full Name</label>
                <input
                  type='text'
                  value={personalSettings.name}
                  onChange={(e) => setPersonalSettings({...personalSettings, name: e.target.value})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Email Address</label>
                <input
                  type='email'
                  value={personalSettings.email}
                  onChange={(e) => setPersonalSettings({...personalSettings, email: e.target.value})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Phone Number</label>
                <input
                  type='tel'
                  value={personalSettings.phone}
                  onChange={(e) => setPersonalSettings({...personalSettings, phone: e.target.value})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Role</label>
                <input
                  type='text'
                  value={personalSettings.role}
                  disabled
                  className='w-full p-3 border border-gray-300 rounded text-sm bg-gray-100'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Branch</label>
                <select
                  value={personalSettings.branch}
                  onChange={(e) => setPersonalSettings({...personalSettings, branch: e.target.value})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option>Downtown Store</option>
                  <option>Uptown Branch</option>
                  <option>Mall Outlet</option>
                  <option>Airport Store</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Language</label>
                <select
                  value={personalSettings.language}
                  onChange={(e) => setPersonalSettings({...personalSettings, language: e.target.value})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Kinyarwanda</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>Timezone</label>
                <select
                  value={personalSettings.timezone}
                  onChange={(e) => setPersonalSettings({...personalSettings, timezone: e.target.value})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option>Africa/Kigali</option>
                  <option>Africa/Nairobi</option>
                  <option>Africa/Kampala</option>
                </select>
              </div>
            </div>

            <div className='mt-6 pt-6 border-t border-gray-200'>
              <button className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-semibold'>
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>Notification Preferences</h3>
          </div>
          <div className='p-6 space-y-6'>
            <div>
              <p className='font-bold text-sm uppercase text-gray-700 mb-3'>Notification Channels</p>
              <div className='space-y-3'>
                <label className='flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                    className='w-5 h-5'
                  />
                  <div className='flex-1'>
                    <p className='font-semibold text-sm'>Email Notifications</p>
                    <p className='text-xs text-gray-600'>Receive notifications via email</p>
                  </div>
                </label>

                <label className='flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                    className='w-5 h-5'
                  />
                  <div className='flex-1'>
                    <p className='font-semibold text-sm'>SMS Notifications</p>
                    <p className='text-xs text-gray-600'>Receive notifications via SMS</p>
                  </div>
                </label>

                <label className='flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                    className='w-5 h-5'
                  />
                  <div className='flex-1'>
                    <p className='font-semibold text-sm'>Push Notifications</p>
                    <p className='text-xs text-gray-600'>Receive in-app push notifications</p>
                  </div>
                </label>
              </div>
            </div>

            <div className='border-t border-gray-200 pt-6'>
              <p className='font-bold text-sm uppercase text-gray-700 mb-3'>Alert Types</p>
              <div className='grid grid-cols-2 gap-3'>
                <label className='flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={notificationSettings.varianceAlerts}
                    onChange={(e) => setNotificationSettings({...notificationSettings, varianceAlerts: e.target.checked})}
                    className='w-4 h-4'
                  />
                  <span className='text-sm'>Cash Variance Alerts</span>
                </label>

                <label className='flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={notificationSettings.lowStockAlerts}
                    onChange={(e) => setNotificationSettings({...notificationSettings, lowStockAlerts: e.target.checked})}
                    className='w-4 h-4'
                  />
                  <span className='text-sm'>Low Stock Alerts</span>
                </label>

                <label className='flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={notificationSettings.overdueInvoiceAlerts}
                    onChange={(e) => setNotificationSettings({...notificationSettings, overdueInvoiceAlerts: e.target.checked})}
                    className='w-4 h-4'
                  />
                  <span className='text-sm'>Overdue Invoice Alerts</span>
                </label>

                <label className='flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={notificationSettings.dailyReports}
                    onChange={(e) => setNotificationSettings({...notificationSettings, dailyReports: e.target.checked})}
                    className='w-4 h-4'
                  />
                  <span className='text-sm'>Daily Reports</span>
                </label>

                <label className='flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={notificationSettings.weeklyReports}
                    onChange={(e) => setNotificationSettings({...notificationSettings, weeklyReports: e.target.checked})}
                    className='w-4 h-4'
                  />
                  <span className='text-sm'>Weekly Reports</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Rules Tab */}
      {activeTab === 'business' && (
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>Business Rules & Thresholds</h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Variance Alert Threshold (RWF)
                </label>
                <input
                  type='number'
                  value={businessRules.varianceThreshold}
                  onChange={(e) => setBusinessRules({...businessRules, varianceThreshold: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
                <p className='text-xs text-gray-600 mt-1'>Alert when cash variance exceeds this amount</p>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Auto-Approve Float Under (RWF)
                </label>
                <input
                  type='number'
                  value={businessRules.autoApproveFloatUnder}
                  onChange={(e) => setBusinessRules({...businessRules, autoApproveFloatUnder: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
                <p className='text-xs text-gray-600 mt-1'>Automatically approve floats below this amount</p>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Maximum Credit Limit (RWF)
                </label>
                <input
                  type='number'
                  value={businessRules.maxCreditLimit}
                  onChange={(e) => setBusinessRules({...businessRules, maxCreditLimit: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
                <p className='text-xs text-gray-600 mt-1'>Maximum credit allowed for customers</p>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Default Credit Term (Days)
                </label>
                <input
                  type='number'
                  value={businessRules.defaultCreditTerm}
                  onChange={(e) => setBusinessRules({...businessRules, defaultCreditTerm: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
                <p className='text-xs text-gray-600 mt-1'>Default payment term for credit sales</p>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Reorder Point Default (Units)
                </label>
                <input
                  type='number'
                  value={businessRules.reorderPointDefault}
                  onChange={(e) => setBusinessRules({...businessRules, reorderPointDefault: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
                <p className='text-xs text-gray-600 mt-1'>Default reorder point for new items</p>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Low Stock Threshold (Units)
                </label>
                <input
                  type='number'
                  value={businessRules.lowStockThreshold}
                  onChange={(e) => setBusinessRules({...businessRules, lowStockThreshold: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
                <p className='text-xs text-gray-600 mt-1'>Alert when stock falls below this level</p>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Overdue Invoice Alert (Days)
                </label>
                <input
                  type='number'
                  value={businessRules.overdueInvoiceDays}
                  onChange={(e) => setBusinessRules({...businessRules, overdueInvoiceDays: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                />
                <p className='text-xs text-gray-600 mt-1'>Alert when invoice is overdue by this many days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Preferences Tab */}
      {activeTab === 'system' && (
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>System Preferences</h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Default Dashboard View
                </label>
                <select
                  value={systemPreferences.defaultDashboardView}
                  onChange={(e) => setSystemPreferences({...systemPreferences, defaultDashboardView: e.target.value})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option value='overview'>Overview</option>
                  <option value='sales'>Sales Focus</option>
                  <option value='inventory'>Inventory Focus</option>
                  <option value='staff'>Staff Performance</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Auto Refresh Interval (seconds)
                </label>
                <select
                  value={systemPreferences.autoRefreshInterval}
                  onChange={(e) => setSystemPreferences({...systemPreferences, autoRefreshInterval: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={0}>Off</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Date Format
                </label>
                <select
                  value={systemPreferences.dateFormat}
                  onChange={(e) => setSystemPreferences({...systemPreferences, dateFormat: e.target.value})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option value='DD/MM/YYYY'>DD/MM/YYYY</option>
                  <option value='MM/DD/YYYY'>MM/DD/YYYY</option>
                  <option value='YYYY-MM-DD'>YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Currency Display
                </label>
                <select
                  value={systemPreferences.currencyDisplay}
                  onChange={(e) => setSystemPreferences({...systemPreferences, currencyDisplay: e.target.value})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option value='symbol'>RWF (Symbol)</option>
                  <option value='code'>Rwanda Francs (Full)</option>
                  <option value='both'>RWF - Rwanda Francs</option>
                </select>
              </div>
            </div>

            <div className='mt-6 space-y-3'>
              <label className='flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  checked={systemPreferences.showRealtimeUpdates}
                  onChange={(e) => setSystemPreferences({...systemPreferences, showRealtimeUpdates: e.target.checked})}
                  className='w-5 h-5'
                />
                <div>
                  <p className='font-semibold text-sm'>Show Real-time Updates</p>
                  <p className='text-xs text-gray-600'>Display live data updates on dashboard</p>
                </div>
              </label>

              <label className='flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  checked={systemPreferences.compactMode}
                  onChange={(e) => setSystemPreferences({...systemPreferences, compactMode: e.target.checked})}
                  className='w-5 h-5'
                />
                <div>
                  <p className='font-semibold text-sm'>Compact Mode</p>
                  <p className='text-xs text-gray-600'>Reduce spacing for more content on screen</p>
                </div>
              </label>

              <label className='flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  checked={systemPreferences.darkMode}
                  onChange={(e) => setSystemPreferences({...systemPreferences, darkMode: e.target.checked})}
                  className='w-5 h-5'
                />
                <div>
                  <p className='font-semibold text-sm'>Dark Mode</p>
                  <p className='text-xs text-gray-600'>Switch to dark theme (Coming Soon)</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className='bg-white border border-gray-300 rounded shadow'>
          <div className='p-4 bg-gray-100 border-b border-gray-300'>
            <h3 className='font-bold text-sm uppercase'>Security Settings</h3>
          </div>
          <div className='p-6 space-y-6'>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Session Timeout (minutes)
                </label>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 mb-2 uppercase'>
                  Password Change Requirement (days)
                </label>
                <select
                  value={securitySettings.requirePasswordChange}
                  onChange={(e) => setSecuritySettings({...securitySettings, requirePasswordChange: parseInt(e.target.value)})}
                  className='w-full p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>

            <div className='space-y-3'>
              <label className='flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                  className='w-5 h-5'
                />
                <div>
                  <p className='font-semibold text-sm'>Two-Factor Authentication</p>
                  <p className='text-xs text-gray-600'>Require additional verification when logging in</p>
                </div>
              </label>

              <label className='flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  checked={securitySettings.allowMultipleSessions}
                  onChange={(e) => setSecuritySettings({...securitySettings, allowMultipleSessions: e.target.checked})}
                  className='w-5 h-5'
                />
                <div>
                  <p className='font-semibold text-sm'>Allow Multiple Sessions</p>
                  <p className='text-xs text-gray-600'>Allow logging in from multiple devices simultaneously</p>
                </div>
              </label>
            </div>

            <div className='border-t border-gray-200 pt-6'>
              <p className='font-bold text-sm uppercase text-gray-700 mb-3'>Account Actions</p>
              <div className='space-y-3'>
                <button className='w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold text-sm text-left flex items-center justify-between'>
                  <span>View Login History</span>
                  <span>→</span>
                </button>
                <button className='w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded font-semibold text-sm text-left flex items-center justify-between'>
                  <span>Logout All Other Sessions</span>
                  <span>→</span>
                </button>
                <button className='w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded font-semibold text-sm text-left flex items-center justify-between'>
                  <span>Deactivate Account</span>
                  <span>⚠️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}