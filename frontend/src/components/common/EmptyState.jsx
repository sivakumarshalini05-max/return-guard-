import React from 'react';
import { Package, ShieldAlert, BellOff, MessageSquarePlus } from 'lucide-react';

export const EmptyState = ({
  type = 'orders',
  title,
  description,
  actionLabel,
  onAction
}) => {
  const defaults = {
    orders: {
      title: 'No orders yet',
      description: 'Add your first order and let ReturnGuard track your deadlines automatically.',
      icon: Package,
      action: 'Add Your First Order'
    },
    warranty: {
      title: 'No active warranties found',
      description: 'Tracked orders with warranty periods will appear here after return deadlines expire.',
      icon: ShieldAlert,
      action: 'Add Order with Warranty'
    },
    notifications: {
      title: 'No pending alerts',
      description: 'You are all caught up! We will notify you when return deadlines approach.',
      icon: BellOff,
      action: null
    },
    ai: {
      title: 'No conversation history',
      description: 'Ask ReturnGuard AI any question about your product returns, replacements, or warranty claims.',
      icon: MessageSquarePlus,
      action: null
    }
  };

  const config = defaults[type] || defaults.orders;
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayDesc = description || config.description;
  const displayAction = actionLabel !== undefined ? actionLabel : config.action;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm my-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-1">{displayTitle}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{displayDesc}</p>
      {displayAction && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
        >
          {displayAction}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
