import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Bot,
  Calendar,
  ShoppingBag,
  DollarSign,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';
import API from '../services/api';
import UrgencyBadge from '../components/common/UrgencyBadge';
import WarrantyBadge from '../components/common/WarrantyBadge';
import PlatformBadge from '../components/common/PlatformBadge';
import TimelineVisual from '../components/common/TimelineVisual';
import { useOrders } from '../context/OrderContext';

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { removeOrder } = useOrders();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order from ReturnGuard?')) {
      try {
        await removeOrder(id);
        navigate('/orders');
      } catch (err) {
        alert('Failed to delete order.');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-semibold text-slate-600">Retrieving order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <div className="text-red-600 font-bold text-base">{error || 'Order not found'}</div>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{order.productName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <PlatformBadge platform={order.platform} />
              <UrgencyBadge status={order.urgencyStatus} daysRemaining={order.daysRemaining} />
              <WarrantyBadge status={order.warrantyStatus} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/ai-assistant?orderId=${order._id}`)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </button>
          <button
            onClick={() => navigate(`/add-order?edit=${order._id}`)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
            title="Edit Order"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition-colors"
            title="Delete Order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Details Card & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary & Specs Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          {order.productImage ? (
            <img
              src={order.productImage}
              alt={order.productName}
              className="w-full h-48 rounded-2xl object-cover border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-full h-48 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
              No Image Provided
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase">Product Price</span>
              <span className="text-lg font-black text-slate-900">₹{order.price?.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Order Date:</span>
              <span className="font-semibold text-slate-900">
                {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Delivery Date:</span>
              <span className="font-semibold text-slate-900">
                {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Return Window:</span>
              <span className="font-bold text-slate-900">{order.returnPeriod || 7} Days</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Replacement Window:</span>
              <span className="font-bold text-slate-900">{order.replacementPeriod || 7} Days</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Warranty Coverage:</span>
              <span className="font-bold text-blue-600">{order.warrantyPeriod || 0} Months</span>
            </div>
          </div>

          {order.notes && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Notes & Instructions
              </span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Visual Timeline & Deadlines breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <TimelineVisual order={order} />

          {/* Key Deadline Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Return Deadline Card */}
            <div className={`p-5 rounded-2xl border ${order.daysRemaining <= 1 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200/80'} shadow-sm`}>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span>Return Deadline</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {new Date(order.returnDeadline).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
              <div className="mt-2">
                <UrgencyBadge status={order.urgencyStatus} daysRemaining={order.daysRemaining} />
              </div>
            </div>

            {/* Warranty Expiry Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Warranty Expiry</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {order.warrantyExpiry
                  ? new Date(order.warrantyExpiry).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'No Warranty'}
              </div>
              <div className="mt-2">
                <WarrantyBadge status={order.warrantyStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
