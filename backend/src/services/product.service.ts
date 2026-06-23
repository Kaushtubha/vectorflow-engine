import prisma from '../config/db';
import { decodeCursor, encodeCursor } from '../utils/pagination';
import { Prisma } from '@prisma/client';

export const getProducts = async (limit: number, category?: string, cursor?: string) => {
  let cursorCondition: Prisma.ProductWhereInput = {};
  
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      // TRUE Cursor Pagination logic:
      // (createdAt, id) < (cursor.createdAt, cursor.id)
      // Since SQL doesn't always support tuple comparison natively across all ORMs perfectly, 
      // we use OR conditions:
      // 1. createdAt < cursor.createdAt
      // OR
      // 2. createdAt == cursor.createdAt AND id < cursor.id
      cursorCondition = {
        OR: [
          {
            createdAt: {
              lt: new Date(decoded.createdAt),
            },
          },
          {
            createdAt: new Date(decoded.createdAt),
            id: {
              lt: decoded.id,
            },
          },
        ],
      };
    }
  }

  const whereCondition: Prisma.ProductWhereInput = {
    ...(category ? { category } : {}),
    ...cursorCondition,
  };

  const products = await prisma.product.findMany({
    where: whereCondition,
    take: limit + 1, // Fetch one extra to determine if there's a next page
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' }
    ],
  });

  const hasMore = products.length > limit;
  const items = hasMore ? products.slice(0, -1) : products;
  
  let nextCursor = null;
  if (hasMore) {
    const lastItem = items[items.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastItem.createdAt.toISOString(),
      id: lastItem.id,
    });
  }

  return {
    items,
    pagination: {
      nextCursor,
      hasMore,
    }
  };
};
