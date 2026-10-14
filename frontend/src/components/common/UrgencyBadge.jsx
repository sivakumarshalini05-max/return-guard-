import React from 'react';

export const UrgencyBadge = ({ status, daysRemaining, className = '' }) => {
  const styles = {
    Critical: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-600 animate-pulse',
      label: '🔴 Critical'
    },
    Urgent: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: '🟠 Urgent'
    },
    Safe: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-600',
      label: '🟢 Safe'
    },
    Expired: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-500',
      label: '⚫ Expired'
    }
  };

  const current = styles[status] || styles.Safe;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <span>{status}</span>
      {daysRemaining !== undefined && (
        <span className="text-[11px] opacity-80 border-l border-current/20 pl-1.5 ml-0.5">
          {daysRemaining < 0
            ? 'Passed'
            : daysRemaining === 0
            ? 'Today'
            : daysRemaining === 1
            ? 'Tomorrow'
            : `${daysRemaining}d left`}
        </span>
      )}
    </span>
  );
};

export default UrgencyBadge;
