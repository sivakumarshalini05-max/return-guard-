import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Plus, ShieldCheck, Check, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Header = ({ setMobileOpen }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, readIds } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return `${getGreetingTime()}, ${user?.name ? user.name.split(' ')[0] : 'User'} 👋`;
      case '/orders':
        return 'My Orders';
      case '/add-order':
        return 'Track New Order';
      case '/ai-assistant':
        return 'ReturnGuard AI Assistant';
      case '/warranty':
        return 'Warranty Tracker';
      case '/profile':
        return 'Account & Settings';
      default:
        return 'ReturnGuard';
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{getPageTitle()}</h1>
          {location.pathname === '/dashboard' && (
            <p className="text-xs font-medium text-slate-500 hidden sm:block">
              Here is your deadline summary for today
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Add Order Button */}
        {location.pathname !== '/add-order' && (
          <button
            onClick={() => navigate('/add-order')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Order</span>
          </button>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span>In-App Deadline Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs font-medium">
                    No active deadline alerts at this time.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isRead = readIds.has(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.orderId) navigate(`/orders/${n.orderId}`);
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                          !isRead ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg text-white flex-shrink-0 ${
                            n.type === 'critical'
                              ? 'bg-red-600'
                              : n.type === 'urgent'
                              ? 'bg-amber-500'
                              : n.type === 'warranty'
                              ? 'bg-blue-600'
                              : 'bg-slate-500'
                          }`}
                        >
                          {n.type === 'critical' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : n.type === 'warranty' ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-slate-900 truncate">{n.title}</span>
                            {!isRead && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
