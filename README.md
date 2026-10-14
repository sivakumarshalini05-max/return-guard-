# ReturnGuard – Smart Return & Replacement Deadline Tracker

> **“Never miss a return deadline again.”**

ReturnGuard is a full-stack SaaS web application that helps users manage online shopping orders across multiple platforms (Amazon, Flipkart, Myntra, Meesho, Ajio, etc.), track return and replacement deadlines, automatically calculate urgency scores, get AI-powered return assistance via Gemini, and monitor product warranties after return windows end.

---

## 🚀 Technology Stack

### Frontend
- **React** (v18)
- **Vite**
- **Tailwind CSS**
- **React Router** (v6)
- **Axios**
- **Lucide React Icons**

### Backend
- **Node.js** & **Express.js** (REST API Architecture)
- **MongoDB** & **Mongoose** (with seamless in-memory fallback store when local MongoDB daemon is not running)
- **JWT Authentication** & **Bcrypt.js** password hashing
- **Gemini AI API** (`@google/generative-ai`) for AI invoice deadline detection & Return Assistant chat

---

## 📁 Project Architecture

```text
ReturnGuard/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Logo, UrgencyBadge, WarrantyBadge, TimelineVisual, EmptyState, etc.
│   │   │   └── layout/       # Sidebar, Header, MainLayout
│   │   ├── context/          # AuthContext, OrderContext, NotificationContext
│   │   ├── pages/            # LoginPage, SignupPage, DashboardPage, MyOrdersPage, AddOrderPage, OrderDetailsPage, AIReturnAssistantPage, WarrantyTrackerPage, ProfileSettingsPage
│   │   ├── services/         # Axios API Client configuration
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/               # Database connection (Mongoose)
│   ├── controllers/          # authController, orderController, aiController
│   ├── middleware/           # JWT auth protect middleware, errorHandler
│   ├── models/               # User, Order, ChatMessage schemas
│   ├── routes/               # authRoutes, orderRoutes, aiRoutes
│   ├── utils/                # calculateDeadlines utility, memoryStore fallback
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── .env.example
└── README.md
```

---

## ⚡ Setup & Installation Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/returnguard
JWT_SECRET=returnguard_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** If `GEMINI_API_KEY` is not provided, ReturnGuard automatically uses intelligent pattern parsers and contextual responses so the app runs smoothly. If `MONGODB_URI` is not active, the system automatically uses an in-memory data store.

---

## 🏃 Running the Application

### Option A: Run Backend Server
In a terminal, navigate to `backend/` and run:

```bash
cd backend
npm install
npm start
```
*The backend server starts on `http://localhost:5000`*

### Option B: Run Frontend Client
In a separate terminal, navigate to `frontend/` and run:

```bash
cd frontend
npm install
npm run dev
```
*The frontend Vite dev server starts on `http://localhost:3000`*

---

## 🌟 Key Features

1. **Real Authentication**: Signup & Login with JWT session tokens and Bcrypt password hashing. Each user's data is strictly isolated.
2. **Multi-Platform Order Tracking**: Easily track Amazon, Flipkart, Myntra, Meesho, Ajio, and other custom platform orders.
3. **Smart Urgency Score Engine**:
   - 🔴 **Critical**: 0–1 days remaining
   - 🟠 **Urgent**: 2–3 days remaining
   - 🟢 **Safe**: 4+ days remaining
   - ⚫ **Expired**: Deadline passed
4. **AI Invoice & Text Scanner**: Extract order name, price, order date, delivery date, return window, and warranty period automatically from invoice text using Gemini AI!
5. **ReturnGuard AI Assistant**: Interactive chat interface providing contextual guidance on return eligibility, replacement options, and warranty claims based on active order data.
6. **Warranty Tracker**: Monitor manufacturer warranties even after return deadlines pass.
7. **In-App Notification Center**: Floating bell notification dropdown providing real-time alerts for critical deadlines and expiring warranties.
8. **Demo Data Generator**: 1-click option to seed 5 realistic sample orders with varied return deadlines and active warranties for testing.
