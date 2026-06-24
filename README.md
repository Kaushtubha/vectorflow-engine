# Vectorflow Engine

A production-grade, highly-optimized Product Browsing Platform designed to handle millions of records with cursor-based pagination.

## Features & Architecture

- **Cursor Pagination**: Uses composite cursors `(createdAt, id)` for stable, deterministic pagination that never skips or duplicates items during concurrent writes.
- **High Performance API**: Backend queries optimized using PostgreSQL composite indexes.
- **Data Scaling**: Batch-seeding script capable of inserting 200,000+ mock products.
- **Modern Dashboard**: Clean, responsive frontend built with Next.js 15, Framer Motion, and Tailwind CSS.
- **Production-Ready Backend**: Express.js/Node.js architecture with centralized error handling, Zod validation, Rate Limiting, Helmet, and Graceful Shutdown.

## 🏗️ Technology Stack

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Shadcn UI & Lucide Icons
- React Query (Infinite Scroll)

**Backend**
- Node.js & Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase / Neon)
- Zod, Helmet, Express-Rate-Limit

## 🚀 Getting Started

### 1. Database Setup
You will need a PostgreSQL database. You can create a free one on [Supabase](https://supabase.com) or [Neon](https://neon.tech).

### 2. Backend Setup
```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
```

Initialize the database schema:
```bash
npx prisma db push
```

Seed the massive dataset (200,000+ records):
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```

## 🧠 Engineering Decisions & Tradeoffs

### Why Cursor Pagination?
**The Problem with Offset Pagination (`LIMIT X OFFSET Y`)**:
1. **Performance**: The database must scan and skip `Y` rows before returning the result. For deep pages, this results in full table scans and high CPU usage.
2. **Inconsistency**: If new products are added while the user paginates, the data shifts. Users will see duplicate products or miss products entirely.

**The Solution (Cursor Pagination)**:
We index `(createdAt DESC, id DESC)` and query using a `WHERE` clause: `(createdAt, id) < (cursor.createdAt, cursor.id)`. 
- **O(1) Time Complexity**: The database instantly seeks the exact row using the B-Tree index.
- **Stable**: Modifying rows before the cursor has zero effect on the current page.

### Massive Batch Seeding
Inserting 200k records via a standard loop would take hours due to transaction overhead. We use `prisma.product.createMany` in chunks of 10,000 to maximize throughput, bringing the time down to mere seconds.

## 📈 Scalability

- **Database**: The composite index guarantees fast reads. We avoid table locking during reads.
- **Backend API**: Stateless design, easily horizontally scalable. Rate limiting and compression are built-in.
- **Frontend**: Utilizes Next.js App Router for optimal rendering, combined with intersection observers for efficient infinite scrolling DOM management.


