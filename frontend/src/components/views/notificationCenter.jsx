import React, { useState } from 'react';
import { BiSearch, BiRefresh } from 'react-icons/bi';
import { FaBell, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaCog } from 'react-icons/fa';
import { MdWarning, MdCheckCircle, MdClose, MdNotifications } from 'react-icons/md';
import { FiFilter } from 'react-icons/fi';

export default function NotificationsCenter() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    varianceThreshold: 5000,
    lowStockThreshold: 20,
    overdueInvoiceAlert: 30
  });

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'urgent',
      category: 'variance',
      title: 'Cash Variance Detected',
      message: 'Mike Johnson (POS-01): -5,000 cash shortage detected in session #1',
      timestamp: '2026-01-06 14:30:00',
      read: false,
      actionUrl: '/variance-investigation/1',
      actionLabel: 'Investigate'
    },
    {
      id: 2,
      type: 'urgent',
      category: 'approval',
      title: 'Float Approval Required',
      message: '2 cash sessions awaiting float approval (John Doe, Sarah Lee)',
      timestamp: '2026-01-06 08:05:00',
      read: false,
      actionUrl: '/cash-sessions',
      actionLabel: 'Review'
    },
    {
      id: 3,
      type: 'important',
      category: 'inventory',
      title: 'Critical Stock Alert',
      message: 'USB Type-C Cables out of stock. Last ordered 56 days ago.',
      timestamp: '2026-01-06 09:00:00',
      read: false,
      actionUrl: '/inventory-oversight',
      actionLabel: 'Order Now'
    },
    {
      id: 4,
      type: 'important',
      category: 'credit',
      title: 'Overdue Invoice Alert',
      message: 'XYZ Ltd invoice INV-012 is 95 days overdue (RWF 800,000)',
      timestamp: '2026-01-06 08:00:00',
      read: false,
      actionUrl: '/credit-management',
      actionLabel: 'Send Reminder'
    },
    {
      id: 5,
      type: 'important',
      category: 'approval',
      title: 'Purchase Order Pending',
      message: 'PO-001 from Tech Distributors Ltd awaiting approval (RWF 472,000)',
      timestamp: '2026-01-05 16:30:00',
      read: false,
      actionUrl: '/purchase-orders',
      actionLabel: 'Approve'
    },
    {
      id: 6,
      type: 'important',
      category: 'approval',
      title: 'Expense Approval Needed',
      message: 'Utilities expense (EUCL) pending approval (RWF 177,000)',
      timestamp: '2026-01-05 15:20:00',
      read: true,
      actionUrl: '/expense-approval',
      actionLabel: 'Review'
    },
    {
      id: 7,
      type: 'info',
      category: 'inventory',
      title: 'Low Stock Warning',
      message: '5 items below reorder point (Wireless Mouse, HDMI Cables, etc.)',
      timestamp: '2026-01-05 14:00:00',
      read: true,
      actionUrl: '/inventory-oversight',
      actionLabel: 'View'
    },
    {
      id: 8,
      type: 'info',
      category: 'performance',
      title: 'Staff Performance Alert',
      message: 'John Doe has 5 variance incidents this month',
      timestamp: '2026-01-05 10:00:00',
      read: true,
      actionUrl: '/staff-performance',
      actionLabel: 'View'
    },
    {
      id: 9,
      type: 'info',
      category: 'system',
      title: 'Business Day Opened',
      message: 'Downtown Store business day opened successfully at 07:30 AM',
      timestamp: '2026-01-06 07:30:00',
      read: true,
      actionUrl: null,
      actionLabel: null
    },
    {
      id: 10,
      type: 'info',
      category: 'system',
      title: 'Daily Report Ready',
      message: 'Yesterday\'s daily report is ready for review',
      timestamp: '2026-01-06 07:00:00',
      read: true,
      actionUrl: '/daily-reports',
      actionLabel: 'View Report'
    }
  ];

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (activeTab === 'urgent') {
      filtered = filtered.filter(n => n.type === 'urgent');
    } else if (activeTab === 'important') {
      filtered = filtered.filter(n => n.type === 'important');
    } else if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getTypeIcon = (type) => {
    if (type === 'urgent') return <FaExclamationTriangle className='text-red-600' size={20} />;
    if (type === 'important') return <MdWarning className='text-orange-600' size={22} />;
    return <FaInfoCircle className='text-blue-600' size={20} />;
  };

  const getTypeColor = (type) => {
    if (type === 'urgent') return 'bg-red-50 border-red-300';
    if (type === 'important') return 'bg-orange-50 border-orange-300';
    return 'bg-blue-50 border-blue-300';
  };

  const getTypeBadge = (type) => {
    if (type === 'urgent') return 'bg-red-500 text-white';
    if (type === 'important') return 'bg-orange-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      variance: '💰',
      approval: '✅',
      inventory: '📦',
      credit: '💳',
      performance: '📊',
      system: '⚙️'
    };
    return icons[category] || '📢';
  };

  const handleMarkAsRead = (id) => {
    alert(`Marking notification ${id} as read`);
  };

  const handleDismiss = (id) => {
    alert(`Dismissing notification ${id}`);
  };

  const handleMarkAllAsRead = () => {
    alert('Marking all notifications as read');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      alert('All notifications cleared');
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent').length;
  const importantCount = notifications.filter(n => n.type === 'important').length;

  const SettingsModal = () => {
    if (!showSettings) return null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowSettings(false)}>
        <div className='bg-white rounded shadow-xl max-w-2xl w-full mx-4' onClick={(e) => e.stopPropagation()}>
          <div className='p-4 bg-blue-50 border-b border-blue-200 flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <FaCog className='text-blue-600' size={20} />
              <h3 className='font-bold text-lg'>Notification Settings</h3>
            </div>
            <button onClick={() => setShowSettings(false)} className='text-gray-600 hover:text-gray-800'>
              <MdClose size={24} />
            </button>
          </div>

          <div className='p-6 space-y-6'>
            {/* Notification Channels */}
            <div>
              <p className='font-bold text-sm uppercase text-gray-700 mb-3'>Notification Channels</p>
              <div className='space-y-3'>
                <label className='flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
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
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
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
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                    className='w-5 h-5'
                  />
                  <div className='flex-1'>
                    <p className='font-semibold text-sm'>Push Notifications</p>
                    <p className='text-xs text-gray-600'>Receive in-app push notifications</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Alert Thresholds */}
            <div>
              <p className='font-bold text-sm uppercase text-gray-700 mb-3'>Alert Thresholds</p>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-2'>
                    Variance Alert (RWF)
                  </label>
                  <input
                    type='number'
                    value={settings.varianceThreshold}
                    onChange={(e) => setSettings({...settings, varianceThreshold: parseInt(e.target.value)})}
                    className='w-full p-2 border border-gray-300 rounded text-sm'
                  />
                  <p className='text-xs text-gray-600 mt-1'>Alert when variance exceeds this amount</p>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-2'>
                    Low Stock Threshold (units)
                  </label>
                  <input
                    type='number'
                    value={settings.lowStockThreshold}
                    onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                    className='w-full p-2 border border-gray-300 rounded text-sm'
                  />
                  <p className='text-xs text-gray-600 mt-1'>Alert when stock falls below this level</p>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-2'>
                    Overdue Invoice Alert (days)
                  </label>
                  <input
                    type='number'
                    value={settings.overdueInvoiceAlert}
                    onChange={(e) => setSettings({...settings, overdueInvoiceAlert: parseInt(e.target.value)})}
                    className='w-full p-2 border border-gray-300 rounded text-sm'
                  />
                  <p className='text-xs text-gray-600 mt-1'>Alert when invoice is overdue by this many days</p>
                </div>
              </div>
            </div>
          </div>

          <div className='p-4 bg-gray-50 border-t flex gap-3'>
            <button onClick={() => setShowSettings(false)} className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-semibold'>
              Cancel
            </button>
            <button onClick={() => { alert('Settings saved!'); setShowSettings(false); }} className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm font-semibold'>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Notifications Center</h2>
          <p className='text-sm text-gray-600 mt-1'>Manage all your alerts and notifications</p>
        </div>
        <div className='flex gap-2'>
          <button onClick={() => setShowSettings(true)} className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <FaCog size={12} /> Settings
          </button>
          <button onClick={handleMarkAllAsRead} className='border text-blue-500 hover:bg-blue-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <MdCheckCircle size={14} /> Mark All Read
          </button>
          <button onClick={handleClearAll} className='border text-red-500 hover:bg-red-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <MdClose size={14} /> Clear All
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-4 gap-4'>
        <div className='bg-white border border-gray-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaBell className='text-blue-600' size={20} />
            <p className='text-xs text-gray-600 uppercase'>Total</p>
          </div>
          <p className='text-2xl font-bold'>{notifications.length}</p>
          <p className='text-xs text-gray-600 mt-1'>All notifications</p>
        </div>

        <div className='bg-red-50 border border-red-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <FaExclamationTriangle className='text-red-600' size={18} />
            <p className='text-xs text-gray-600 uppercase'>Urgent</p>
          </div>
          <p className='text-2xl font-bold text-red-600'>{urgentCount}</p>
          <p className='text-xs text-gray-600 mt-1'>Require immediate action</p>
        </div>

        <div className='bg-orange-50 border border-orange-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <MdWarning className='text-orange-600' size={22} />
            <p className='text-xs text-gray-600 uppercase'>Important</p>
          </div>
          <p className='text-2xl font-bold text-orange-600'>{importantCount}</p>
          <p className='text-xs text-gray-600 mt-1'>Need attention today</p>
        </div>

        <div className='bg-blue-50 border border-blue-300 rounded shadow p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <MdNotifications className='text-blue-600' size={22} />
            <p className='text-xs text-gray-600 uppercase'>Unread</p>
          </div>
          <p className='text-2xl font-bold text-blue-600'>{unreadCount}</p>
          <p className='text-xs text-gray-600 mt-1'>New notifications</p>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <div className='flex gap-2'>
          <button onClick={() => setActiveTab('all')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            All ({notifications.length})
          </button>
          <button onClick={() => setActiveTab('urgent')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'urgent' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Urgent ({urgentCount})
          </button>
          <button onClick={() => setActiveTab('important')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'important' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Important ({importantCount})
          </button>
          <button onClick={() => setActiveTab('unread')} className={`px-3 py-1 rounded text-xs font-semibold uppercase ${activeTab === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Unread ({unreadCount})
          </button>
          <button className='border text-gray-500 hover:bg-gray-500 hover:text-white text-xs flex items-center gap-1 px-3 py-1'>
            <BiRefresh size={14} /> Refresh
          </button>
        </div>

        <div className='relative flex items-center'>
          <input
            type='text'
            placeholder='Search notifications...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='border border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px] text-xs'
          />
          <BiSearch className='text-gray-500 relative left-[-5px]' />
        </div>
      </div>

      <hr className='text-gray-400' />

      {/* Notifications List */}
      <div className='space-y-3'>
        {filteredNotifications.length === 0 ? (
          <div className='bg-white border border-gray-300 rounded shadow p-12 text-center'>
            <FaBell className='text-gray-400 mx-auto mb-3' size={48} />
            <p className='text-gray-600 font-semibold text-lg'>No notifications</p>
            <p className='text-gray-500 text-sm mt-1'>You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div key={notification.id} className={`${getTypeColor(notification.type)} border rounded shadow transition-all hover:shadow-md ${!notification.read ? 'border-l-4' : ''}`}>
              <div className='p-4'>
                <div className='flex gap-3'>
                  <div className='flex-shrink-0 mt-1'>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2 mb-2'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <h3 className='font-bold text-sm'>{notification.title}</h3>
                        <span className='text-2xl'>{getCategoryIcon(notification.category)}</span>
                        <span className={`${getTypeBadge(notification.type)} px-2 py-0.5 rounded text-2xs font-semibold uppercase`}>
                          {notification.type}
                        </span>
                        {!notification.read && (
                          <span className='bg-blue-500 text-white px-2 py-0.5 rounded text-2xs font-semibold'>
                            NEW
                          </span>
                        )}
                      </div>
                      <span className='text-xs text-gray-600 whitespace-nowrap'>{notification.timestamp.split(' ')[1]}</span>
                    </div>
                    <p className='text-sm text-gray-700 mb-3'>{notification.message}</p>
                    <div className='flex gap-2 flex-wrap'>
                      {notification.actionUrl && (
                        <button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold'>
                          {notification.actionLabel}
                        </button>
                      )}
                      {!notification.read && (
                        <button onClick={() => handleMarkAsRead(notification.id)} className='border border-gray-400 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-semibold'>
                          Mark as Read
                        </button>
                      )}
                      <button onClick={() => handleDismiss(notification.id)} className='border border-gray-400 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-semibold'>
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <SettingsModal />
    </div>
  );
}