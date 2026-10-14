import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');
  const [urgency, setUrgency] = useState('All');
  const [sortBy, setSortBy] = useState('urgency');

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (platform !== 'All') params.platform = platform;
      if (urgency !== 'All') params.urgency = urgency;
      if (sortBy) params.sort = sortBy;

      const res = await API.get('/orders', { params });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, search, platform, urgency, sortBy]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const addOrder = async (orderData) => {
    const res = await API.post('/orders', orderData);
    if (res.data.success) {
      fetchOrders();
    }
    return res.data;
  };

  const editOrder = async (id, orderData) => {
    const res = await API.put(`/orders/${id}`, orderData);
    if (res.data.success) {
      fetchOrders();
    }
    return res.data;
  };

  const removeOrder = async (id) => {
    const res = await API.delete(`/orders/${id}`);
    if (res.data.success) {
      fetchOrders();
    }
    return res.data;
  };

  const seedDemoData = async () => {
    setLoading(true);
    try {
      const res = await API.post('/orders/seed');
      if (res.data.success) {
        fetchOrders();
      }
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // Calculated Dashboard Statistics
  const totalOrders = orders.length;
  const urgentReturns = orders.filter(o => o.urgencyStatus === 'Critical' || o.urgencyStatus === 'Urgent').length;
  const upcomingDeadlines = orders.filter(o => o.daysRemaining >= 0 && o.daysRemaining <= 7).length;
  const activeWarranties = orders.filter(o => o.warrantyStatus === 'Active' || o.warrantyStatus === 'Expiring Soon').length;

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        search,
        setSearch,
        platform,
        setPlatform,
        urgency,
        setUrgency,
        sortBy,
        setSortBy,
        fetchOrders,
        addOrder,
        editOrder,
        removeOrder,
        seedDemoData,
        stats: {
          totalOrders,
          urgentReturns,
          upcomingDeadlines,
          activeWarranties
        }
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
