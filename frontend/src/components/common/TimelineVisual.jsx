import React from 'react';
import { ShoppingCart, Truck, RotateCcw, RefreshCw, ShieldCheck, CheckCircle, Clock } from 'lucide-react';

export const TimelineVisual = ({ order }) => {
  if (!order) return null;

  const now = new Date();
  const orderDate = new Date(order.orderDate);
  const deliveryDate = new Date(order.deliveryDate);
  const returnDeadline = new Date(order.returnDeadline);
  const replacementDeadline = new Date(order.replacementDeadline);
  const warrantyExpiry = order.warrantyExpiry ? new Date(order.warrantyExpiry) : null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if delivered (delivery date has arrived/passed)
  const isDelivered = now >= deliveryDate;

  const isReturnActive = isDelivered && now <= returnDeadline;
  const isReplacementActive = isDelivered && now <= replacementDeadline;
  const isWarrantyActive = isDelivered && warrantyExpiry && now <= warrantyExpiry;

  const steps = [
    {
      title: 'Order Placed',
      date: formatDate(orderDate),
      icon: ShoppingCart,
      completed: true,
      active: false
    },
    {
      title: isDelivered ? 'Delivered' : 'Expected Delivery',
      date: formatDate(deliveryDate),
      icon: Truck,
      completed: isDelivered,
      active: !isDelivered,
      badge: isDelivered ? 'Delivered' : 'In Transit'
    },
    {
      title: `Return Window (${order.returnPeriod || 7} Days)`,
      date: `Deadline: ${formatDate(returnDeadline)}`,
      icon: RotateCcw,
      completed: isDelivered && now > returnDeadline,
      active: isReturnActive,
      badge: !isDelivered ? 'Pending Delivery' : (isReturnActive ? order.urgencyStatus : 'Expired')
    },
    {
      title: `Replacement Window (${order.replacementPeriod || 7} Days)`,
      date: `Deadline: ${formatDate(replacementDeadline)}`,
      icon: RefreshCw,
      completed: isDelivered && now > replacementDeadline,
      active: isReplacementActive && !isReturnActive,
      badge: !isDelivered ? 'Pending Delivery' : (isReplacementActive ? 'Active' : 'Expired')
    },
    {
      title: `Warranty Period (${order.warrantyPeriod || 0} Months)`,
      date: warrantyExpiry ? `Expires: ${formatDate(warrantyExpiry)}` : 'No Warranty',
      icon: ShieldCheck,
      completed: warrantyExpiry ? (isDelivered && now > warrantyExpiry) : false,
      active: isWarrantyActive,
      badge: !isDelivered && warrantyExpiry ? 'Pending Delivery' : order.warrantyStatus
    }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm my-4">
      <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Order Lifecycle & Deadline Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          let nodeBg = 'bg-slate-100 text-slate-400 border-slate-300';
          if (step.completed) {
            nodeBg = 'bg-emerald-500 text-white border-emerald-500 shadow-sm';
          } else if (step.active) {
            nodeBg = 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100';
          }

          return (
            <div key={idx} className="relative flex items-start gap-4 group">
              {/* Timeline Icon Node */}
              <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border text-xs z-10 transition-colors ${nodeBg}`}>
                {step.completed ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>

              {/* Step Content */}
              <div className="flex-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    {step.title}
                  </span>
                  {step.badge && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                      {step.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{step.date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineVisual;
