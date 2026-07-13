# 🌱 AI Farmer Marketplace

A full-stack platform connecting farmers directly with buyers, powered by AI for crop price prediction, disease detection, demand forecasting, and smart advisory.

---

## 🚀 Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + Vite, React Router DOM v6, Axios, Bootstrap 5 |
| Backend | Node.js 20+, Express.js |
| Database | PostgreSQL 15+ |
| ORM | Prisma ORM |
| Auth | JWT (access + refresh tokens), bcrypt |
| AI | Google Gemini API + Gemini Vision |
| Image Storage | Cloudinary |
| Maps | Google Maps JavaScript API + Places API |
| Weather | OpenWeather API |
| Validation | Zod |
| State Management | Zustand |
| Charts | Recharts |
| PDF | pdf-lib |

---

## 📁 Project Structure

```
ai-farmer-marketplace/
├── client/          # React + Vite frontend
├── server/          # Express API backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   └── .env.example
└── README.md
```

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

```bash
# Server
cp server/.env.example server/.env
# Fill in all values in server/.env

# Client
cp client/.env.example client/.env
# Fill in all values in client/.env
```

### 3. Database Setup

```bash
cd server

# Run migrations
npx prisma migrate dev --name init

# Seed the database
node prisma/seed.js
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend (from /server)
npm run dev

# Terminal 2 - Frontend (from /client)
npm run dev
```

The API will be available at `http://localhost:5000`  
The client will be available at `http://localhost:5173`

---

## 👥 User Roles

- **FARMER** — List crops, manage orders, use AI tools (price prediction, disease detection, weather, cold storage)
- **BUYER** — Browse marketplace, place orders, manage wishlist
- **ADMIN** — Full platform management, analytics, user verification

---

## 🤖 AI Features

1. **Crop Price Prediction** — Get price forecasts for tomorrow and next week
2. **Demand Forecasting** — Understand market demand for your crops
3. **Disease Detection** — Upload leaf photos for AI-powered disease analysis
4. **Cold Storage Advisor** — Find nearby storage + store-vs-sell profit comparison
5. **Weather Dashboard** — 7-day forecast with farming advice
6. **AI Chat Assistant** — Bilingual (English/Tamil) farming advisor

---

## 🌐 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/users/me
PUT    /api/users/me
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/orders
POST   /api/orders
PATCH  /api/orders/:id/status
POST   /api/payments
POST   /api/predictions/price
GET    /api/predictions/price/history
POST   /api/forecast/demand
POST   /api/disease-detection/analyze
GET    /api/disease-detection/history
GET    /api/cold-storage/nearby
POST   /api/cold-storage/:id/book
GET    /api/weather/:district
POST   /api/chatbot/message
GET    /api/notifications
PATCH  /api/notifications/:id/read
GET    /api/admin/stats
```
