import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export const WarrantyBadge = ({ status, remainingDays, className = '' }) => {
  if (status === 'None') return null;

  const config = {
    Active: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ShieldCheck,
      label: '🟢 Active'
    },
    'Expiring Soon': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: ShieldAlert,
      label: '🟠 Expiring Soon'
    },
    Expired: {
      bg: 'bg-slate-100 text-slate-500 border-slate-200',
      icon: ShieldX,
      label: '⚫ Expired'
    }
  };

  const item = config[status] || config.Active;
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.bg} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>Warranty {status}</span>
    </span>
  );
};

export default WarrantyBadge;
