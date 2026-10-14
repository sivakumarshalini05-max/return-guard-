import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOrders } from './OrderContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { orders } = useOrders();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());

  useEffect(() => {
    const list = [];
    orders.forEach((o) => {
      // Return Deadline notifications
      if (o.urgencyStatus === 'Critical') {
        list.push({
          id: `crit_${o._id}`,
          orderId: o._id,
          title: 'Return Deadline Critical!',
          message: `Your ${o.productName} return deadline is ${o.daysRemaining === 0 ? 'today' : 'tomorrow'} (${o.platform}).`,
          type: 'critical',
          date: new Date()
        });
      } else if (o.urgencyStatus === 'Urgent') {
        list.push({
          id: `urg_${o._id}`,
          orderId: o._id,
          title: 'Return Deadline Approaching',
          message: `Your ${o.productName} return deadline is in ${o.daysRemaining} days.`,
          type: 'urgent',
          date: new Date()
        });
      } else if (o.urgencyStatus === 'Expired') {
        list.push({
          id: `exp_${o._id}`,
          orderId: o._id,
          title: 'Return Deadline Expired',
          message: `The return period for ${o.productName} has passed. Warranty tracking is active.`,
          type: 'expired',
          date: new Date()
        });
      }

      // Warranty notifications
      if (o.warrantyStatus === 'Expiring Soon') {
        list.push({
          id: `warr_${o._id}`,
          orderId: o._id,
          title: 'Warranty Expiring Soon',
          message: `Your ${o.productName} warranty expires in ${o.warrantyDaysRemaining} days.`,
          type: 'warranty',
          date: new Date()
        });
      }
    });

    setNotifications(list);
  }, [orders]);

  const markAsRead = (id) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    const all = new Set(notifications.map((n) => n.id));
    setReadIds(all);
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        readIds,
        unreadCount,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
