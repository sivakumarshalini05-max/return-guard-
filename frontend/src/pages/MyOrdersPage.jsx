import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  Grid,
  List as ListIcon
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import UrgencyBadge from '../components/common/UrgencyBadge';
import WarrantyBadge from '../components/common/WarrantyBadge';
import PlatformBadge from '../components/common/PlatformBadge';
import EmptyState from '../components/common/EmptyState';

export const MyOrdersPage = () => {
  const {
    orders,
    loading,
    search,
    setSearch,
    platform,
    setPlatform,
    urgency,
    setUrgency,
    sortBy,
    setSortBy,
    removeOrder
  } = useOrders();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const navigate = useNavigate();

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await removeOrder(deleteConfirmId);
      } catch (err) {
        alert('Failed to delete order.');
      } finally {
        setDeleteConfirmId(null);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Tracked Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your shopping orders across Amazon, Flipkart, Myntra, Meesho, Ajio & more.
          </p>
        </div>
        <button
          onClick={() => navigate('/add-order')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or notes..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            >
              <option value="All">All Platforms</option>
              <option value="Amazon">Amazon</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Myntra">Myntra</option>
              <option value="Meesho">Meesho</option>
              <option value="Ajio">Ajio</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            >
              <option value="All">All Urgency Statuses</option>
              <option value="Critical">🔴 Critical (0-1 days)</option>
              <option value="Urgent">🟠 Urgent (2-3 days)</option>
              <option value="Safe">🟢 Safe (4+ days)</option>
              <option value="Expired">⚫ Expired</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            >
              <option value="urgency">Sort by Urgency</option>
              <option value="deadline">Sort by Return Deadline</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Added First</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing {orders.length} order(s)</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-slate-500 text-xs font-semibold">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Updating order listing...
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <EmptyState
          type="orders"
          actionLabel="Add Your First Order"
          onAction={() => navigate('/add-order')}
        />
      )}

      {/* Grid View */}
      {!loading && orders.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                {/* Card Header Badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <PlatformBadge platform={o.platform} />
                  <UrgencyBadge status={o.urgencyStatus} daysRemaining={o.daysRemaining} />
                </div>

                {/* Product Info */}
                <div className="flex gap-3 mb-3">
                  {o.productImage ? (
                    <img
                      src={o.productImage}
                      alt={o.productName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs flex-shrink-0">
                      IMG
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-2">{o.productName}</h3>
                    <div className="text-sm font-black text-slate-900 mt-1">
                      ₹{o.price?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Dates summary */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Return Deadline:</span>
                    <span className="font-bold text-slate-900">
                      {new Date(o.returnDeadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Replacement:</span>
                    <span className="font-medium">
                      {new Date(o.replacementDeadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                  {o.warrantyPeriod > 0 && (
                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Warranty Expiry:</span>
                      <span className="font-bold text-blue-600">
                        {new Date(o.warrantyExpiry).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/orders/${o._id}`)}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => navigate(`/add-order?edit=${o._id}`)}
                  className="p-2 text-slate-600 hover:bg-slate-200/80 rounded-xl transition-colors"
                  title="Edit Order"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(o._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Order"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && orders.length > 0 && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Return Deadline</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Warranty</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sm max-w-xs truncate">{o.productName}</td>
                    <td className="py-3.5 px-4">
                      <PlatformBadge platform={o.platform} />
                    </td>
                    <td className="py-3.5 px-4 font-bold">₹{o.price?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      {new Date(o.returnDeadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <UrgencyBadge status={o.urgencyStatus} daysRemaining={o.daysRemaining} />
                    </td>
                    <td className="py-3.5 px-4">
                      <WarrantyBadge status={o.warrantyStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/orders/${o._id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/add-order?edit=${o._id}`)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(o._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg mb-2">Delete Tracked Order?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to remove this order from ReturnGuard? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
