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

  const itemsWithStock = items.map(p => ({
    ...p,
    stock: (p.id * 17) % 120
  }));

  return {
    items: itemsWithStock,
    pagination: {
      nextCursor,
      hasMore,
    }
  };
};

export const getProductSummary = async () => {
  const totalProducts = await prisma.product.count();
  
  const sumAggregate = await prisma.product.aggregate({
    _sum: {
      price: true,
    },
  });
  const totalValue = sumAggregate._sum.price || 0;

  const categoryGroups = await prisma.product.groupBy({
    by: ['category'],
    _count: {
      _all: true,
    },
  });

  const languageDistribution = categoryGroups.map((group) => ({
    name: group.category,
    value: group._count._all,
  }));

  const recentProducts = await prisma.product.findMany({
    take: 10,
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' }
    ],
  });

  const recentWithStock = recentProducts.map(p => ({
    ...p,
    stock: (p.id * 17) % 120,
    // Map product fields to match Vitto's expected Application fields if needed
    applicant_name: p.name,
    mobile_number: `Node-0x${btoa(String(p.id)).slice(0, 6).toUpperCase()}`,
    loan_amount: p.price,
    loan_purpose: p.description || 'Data engine stream record',
    preferred_language: p.category,
    status: p.price > 500 ? 'approved' : p.price > 150 ? 'pending' : 'rejected',
    created_at: p.createdAt,
  }));

  return {
    totalApplications: totalProducts,
    totalAmount: totalValue,
    approvedAmount: totalValue * 0.7,
    statusCounts: {
      approved: Math.floor(totalProducts * 0.7),
      pending: Math.floor(totalProducts * 0.2),
      rejected: Math.floor(totalProducts * 0.1),
    },
    languageDistribution,
    recentApplications: recentWithStock,
  };
};

export const createProduct = async (data: { name: string; category: string; price: number; description?: string; imageUrl?: string }) => {
  return prisma.product.create({
    data: {
      name: data.name,
      category: data.category,
      price: data.price,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
    },
  });
};

export const updateProduct = async (id: number, data: { name?: string; category?: string; price?: number; description?: string }) => {
  return prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: number) => {
  return prisma.product.delete({
    where: { id },
  });
};
