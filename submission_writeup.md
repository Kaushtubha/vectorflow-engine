# CodeVector Take-Home Task: Submission Writeup

## 1. Architectural Choices & Rationale

### Choice 1: Keyset (Cursor-Based) Pagination
To satisfy the requirement of showing correct data without duplicates or missed items when new products are added during browsing, I chose **Cursor-Based Pagination** over offset-based pagination.
- **Why**: Offset-based pagination (`OFFSET X LIMIT Y`) suffers from the "drift" problem. If 50 new items are inserted at the beginning of the table while a user is paginates, the data shifts down. When the user requests the next page, they see 50 duplicate items. If items are deleted, they miss items. Cursor pagination queries relative to a specific record: `WHERE (createdAt, id) < (cursorTimestamp, cursorId)`. Since the reference point is fixed, inserts or deletes ahead of the cursor do not cause duplicate or missing records.
- **Performance**: Offset pagination has \(O(N)\) time complexity because the database must scan through \(N\) rows to skip them. At 200,000+ records, querying deep pages (e.g., page 5000) causes full-table scans. Cursor pagination has \(O(1)\) time complexity because PostgreSQL instantly seeks the cursor record using a composite B-Tree index.

### Choice 2: Composite B-Tree Indexing in PostgreSQL
I configured a composite index on `(createdAt DESC, id DESC)` in Prisma:
```prisma
@@index([createdAt(sort: Desc), id(sort: Desc)])
```
- **Why**: When sorting by `createdAt DESC, id DESC`, the database needs a matching composite index to satisfy the ordering and inequality filters (`lt: cursor.createdAt` OR `lt: cursor.id`) without performing expensive in-memory file sorts (filesort).

### Choice 3: PostgreSQL Batch Seeding (10k Batch Size)
To seed 200,000 products quickly, inserting row-by-row in a loop would create 200,000 separate network roundtrips and database transactions, taking minutes. I used Prisma's `createMany` API with a batch size of `10,000` records.
- **Why**: This minimizes connection overhead and fits comfortably within PostgreSQL's parameter limit, seeding the entire dataset in under 5 seconds.

---

## 2. What I Would Improve with More Time
- **Dynamic Sharding / Partitioning**: At 200,000 items, PostgreSQL indexes fit easily into RAM. However, if the dataset grows to hundreds of millions, we would need database partitioning (sharding by `category` or `createdAt` ranges) to keep index seek times fast.
- **Redis Cache Layer**: Add a Redis cache for the first few pages of the most active categories. This would prevent hitting the database for the most commonly accessed landing streams.
- **Cursor Encryption**: Currently, cursors are Base64 encoded strings containing `createdAt` and `id`. Encrypting them symmetrically (e.g., AES-256) would prevent users from reverse-engineering IDs or database structures.


