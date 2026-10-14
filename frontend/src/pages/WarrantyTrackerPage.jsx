import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ShieldX, ExternalLink, Calendar, Plus } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import WarrantyBadge from '../components/common/WarrantyBadge';
import PlatformBadge from '../components/common/PlatformBadge';
import EmptyState from '../components/common/EmptyState';

export const WarrantyTrackerPage = () => {
  const { orders, loading } = useOrders();
  const navigate = useNavigate();

  // Filter orders that have warranty duration set (>0)
  const warrantyOrders = orders.filter((o) => o.warrantyPeriod > 0);

  const activeWarranties = warrantyOrders.filter((o) => o.warrantyStatus === 'Active');
  const expiringSoon = warrantyOrders.filter((o) => o.warrantyStatus === 'Expiring Soon');
  const expiredWarranties = warrantyOrders.filter((o) => o.warrantyStatus === 'Expired');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <span>Product Warranty Tracker</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continue tracking manufacturer product warranties even after return periods expire.
          </p>
        </div>
        <button
          onClick={() => navigate('/add-order')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product Warranty</span>
        </button>
      </div>

      {/* Warranty Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Active Warranties</div>
            <div className="text-2xl font-black text-slate-900">{activeWarranties.length}</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Expiring Soon (≤30 Days)</div>
            <div className="text-2xl font-black text-amber-600">{expiringSoon.length}</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
            <ShieldX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Expired Warranties</div>
            <div className="text-2xl font-black text-slate-500">{expiredWarranties.length}</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-slate-500 text-xs font-semibold">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Fetching warranty database...
        </div>
      )}

      {!loading && warrantyOrders.length === 0 && (
        <EmptyState
          type="warranty"
          actionLabel="Add Product with Warranty"
          onAction={() => navigate('/add-order')}
        />
      )}

      {/* Warranty List Grid */}
      {!loading && warrantyOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {warrantyOrders.map((o) => {
            const startDate = new Date(o.deliveryDate || o.orderDate);
            const expiryDate = new Date(o.warrantyExpiry);

            return (
              <div
                key={o._id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <PlatformBadge platform={o.platform} />
                    <WarrantyBadge status={o.warrantyStatus} />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">{o.productName}</h3>
                  <div className="text-xs text-slate-500 mb-4 font-medium">
                    Total Duration: <strong className="text-slate-900">{o.warrantyPeriod} Months</strong>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Warranty Start:</span>
                      <span className="font-semibold text-slate-900">
                        {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Warranty Expiry:</span>
                      <span className="font-bold text-blue-600">
                        {expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Remaining:</span>
                      <span className="font-bold text-slate-900">
                        {o.warrantyDaysRemaining < 0
                          ? 'Expired'
                          : o.warrantyDaysRemaining > 60
                          ? `${Math.floor(o.warrantyDaysRemaining / 30)} months remaining`
                          : `${o.warrantyDaysRemaining} days remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/orders/${o._id}`)}
                  className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Order Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WarrantyTrackerPage;
