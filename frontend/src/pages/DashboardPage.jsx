import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Plus,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import UrgencyBadge from '../components/common/UrgencyBadge';
import PlatformBadge from '../components/common/PlatformBadge';
import EmptyState from '../components/common/EmptyState';

export const DashboardPage = () => {
  const { orders, stats, loading, seedDemoData } = useOrders();
  const navigate = useNavigate();

  // Sorting for dashboard sections
  const urgentOrders = [...orders]
    .filter((o) => o.urgencyStatus === 'Critical' || o.urgencyStatus === 'Urgent')
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const upcomingDeadlines = [...orders]
    .filter((o) => o.daysRemaining >= 0 && o.daysRemaining <= 7)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const handleSeed = async () => {
    try {
      await seedDemoData();
    } catch (err) {
      alert('Failed to load sample data.');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-semibold text-slate-600">Loading live order statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Quick Action Top Bar / Demo Banner */}
      {orders.length === 0 && (
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">New to ReturnGuard?</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Load 5 sample orders with varied return deadlines and active warranties to explore features immediately!
              </p>
            </div>
          </div>
          <button
            onClick={handleSeed}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Seed Demo Orders</span>
          </button>
        </div>
      )}

      {/* Main 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between group hover:border-blue-500/50 transition-all">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalOrders}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Urgent Returns */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between group hover:border-red-500/50 transition-all">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Urgent Returns</span>
            <div className="text-3xl font-black text-red-600 mt-1">{stats.urgentReturns}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between group hover:border-amber-500/50 transition-all">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Deadlines</span>
            <div className="text-3xl font-black text-amber-600 mt-1">{stats.upcomingDeadlines}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Active Warranties */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between group hover:border-emerald-500/50 transition-all">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Warranties</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">{stats.activeWarranties}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Section 1: Urgent Returns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Urgent Returns</h2>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">
              {urgentOrders.length}
            </span>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {urgentOrders.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl text-center text-slate-500 text-xs font-medium">
            🟢 No critical or urgent returns pending right now!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-5 rounded-2xl border border-red-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-red-600" />
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <PlatformBadge platform={order.platform} />
                    <UrgencyBadge status={order.urgencyStatus} daysRemaining={order.daysRemaining} />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">{order.productName}</h3>
                  <div className="text-sm font-black text-slate-900 mb-3">₹{order.price?.toLocaleString('en-IN')}</div>

                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Return Deadline:</span>
                      <span className="font-bold text-red-600">
                        {order.daysRemaining === 0
                          ? 'Today'
                          : order.daysRemaining === 1
                          ? 'Tomorrow'
                          : `${order.daysRemaining} days left`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Exact Date:</span>
                      <span className="font-medium">
                        {new Date(order.returnDeadline).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2 & 3: Upcoming Deadlines & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Upcoming Deadlines
            </h2>
            <span className="text-xs text-slate-500 font-medium">Next 7 Days</span>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs text-center font-medium">
              No return deadlines coming up in the next 7 days.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {upcomingDeadlines.map((o) => (
                <div
                  key={o._id}
                  onClick={() => navigate(`/orders/${o._id}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="font-bold text-sm text-slate-900 truncate">{o.productName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{o.platform}</span>
                      <span>•</span>
                      <span>₹{o.price?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <UrgencyBadge status={o.urgencyStatus} daysRemaining={o.daysRemaining} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Recent Orders
            </h2>
            <button
              onClick={() => navigate('/add-order')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState
              type="orders"
              actionLabel="Add Order"
              onAction={() => navigate('/add-order')}
            />
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {recentOrders.map((o) => (
                <div
                  key={o._id}
                  onClick={() => navigate(`/orders/${o._id}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="font-bold text-sm text-slate-900 truncate">{o.productName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <PlatformBadge platform={o.platform} />
                      <span>Order: {new Date(o.orderDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-slate-900">₹{o.price?.toLocaleString('en-IN')}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Deadline: {new Date(o.returnDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
