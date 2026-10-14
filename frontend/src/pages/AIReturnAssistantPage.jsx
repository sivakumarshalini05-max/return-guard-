import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Bot, User, Sparkles, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Package } from 'lucide-react';
import API from '../services/api';
import { useOrders } from '../context/OrderContext';
import AIIllustration from '../components/common/AIIllustration';

export const AIReturnAssistantPage = () => {
  const [searchParams] = useSearchParams();
  const selectedOrderId = searchParams.get('orderId');

  const { orders } = useOrders();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(selectedOrderId || '');
  const messagesEndRef = useRef(null);

  // Fetch Chat History on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/ai/history');
        if (res.data.success && res.data.history.length > 0) {
          setMessages(res.data.history);
        } else {
          // Welcome message
          setMessages([
            {
              role: 'assistant',
              content:
                'Hello! I am ReturnGuard AI - your personal return and warranty assistant. How can I help you with your order returns, replacements, or warranty claims today?'
            }
          ]);
        }
      } catch (err) {
        console.warn('Failed to load chat history:', err.message);
      }
    };
    fetchHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText || !messageText.trim()) return;

    const userMsg = {
      role: 'user',
      content: messageText
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await API.post('/ai/assistant', {
        message: messageText,
        selectedOrderId: activeOrderId
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an issue connecting to the AI assistant service. Please check your backend connection and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all AI assistant chat history?')) {
      try {
        await API.delete('/ai/history');
        setMessages([
          {
            role: 'assistant',
            content: 'Chat history cleared. How can I assist you next?'
          }
        ]);
      } catch (err) {
        alert('Failed to clear history.');
      }
    }
  };

  const presetQuestions = [
    'My headphones stopped working and I have 2 days left.',
    'What is Flipkart return vs replacement policy?',
    'How do I claim a manufacturer warranty after the return period?',
    'Which of my orders has an urgent return deadline?'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8 flex flex-col h-[calc(100vh-7rem)]">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>ReturnGuard AI</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                Smart Assistant
              </span>
            </h2>
            <p className="text-xs text-slate-500">Your personal return and warranty assistant.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Order Selector */}
          {orders.length > 0 && (
            <select
              value={activeOrderId}
              onChange={(e) => setActiveOrderId(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 max-w-[180px] truncate focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="">All Tracked Orders</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.productName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.length === 1 && (
          <div className="my-6">
            <AIIllustration />
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-md sm:max-w-lg p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-100 text-slate-900 font-normal rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}

                {/* Contextual Action Buttons */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          if (act.type === 'view_order' && act.orderId) {
                            navigate(`/orders/${act.orderId}`);
                          } else if (act.type === 'check_warranty') {
                            navigate('/warranty');
                          } else {
                            navigate('/orders');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-sm transition-all active:scale-95"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl text-xs font-semibold text-slate-500 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>ReturnGuard AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium rounded-full border border-slate-200 hover:border-blue-300 transition-all flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ReturnGuard AI about your returns, deadlines, or warranties..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AIReturnAssistantPage;
