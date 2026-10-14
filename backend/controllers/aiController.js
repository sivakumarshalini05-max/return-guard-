import { GoogleGenerativeAI } from '@google/generative-ai';
import Order from '../models/Order.js';
import ChatMessage from '../models/ChatMessage.js';
import { isDBConnected } from '../config/db.js';
import { calculateOrderDeadlines } from '../utils/calculateDeadlines.js';
import { memoryStore } from '../utils/memoryStore.js';

// Initialize Gemini AI client safely
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// Fallback pattern extraction when Gemini key is absent
const parseInvoiceWithRegex = (text) => {
  const result = {
    productName: '',
    platform: 'Amazon',
    price: 0,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    returnPeriod: 7,
    replacementPeriod: 7,
    warrantyPeriod: 12,
    notes: 'Extracted via ReturnGuard AI text scanner.'
  };

  const priceMatch = text.match(/(?:₹|Rs\.?|INR|\$)\s*([\d,]+(?:\.\d+)?)/i) || text.match(/price[:\s]+([\d,]+)/i);
  if (priceMatch) {
    result.price = parseFloat(priceMatch[1].replace(/,/g, ''));
  }

  if (/flipkart/i.test(text)) result.platform = 'Flipkart';
  else if (/myntra/i.test(text)) result.platform = 'Myntra';
  else if (/meesho/i.test(text)) result.platform = 'Meesho';
  else if (/ajio/i.test(text)) result.platform = 'Ajio';
  else if (/amazon/i.test(text)) result.platform = 'Amazon';

  const returnMatch = text.match(/(\d+)\s*(?:days?|day)\s*(?:return|replaceable|replacement|policy)/i) || text.match(/return\s*(?:within|period)?\s*(\d+)\s*days?/i);
  if (returnMatch) {
    result.returnPeriod = parseInt(returnMatch[1], 10);
  }

  const warrantyMatch = text.match(/(\d+)\s*(?:months?|month|year|years?)\s*warranty/i);
  if (warrantyMatch) {
    let num = parseInt(warrantyMatch[1], 10);
    if (/year/i.test(warrantyMatch[0])) num *= 12;
    result.warrantyPeriod = num;
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    result.productName = lines[0].substring(0, 60);
  } else {
    result.productName = 'Parsed Item';
  }

  return result;
};

// @desc    Analyze invoice or paste text to detect return/warranty deadlines using Gemini AI
// @route   POST /api/ai/deadline-detection
// @access  Private
export const analyzeDeadlineText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text or invoice information to analyze'
      });
    }

    const model = getGeminiModel();
    let extractedData = null;

    if (model) {
      try {
        const prompt = `
You are an expert e-commerce invoice and deadline parser for ReturnGuard.
Extract order details from the text below and return ONLY a valid JSON object without markdown formatting or code blocks.

JSON Schema:
{
  "productName": "String",
  "platform": "Amazon" | "Flipkart" | "Myntra" | "Meesho" | "Ajio" | "Other",
  "price": Number,
  "orderDate": "YYYY-MM-DD",
  "deliveryDate": "YYYY-MM-DD",
  "returnPeriod": Number (days, e.g. 7),
  "replacementPeriod": Number (days, e.g. 7),
  "warrantyPeriod": Number (months, e.g. 12),
  "notes": "Brief summary of policies found"
}

Notes on fields:
- If delivery date is not specified, use order date or today.
- Default returnPeriod to 7 if mentioned or standard, default replacementPeriod to 7, warrantyPeriod to 12 if mentioned else 0.
- Today's date is ${new Date().toISOString().split('T')[0]}.

Input text:
"""
${text}
"""
`;

        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        }
      } catch (geminiError) {
        console.warn('Gemini extraction warning, falling back to pattern parser:', geminiError.message);
      }
    }

    if (!extractedData) {
      extractedData = parseInvoiceWithRegex(text);
    }

    const calculated = calculateOrderDeadlines({
      orderDate: extractedData.orderDate || new Date(),
      deliveryDate: extractedData.deliveryDate || new Date(),
      returnPeriod: extractedData.returnPeriod || 7,
      replacementPeriod: extractedData.replacementPeriod || 7,
      warrantyPeriod: extractedData.warrantyPeriod || 0
    });

    res.json({
      success: true,
      data: {
        ...extractedData,
        returnDeadline: calculated.returnDeadline,
        replacementDeadline: calculated.replacementDeadline,
        warrantyExpiry: calculated.warrantyExpiry,
        urgencyStatus: calculated.urgencyStatus,
        warrantyStatus: calculated.warrantyStatus
      }
    });
  } catch (error) {
    console.error('AI Deadline detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI deadline detection',
      error: error.message
    });
  }
};

// @desc    Interactive Return & Warranty AI Assistant
// @route   POST /api/ai/assistant
// @access  Private
export const chatAssistant = async (req, res) => {
  try {
    const { message, selectedOrderId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    // Save user message
    if (isDBConnected()) {
      try {
        await ChatMessage.create({ userId, role: 'user', content: message });
      } catch (e) {
        await memoryStore.createChatMessage({ userId, role: 'user', content: message });
      }
    } else {
      await memoryStore.createChatMessage({ userId, role: 'user', content: message });
    }

    // Fetch user's orders context
    let userOrders = [];
    if (isDBConnected()) {
      try {
        userOrders = await Order.find({ userId }).sort({ createdAt: -1 });
      } catch (e) {
        userOrders = await memoryStore.findOrders(userId, {});
      }
    } else {
      userOrders = await memoryStore.findOrders(userId, {});
    }

    const processedOrders = userOrders.map(o => {
      const calc = calculateOrderDeadlines({
        orderDate: o.orderDate,
        deliveryDate: o.deliveryDate,
        returnPeriod: o.returnPeriod,
        replacementPeriod: o.replacementPeriod,
        warrantyPeriod: o.warrantyPeriod
      });
      return {
        id: o._id.toString(),
        productName: o.productName,
        platform: o.platform,
        price: o.price,
        returnDeadline: calc.returnDeadline.toISOString().split('T')[0],
        daysRemaining: calc.daysRemaining,
        urgencyStatus: calc.urgencyStatus,
        warrantyStatus: calc.warrantyStatus,
        warrantyExpiry: calc.warrantyExpiry ? calc.warrantyExpiry.toISOString().split('T')[0] : 'None'
      };
    });

    const model = getGeminiModel();
    let aiResponseText = '';
    let suggestedActions = [];

    let targetOrder = null;
    if (selectedOrderId) {
      targetOrder = processedOrders.find(o => o.id === selectedOrderId);
    }

    if (model) {
      try {
        const contextStr = processedOrders.length > 0
          ? JSON.stringify(processedOrders, null, 2)
          : 'User has no orders saved yet.';

        const prompt = `
You are ReturnGuard AI - a friendly, highly intelligent return deadline and warranty assistant.
Your goal is to provide clear, actionable advice regarding return windows, replacement eligibility, consumer protection, and product warranties.

Guidelines:
1. Be concise, direct, professional, and helpful.
2. Consider the user's order database context provided below.
3. If the user asks about a specific product or issue, reference their return deadline and warranty status accurately.
4. Do NOT invent false platform policies. Clarify retailer return periods (e.g. Amazon 7-10 days, Flipkart 7 days, Myntra 7-14 days).
5. If details are missing, politely ask the user to clarify.

User's tracked orders:
${contextStr}

Selected order context (if any):
${targetOrder ? JSON.stringify(targetOrder, null, 2) : 'None selected'}

User Question:
"${message}"
`;

        const result = await model.generateContent(prompt);
        aiResponseText = result.response.text().trim();
      } catch (geminiError) {
        console.warn('Gemini chat assistant warning:', geminiError.message);
      }
    }

    if (!aiResponseText) {
      if (targetOrder) {
        if (targetOrder.daysRemaining >= 0) {
          aiResponseText = `Regarding **${targetOrder.productName}** on ${targetOrder.platform}:\n\n` +
            `• **Return Deadline:** You have **${targetOrder.daysRemaining} day(s)** remaining (Deadline: ${targetOrder.returnDeadline}).\n` +
            `• **Urgency Status:** ${targetOrder.urgencyStatus === 'Critical' ? '🔴 Critical' : targetOrder.urgencyStatus === 'Urgent' ? '🟠 Urgent' : '🟢 Safe'}\n` +
            `• **Warranty:** ${targetOrder.warrantyStatus} (Expires ${targetOrder.warrantyExpiry}).\n\n` +
            `If the product is damaged or defective, navigate to your ${targetOrder.platform} account > My Orders and initiate return/replacement before the deadline expires.`;
        } else {
          aiResponseText = `The return period for **${targetOrder.productName}** has passed (${targetOrder.daysRemaining * -1} days ago).\n\n` +
            `However, your **Warranty** status is **${targetOrder.warrantyStatus}** (valid until ${targetOrder.warrantyExpiry}). For hardware issues, you can file a manufacturer warranty claim using your invoice!`;
        }
      } else if (processedOrders.length > 0) {
        const criticalOrder = processedOrders.find(o => o.urgencyStatus === 'Critical' || o.urgencyStatus === 'Urgent');
        if (criticalOrder) {
          aiResponseText = `I noticed you have an urgent return pending for **${criticalOrder.productName}** on ${criticalOrder.platform}.\n\n` +
            `• Return deadline: **${criticalOrder.returnDeadline}** (${criticalOrder.daysRemaining} days left).\n` +
            `• Status: **${criticalOrder.urgencyStatus}**\n\n` +
            `How can I assist you with this item, or would you like guidance on filing a return or warranty claim?`;
        } else {
          aiResponseText = `You have ${processedOrders.length} order(s) currently tracked in ReturnGuard. All return deadlines are currently in a Safe state! You can select any order to review return procedures or warranty coverage details.`;
        }
      } else {
        aiResponseText = `Welcome to ReturnGuard AI! I can assist you with tracking return deadlines, calculating replacement windows, and managing warranty claims.\n\nTo get started, add your first order on the Dashboard or Add Order page!`;
      }
    }

    if (targetOrder) {
      suggestedActions.push({
        label: `View ${targetOrder.productName.substring(0, 20)}...`,
        type: 'view_order',
        orderId: targetOrder.id
      });
      if (targetOrder.warrantyStatus !== 'None' && targetOrder.warrantyStatus !== 'Expired') {
        suggestedActions.push({
          label: 'Check Warranty',
          type: 'check_warranty',
          orderId: targetOrder.id
        });
      }
    } else if (processedOrders.length > 0) {
      suggestedActions.push({
        label: 'View Urgent Returns',
        type: 'view_orders',
        orderId: ''
      });
    }

    let assistantMsg;
    if (isDBConnected()) {
      try {
        assistantMsg = await ChatMessage.create({
          userId,
          role: 'assistant',
          content: aiResponseText,
          suggestedActions
        });
      } catch (e) {
        assistantMsg = await memoryStore.createChatMessage({
          userId,
          role: 'assistant',
          content: aiResponseText,
          suggestedActions
        });
      }
    } else {
      assistantMsg = await memoryStore.createChatMessage({
        userId,
        role: 'assistant',
        content: aiResponseText,
        suggestedActions
      });
    }

    res.json({
      success: true,
      message: assistantMsg
    });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI chat response',
      error: error.message
    });
  }
};

// @desc    Get Chat History for User
// @route   GET /api/ai/history
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    let history = [];
    if (isDBConnected()) {
      try {
        history = await ChatMessage.find({ userId: req.user.id })
          .sort({ createdAt: 1 })
          .limit(50);
      } catch (e) {
        history = await memoryStore.getChatHistory(req.user.id);
      }
    } else {
      history = await memoryStore.getChatHistory(req.user.id);
    }

    res.json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve chat history' });
  }
};

// @desc    Clear Chat History for User
// @route   DELETE /api/ai/history
// @access  Private
export const clearChatHistory = async (req, res) => {
  try {
    if (isDBConnected()) {
      try {
        await ChatMessage.deleteMany({ userId: req.user.id });
      } catch (e) {
        await memoryStore.clearChatHistory(req.user.id);
      }
    } else {
      await memoryStore.clearChatHistory(req.user.id);
    }
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear chat history' });
  }
};
