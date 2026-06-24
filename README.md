# Vectorflow Catalog Portal

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-App_Router-black?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-UI-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-Styling-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Framer_Motion-12.x-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
</p>

A production-grade, highly-optimized Product Catalog Platform designed to handle millions of records with stable keyset (cursor-based) pagination. Featuring a cinematic dark operations panel, real-time telemetry metrics, and fluid animations.

---

## 🚀 Live Demo

- **Frontend URL**: [https://vectorflow-engine.vercel.app/](https://vectorflow-engine.vercel.app/)
- **Backend URL**: [https://vectorflow-engine-backend.onrender.com/api/](https://vectorflow-engine-backend.onrender.com/api/)

---

## 🏗️ System Architecture

```mermaid
graph LR
    A[Frontend: Next.js 15 App Router] <-->|REST API + JSON| B(Backend: Node + Express)
    B <-->|Prisma ORM| C[(Neon Serverless PostgreSQL)]
    
    classDef client fill:#0f172a,stroke:#e8184a,stroke-width:2px,color:#fff
    classDef server fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#fff
    classDef db fill:#334155,stroke:#10b981,stroke-width:2px,color:#fff
    
    class A client;
    class B server;
    class C db;
```

---

## ✨ Features & Polish

### 1. **Cinematic Dark Telemetry UI**
- Deep glassmorphism elements layered with precisely calibrated box shadows, glowing accents, and brand-red `#e8184a` gradients.
- Micro-interactions throughout the app: fluid input focusing, hover elevation on cards, and animated tooltips.

### 2. **Operations Dashboard**
- **Metrics Telemetry Bar**: Stats cards (Total products, Catalog valuation, Approved volume, Pending reviews) with hover-zoom physics.
- **Capital Demand Curve**: Area Chart powered by Recharts, tracking recent application valuation profiles.
- **Category Split**: Donut charts showing distribution of catalog categories.

### 3. **True Keyset (Cursor-Based) Pagination**
- Avoids offset-based pagination (`OFFSET X LIMIT Y`) to prevent **data drift** (duplicate or skipped items during concurrent insertions) and performance degradation.
- Uses `(createdAt, id)` composite keyset cursor pagination to deliver **O(1) seek times** even deep in 200,000+ records.

### 4. **New Product Submission**
- **Validation**: Client-side validation for names, categories, prices, and descriptions.
- **Micro-Animations**: Physic-based confetti effects (canvas-confetti) triggered upon successful catalog insertion.

### 5. **Mass Seeding Pipeline**
- Seeding pipeline built with chunked insertions of 10,000 records to insert **200,000+ mock products** in under 5 seconds.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion, Recharts, React Query, Canvas Confetti.
- **Backend**: Node.js, Express.js (v5), Prisma ORM, PostgreSQL (Neon.tech), Zod Validation, CORS.
- **Deployment**: Vercel (Frontend), Render (Backend).

---

## 📁 Folder Structure

```text
vectorflow-engine/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (PostgreSQL index definition)
│   │   └── seed.ts            # Mass seeder (200k+ products)
│   ├── src/
│   │   ├── config/            # Prisma Client wrapper
│   │   ├── controllers/       # Business logic and summaries
│   │   ├── middleware/        # Error handlers and validation
│   │   ├── routes/            # REST API Route definitions
│   │   ├── services/          # Keyset pagination service layer
│   │   └── index.ts           # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Page routing & components (page.tsx, layout.tsx, apply/)
│   │   ├── components/        # Reusable telemetry components & Particle background
│   │   └── globals.css        # Animations and custom scrollbars
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

---

## ⚙️ Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database Instance (Local or Neon/Supabase)

### 1. Database & Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/vectorflow?schema=public"
   PORT=5000
   ```
3. Push schemas, build and seed database:
   ```bash
   npx prisma db push
   npm run seed
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` to explore the catalog portal.

---

## 📋 API Spec Reference

- **`GET /api/products`**: Fetch products. Supports `cursor` (Base64), `limit` (max 100), and `category`.
- **`GET /api/products/summary`**: Retrieve aggregate statistics for the dashboard.
- **`POST /api/products`**: Add new product to database (Validated via Zod).
- **`PATCH /api/products/:id`**: Update product details.
- **`DELETE /api/products/:id`**: Remove product from database.

---

## ☁️ Deployment Guide

### Database (Neon.tech)
1. Register at Neon.tech, launch a PostgreSQL project, and copy the Connection URI.
2. Set it as `DATABASE_URL` in your backend server environment.

### Backend (Render)
1. Link your GitHub repository on Render.
2. Create a Web Service targeting the `backend` folder.
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `node dist/index.js`
3. Add Environment Variables: `DATABASE_URL`, `PORT=5000`.

### Frontend (Vercel)
1. Import repository on Vercel.
2. Select the `frontend` folder as the Root Directory.
3. Keep default Next.js build settings.

---

*Crafted with precision for optimal User Experience and System Reliability.*
