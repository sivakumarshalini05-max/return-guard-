import Order from '../models/Order.js';
import { isDBConnected } from '../config/db.js';
import { calculateOrderDeadlines } from '../utils/calculateDeadlines.js';
import { memoryStore } from '../utils/memoryStore.js';

// Helper to update live urgency score on fetched items
const refreshOrderUrgency = (order) => {
  const calculated = calculateOrderDeadlines({
    orderDate: order.orderDate,
    deliveryDate: order.deliveryDate,
    returnPeriod: order.returnPeriod,
    replacementPeriod: order.replacementPeriod,
    warrantyPeriod: order.warrantyPeriod
  });

  const obj = order.toObject ? order.toObject() : order;
  return {
    ...obj,
    returnDeadline: calculated.returnDeadline,
    replacementDeadline: calculated.replacementDeadline,
    warrantyExpiry: calculated.warrantyExpiry,
    daysRemaining: calculated.daysRemaining,
    warrantyDaysRemaining: calculated.warrantyDaysRemaining,
    urgencyStatus: calculated.urgencyStatus,
    warrantyStatus: calculated.warrantyStatus
  };
};

// @desc    Get all orders for logged-in user
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, platform, urgency, sort } = req.query;

    let rawOrders = [];

    if (isDBConnected()) {
      try {
        const filter = { userId };

        if (platform && platform !== 'All') {
          filter.platform = platform;
        }

        if (search) {
          filter.$or = [
            { productName: { $regex: search, $options: 'i' } },
            { platform: { $regex: search, $options: 'i' } },
            { notes: { $regex: search, $options: 'i' } }
          ];
        }

        let query = Order.find(filter);

        if (sort === 'deadline') {
          query = query.sort({ returnDeadline: 1 });
        } else if (sort === 'price_asc') {
          query = query.sort({ price: 1 });
        } else if (sort === 'price_desc') {
          query = query.sort({ price: -1 });
        } else {
          query = query.sort({ createdAt: -1 });
        }

        rawOrders = await query.exec();
      } catch (dbErr) {
        rawOrders = await memoryStore.findOrders(userId, { search, platform, sort });
      }
    } else {
      rawOrders = await memoryStore.findOrders(userId, { search, platform, sort });
    }

    // Refresh live calculated status based on today's date
    let orders = rawOrders.map(refreshOrderUrgency);

    if (urgency && urgency !== 'All') {
      orders = orders.filter(o => o.urgencyStatus === urgency);
    }

    if (sort === 'urgency') {
      const urgencyPriority = { Critical: 1, Urgent: 2, Safe: 3, Expired: 4 };
      orders.sort((a, b) => (urgencyPriority[a.urgencyStatus] || 99) - (urgencyPriority[b.urgencyStatus] || 99));
    }

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    let order;
    if (isDBConnected()) {
      try {
        order = await Order.findById(req.params.id);
      } catch (e) {
        order = await memoryStore.findOrderById(req.params.id);
      }
    } else {
      order = await memoryStore.findOrderById(req.params.id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      order: refreshOrderUrgency(order)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving order' });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      productName,
      platform,
      price,
      productImage,
      orderDate,
      deliveryDate,
      returnPeriod,
      replacementPeriod,
      warrantyPeriod,
      notes
    } = req.body;

    if (!productName || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required'
      });
    }

    const calculated = calculateOrderDeadlines({
      orderDate: orderDate || new Date(),
      deliveryDate: deliveryDate || orderDate || new Date(),
      returnPeriod: returnPeriod ?? 7,
      replacementPeriod: replacementPeriod ?? 7,
      warrantyPeriod: warrantyPeriod ?? 0
    });

    const orderData = {
      userId: req.user.id,
      productName,
      platform: platform || 'Amazon',
      price: Number(price),
      productImage: productImage || '',
      orderDate: calculated.orderDate,
      deliveryDate: calculated.deliveryDate,
      returnPeriod: calculated.returnPeriod,
      returnDeadline: calculated.returnDeadline,
      replacementPeriod: calculated.replacementPeriod,
      replacementDeadline: calculated.replacementDeadline,
      warrantyPeriod: calculated.warrantyPeriod,
      warrantyExpiry: calculated.warrantyExpiry,
      urgencyStatus: calculated.urgencyStatus,
      warrantyStatus: calculated.warrantyStatus,
      notes: notes || ''
    };

    let newOrder;
    if (isDBConnected()) {
      try {
        newOrder = await Order.create(orderData);
      } catch (e) {
        newOrder = await memoryStore.createOrder(orderData);
      }
    } else {
      newOrder = await memoryStore.createOrder(orderData);
    }

    res.status(201).json({
      success: true,
      message: 'Order tracked successfully',
      order: refreshOrderUrgency(newOrder)
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  try {
    let order;
    if (isDBConnected()) {
      try {
        order = await Order.findById(req.params.id);
      } catch (e) {
        order = await memoryStore.findOrderById(req.params.id);
      }
    } else {
      order = await memoryStore.findOrderById(req.params.id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    const updatedData = { ...req.body };

    const calculated = calculateOrderDeadlines({
      orderDate: updatedData.orderDate || order.orderDate,
      deliveryDate: updatedData.deliveryDate || order.deliveryDate,
      returnPeriod: updatedData.returnPeriod !== undefined ? updatedData.returnPeriod : order.returnPeriod,
      replacementPeriod: updatedData.replacementPeriod !== undefined ? updatedData.replacementPeriod : order.replacementPeriod,
      warrantyPeriod: updatedData.warrantyPeriod !== undefined ? updatedData.warrantyPeriod : order.warrantyPeriod
    });

    updatedData.returnDeadline = calculated.returnDeadline;
    updatedData.replacementDeadline = calculated.replacementDeadline;
    updatedData.warrantyExpiry = calculated.warrantyExpiry;
    updatedData.urgencyStatus = calculated.urgencyStatus;
    updatedData.warrantyStatus = calculated.warrantyStatus;

    let updatedOrder;
    if (isDBConnected()) {
      try {
        updatedOrder = await Order.findByIdAndUpdate(req.params.id, updatedData, {
          new: true,
          runValidators: true
        });
      } catch (e) {
        updatedOrder = await memoryStore.updateOrder(req.params.id, updatedData);
      }
    } else {
      updatedOrder = await memoryStore.updateOrder(req.params.id, updatedData);
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: refreshOrderUrgency(updatedOrder)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res) => {
  try {
    let order;
    if (isDBConnected()) {
      try {
        order = await Order.findById(req.params.id);
      } catch (e) {
        order = await memoryStore.findOrderById(req.params.id);
      }
    } else {
      order = await memoryStore.findOrderById(req.params.id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this order' });
    }

    if (isDBConnected()) {
      try {
        await Order.findByIdAndDelete(req.params.id);
      } catch (e) {
        await memoryStore.deleteOrder(req.params.id);
      }
    } else {
      await memoryStore.deleteOrder(req.params.id);
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
};

// @desc    Seed demo orders for testing/demoing
// @route   POST /api/orders/seed
// @access  Private
export const seedDemoOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const deliv1 = new Date(now);
    deliv1.setDate(deliv1.getDate() - 6);

    const deliv2 = new Date(now);
    deliv2.setDate(deliv2.getDate() - 5);

    const deliv3 = new Date(now);
    deliv3.setDate(deliv3.getDate() - 2);

    const deliv4 = new Date(now);
    deliv4.setDate(deliv4.getDate() - 20);

    const deliv5 = new Date(now);
    deliv5.setDate(deliv5.getDate() - 340);

    const sampleOrders = [
      {
        userId,
        productName: 'Sony WH-1000XM5 Wireless Headphones',
        platform: 'Amazon',
        price: 24999,
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
        orderDate: new Date(deliv1.getTime() - 86400000),
        deliveryDate: deliv1,
        returnPeriod: 7,
        replacementPeriod: 7,
        warrantyPeriod: 12,
        notes: 'Includes active noise cancellation and carrying case.'
      },
      {
        userId,
        productName: 'Nike Air Max 270 Running Shoes',
        platform: 'Myntra',
        price: 8995,
        productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
        orderDate: new Date(deliv2.getTime() - 86400000 * 2),
        deliveryDate: deliv2,
        returnPeriod: 7,
        replacementPeriod: 7,
        warrantyPeriod: 3,
        notes: 'Size 10 UK. Check fit before return deadline.'
      },
      {
        userId,
        productName: 'Dell XPS 15 OLED Laptop',
        platform: 'Flipkart',
        price: 145000,
        productImage: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&q=80',
        orderDate: new Date(deliv3.getTime() - 86400000 * 3),
        deliveryDate: deliv3,
        returnPeriod: 10,
        replacementPeriod: 10,
        warrantyPeriod: 24,
        notes: 'i7 13th Gen, 32GB RAM, 1TB SSD. Extended warranty registered.'
      },
      {
        userId,
        productName: 'Mechanical RGB Gaming Keyboard',
        platform: 'Ajio',
        price: 3499,
        productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80',
        orderDate: new Date(deliv4.getTime() - 86400000 * 2),
        deliveryDate: deliv4,
        returnPeriod: 7,
        replacementPeriod: 7,
        warrantyPeriod: 12,
        notes: 'Return window passed. 12-month manufacturer warranty active.'
      },
      {
        userId,
        productName: 'Smart Fitness Watch Series 7',
        platform: 'Meesho',
        price: 2999,
        productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
        orderDate: new Date(deliv5.getTime() - 86400000 * 2),
        deliveryDate: deliv5,
        returnPeriod: 7,
        replacementPeriod: 7,
        warrantyPeriod: 12,
        notes: 'Heart rate monitor and step tracker. Warranty expiring soon!'
      }
    ];

    const created = [];
    for (const data of sampleOrders) {
      const calc = calculateOrderDeadlines(data);
      const orderPayload = {
        ...data,
        returnDeadline: calc.returnDeadline,
        replacementDeadline: calc.replacementDeadline,
        warrantyExpiry: calc.warrantyExpiry,
        urgencyStatus: calc.urgencyStatus,
        warrantyStatus: calc.warrantyStatus
      };

      let newOrd;
      if (isDBConnected()) {
        try {
          newOrd = await Order.create(orderPayload);
        } catch (e) {
          newOrd = await memoryStore.createOrder(orderPayload);
        }
      } else {
        newOrd = await memoryStore.createOrder(orderPayload);
      }
      created.push(refreshOrderUrgency(newOrd));
    }

    res.status(201).json({
      success: true,
      message: 'Demo orders created successfully',
      count: created.length,
      orders: created
    });
  } catch (error) {
    console.error('Error seeding demo orders:', error);
    res.status(500).json({ success: false, message: 'Failed to seed demo orders' });
  }
};
