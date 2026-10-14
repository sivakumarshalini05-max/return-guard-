import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    platform: {
      type: String,
      enum: ['Amazon', 'Flipkart', 'Myntra', 'Meesho', 'Ajio', 'Other'],
      default: 'Amazon'
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    productImage: {
      type: String,
      default: ''
    },
    orderDate: {
      type: Date,
      required: true
    },
    deliveryDate: {
      type: Date,
      required: true
    },
    returnPeriod: {
      type: Number,
      default: 7
    },
    returnDeadline: {
      type: Date,
      required: true
    },
    replacementPeriod: {
      type: Number,
      default: 7
    },
    replacementDeadline: {
      type: Date,
      required: true
    },
    warrantyPeriod: {
      type: Number,
      default: 0
    },
    warrantyExpiry: {
      type: Date
    },
    urgencyStatus: {
      type: String,
      enum: ['Critical', 'Urgent', 'Safe', 'Expired'],
      default: 'Safe',
      index: true
    },
    warrantyStatus: {
      type: String,
      enum: ['Active', 'Expiring Soon', 'Expired', 'None'],
      default: 'None'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
