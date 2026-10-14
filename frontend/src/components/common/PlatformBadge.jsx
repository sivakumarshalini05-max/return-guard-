import React from 'react';
import { ShoppingBag } from 'lucide-react';

export const PlatformBadge = ({ platform, className = '' }) => {
  const styles = {
    Amazon: 'bg-amber-100/80 text-amber-900 border-amber-300/60',
    Flipkart: 'bg-blue-100/80 text-blue-900 border-blue-300/60',
    Myntra: 'bg-pink-100/80 text-pink-900 border-pink-300/60',
    Meesho: 'bg-fuchsia-100/80 text-fuchsia-900 border-fuchsia-300/60',
    Ajio: 'bg-slate-200 text-slate-900 border-slate-300',
    Other: 'bg-emerald-100/80 text-emerald-900 border-emerald-300/60'
  };

  const styleClass = styles[platform] || styles.Other;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${styleClass} ${className}`}>
      <ShoppingBag className="w-3 h-3 opacity-70" />
      {platform}
    </span>
  );
};

export default PlatformBadge;
