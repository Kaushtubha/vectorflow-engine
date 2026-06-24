# Vectorflow Engine

Vectorflow Engine is a production-grade, highly-optimized Product Catalog Platform designed to handle millions of records with stable keyset (cursor-based) pagination. 

This repository was developed to demonstrate backend performance scaling, index optimization, and high-fidelity telemetry dashboard implementation.

## 🚀 Deployed Links

- **Frontend Application**: [vectorflow-engine.vercel.app](https://vectorflow-engine.vercel.app)
- **Backend API Engine**: [vectorflow-engine-backend.onrender.com/api](https://vectorflow-engine-backend.onrender.com/api)
- **Database Layer**: Neon Serverless PostgreSQL (US East AWS)

---

## 🏗️ Architecture & Folder Structure

The project is structured as a monorepo containing a decoupled frontend and backend:

```text
├── backend/            # Node.js & Express API with Prisma ORM
│   ├── prisma/         # Database schema and seeding scripts
│   └── src/            # Controllers, Services, Middlewares, and Routes
├── frontend/           # Next.js 15 App Router client
│   └── src/            # Components, styles, and state management
└── README.md           # Documentation
```

### Flow Diagram
```text
[ Next.js 15 Client ] ──(HTTP)──> [ Express.js API ] ──(Prisma)──> [ Neon PostgreSQL ]
```

---

## ⚡ Engineering & Technical Decisions

### 1. Keyset (Cursor-Based) Pagination
To satisfy pagination consistency under active database mutations (inserts/deletes), we avoided offset-based pagination (`OFFSET X LIMIT Y`) due to:
- **Data Drift**: If new records are added while a user paginates, the table offsets shift down, causing the user to see duplicate items on page transitions.
- **O(N) Performance degradation**: Offset pagination requires scanning and discarding `N` rows, which degrades performance on deep pages.

**Our Solution**:
We implement a composite keyset cursor using `(createdAt, id)` to seek records directly:
```sql
WHERE (createdAt, id) < (cursor.createdAt, cursor.id)
```
Since Prisma doesn't natively support SQL tuple comparisons, we expand the criteria into boolean OR logic in our service layer:
```typescript
{
  OR: [
    { createdAt: { lt: cursor.createdAt } },
    { createdAt: cursor.createdAt, id: { lt: cursor.id } }
  ]
}
```
This ensures a stable query timeline that never skips or repeats records during concurrent catalog updates, operating at `O(1)` complexity.

### 2. Composite Database Indexing
To support the keyset pagination sorting order `(createdAt DESC, id DESC)` and avoid costly in-memory file sorting, we created a composite index:
```prisma
@@index([createdAt(sort: Desc), id(sort: Desc)])
```
PostgreSQL uses this index to satisfy both the inequality filter and the sort order instantly.

### 3. Mass Seeding Pipeline
Inserting 200,000 products row-by-row would cause massive connection overhead and transaction locks. We wrote a seeding pipeline in `prisma/seed.ts` that batches inserts using `createMany` in chunks of 10,000 records. This seeds the entire dataset of **200,000+ items in under 5 seconds**.

---

## 🔌 API Endpoints

### Products
- `GET /api/products` - List products with cursor pagination, limit, and category filter.
  - Query Params: `limit` (max 100), `category` (optional), `cursor` (Base64 encoded string containing `{ createdAt, id }`).
- `GET /api/products/summary` - Fetch database statistics and category distributions.
- `POST /api/products` - Add a new product to the catalog. (Payload validated via Zod).
- `PATCH /api/products/:id` - Edit product details.
- `DELETE /api/products/:id` - Delete a product.

---

## 🎨 Frontend UI & Telemetry

The frontend is a dark glassmorphic dashboard built using **Next.js 15 (App Router)**, **React Query**, **Framer Motion**, and **Tailwind CSS**:
- **Real-Time Telemetry**: Real-time metrics showing total catalog valuation, total products, approval volume, and status distributions.
- **Live Status Feed**: Connected directly to the Neon PostgreSQL instance, updating statistics as mutations happen.
- **Interactive Forms**: Adding new products triggers micro-animations and physics-based confetti effects on success.
- **Optimized Pagination**: Fluid catalog scrolling utilizing keyset cursor-based transitions.

---

## 🛠️ Local Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database Instance

### 1. Backend Setup
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Set your `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
   ```
4. Push the schema to the database:
   ```bash
   npx prisma db push
   ```
5. Seed the database with 200k+ products:
   ```bash
   npm run seed
   ```
6. Start the Express dev server:
   ```bash
   npm run dev
   ```
   *(Running on `http://localhost:5000`)*

### 2. Frontend Setup
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *(Running on `http://localhost:3000`)*
