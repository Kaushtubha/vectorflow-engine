import { Request, Response, NextFunction } from 'express';
import { getProducts } from '../services/product.service';
import { z } from 'zod';

const getProductsSchema = z.object({
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 20)),
  category: z.string().optional(),
  cursor: z.string().optional(),
});

export const fetchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, category, cursor } = getProductsSchema.parse(req.query);
    
    // Cap limit to 100 max to prevent abuse
    const safeLimit = Math.min(limit, 100);

    const result = await getProducts(safeLimit, category, cursor);

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
