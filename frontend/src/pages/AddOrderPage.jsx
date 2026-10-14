import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Save, ArrowLeft, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import API from '../services/api';

export const AddOrderPage = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const { orders, addOrder, editOrder } = useOrders();
  const navigate = useNavigate();

  // Form State
  const [productName, setProductName] = useState('');
  const [platform, setPlatform] = useState('Amazon');
  const [price, setPrice] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnPeriod, setReturnPeriod] = useState(7);
  const [replacementPeriod, setReplacementPeriod] = useState(7);
  const [warrantyPeriod, setWarrantyPeriod] = useState(12);
  const [productImage, setProductImage] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [invoiceText, setInvoiceText] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiDetectedData, setAiDetectedData] = useState(null);

  // If editing an order
  useEffect(() => {
    if (editId) {
      const existing = orders.find((o) => o._id === editId);
      if (existing) {
        setProductName(existing.productName || '');
        setPlatform(existing.platform || 'Amazon');
        setPrice(existing.price !== undefined ? existing.price : '');
        setOrderDate(existing.orderDate ? new Date(existing.orderDate).toISOString().split('T')[0] : '');
        setDeliveryDate(existing.deliveryDate ? new Date(existing.deliveryDate).toISOString().split('T')[0] : '');
        setReturnPeriod(existing.returnPeriod || 7);
        setReplacementPeriod(existing.replacementPeriod || 7);
        setWarrantyPeriod(existing.warrantyPeriod || 0);
        setProductImage(existing.productImage || '');
        setNotes(existing.notes || '');
      }
    }
  }, [editId, orders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!productName.trim()) {
      setError('Product name is required');
      return;
    }

    if (price === '' || isNaN(price) || Number(price) < 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productName: productName.trim(),
        platform,
        price: Number(price),
        orderDate,
        deliveryDate,
        returnPeriod: Number(returnPeriod),
        replacementPeriod: Number(replacementPeriod),
        warrantyPeriod: Number(warrantyPeriod),
        productImage: productImage.trim(),
        notes: notes.trim()
      };

      if (editId) {
        await editOrder(editId, payload);
      } else {
        await addOrder(payload);
      }
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save order. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiScan = async () => {
    if (!invoiceText || !invoiceText.trim()) {
      alert('Please paste invoice or order text to analyze');
      return;
    }

    setAiAnalyzing(true);
    setError('');
    try {
      const res = await API.post('/ai/deadline-detection', { text: invoiceText });
      if (res.data.success && res.data.data) {
        setAiDetectedData(res.data.data);
      }
    } catch (err) {
      alert('AI deadline detection failed. Using default form parser.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const applyAiData = () => {
    if (aiDetectedData) {
      if (aiDetectedData.productName) setProductName(aiDetectedData.productName);
      if (aiDetectedData.platform) setPlatform(aiDetectedData.platform);
      if (aiDetectedData.price) setPrice(aiDetectedData.price);
      if (aiDetectedData.orderDate) setOrderDate(aiDetectedData.orderDate);
      if (aiDetectedData.deliveryDate) setDeliveryDate(aiDetectedData.deliveryDate);
      if (aiDetectedData.returnPeriod !== undefined) setReturnPeriod(aiDetectedData.returnPeriod);
      if (aiDetectedData.replacementPeriod !== undefined) setReplacementPeriod(aiDetectedData.replacementPeriod);
      if (aiDetectedData.warrantyPeriod !== undefined) setWarrantyPeriod(aiDetectedData.warrantyPeriod);
      if (aiDetectedData.notes) setNotes(aiDetectedData.notes);
    }
    setShowAiModal(false);
    setAiDetectedData(null);
    setInvoiceText('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {editId ? 'Edit Tracked Order' : 'Track New Order'}
            </h2>
            <p className="text-xs text-slate-500">
              {editId
                ? 'Update order details and recalculate deadlines'
                : 'Enter order details or use AI to scan your invoice text'}
            </p>
          </div>
        </div>

        {/* AI Scanner Trigger Button */}
        {!editId && (
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>AI Invoice Scanner</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Order Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Product Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Product Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Platform *
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            >
              <option value="Amazon">Amazon</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Myntra">Myntra</option>
              <option value="Meesho">Meesho</option>
              <option value="Ajio">Ajio</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Price (₹) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="2499"
              min="0"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
          </div>

          {/* Order Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Order Date *
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Delivery Date *
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
          </div>

          {/* Return Period */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Return Period (Days)
            </label>
            <input
              type="number"
              value={returnPeriod}
              onChange={(e) => setReturnPeriod(e.target.value)}
              placeholder="7"
              min="0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Standard return policy duration</span>
          </div>

          {/* Replacement Period */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Replacement Period (Days)
            </label>
            <input
              type="number"
              value={replacementPeriod}
              onChange={(e) => setReplacementPeriod(e.target.value)}
              placeholder="7"
              min="0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Replacement eligibility window</span>
          </div>

          {/* Warranty Period */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Warranty Period (Months)
            </label>
            <input
              type="number"
              value={warrantyPeriod}
              onChange={(e) => setWarrantyPeriod(e.target.value)}
              placeholder="12"
              min="0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Manufacturer warranty duration (0 if none)
            </span>
          </div>

          {/* Product Image URL */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Product Image URL (Optional)
            </label>
            <input
              type="url"
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Notes & Invoice Details (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes carrying case and charging cable. Keep box for returns."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editId ? 'Update Order' : 'Save Order & Track Deadlines'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Invoice Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-black text-slate-900 text-lg">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>AI Deadline & Invoice Detector</span>
              </div>
              <button
                onClick={() => {
                  setShowAiModal(false);
                  setAiDetectedData(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Paste order confirmation text, invoice summary, or return policy snippet. Gemini AI will extract key details and pre-fill your form automatically!
            </p>

            {!aiDetectedData ? (
              <div className="space-y-4">
                <textarea
                  rows="6"
                  value={invoiceText}
                  onChange={(e) => setInvoiceText(e.target.value)}
                  placeholder={`Example text:\n"Product: Sony Headphones\nPlatform: Flipkart\nPrice: Rs 2,499\nOrder date: 25 Sept 2026\nDelivery date: 26 Sept 2026\nReturn policy: Product can be returned within 7 days from delivery. Includes 12 months manufacturer warranty."`}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAiScan}
                    disabled={aiAnalyzing}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-70"
                  >
                    {aiAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing invoice with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Extract Order Details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>AI Successfully Detected Information:</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60">
                  <div><strong className="text-slate-900">Product:</strong> {aiDetectedData.productName}</div>
                  <div><strong className="text-slate-900">Platform:</strong> {aiDetectedData.platform}</div>
                  <div><strong className="text-slate-900">Price:</strong> ₹{aiDetectedData.price}</div>
                  <div><strong className="text-slate-900">Return Period:</strong> {aiDetectedData.returnPeriod} days</div>
                  <div><strong className="text-slate-900">Warranty:</strong> {aiDetectedData.warrantyPeriod} months</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setAiDetectedData(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl"
                  >
                    Re-scan Text
                  </button>
                  <button
                    onClick={applyAiData}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
                  >
                    <span>Apply & Pre-fill Form</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOrderPage;
