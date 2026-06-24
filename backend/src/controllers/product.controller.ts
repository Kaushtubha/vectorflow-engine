import { Request, Response, NextFunction } from 'express';
import { getProducts, getProductSummary, createProduct, updateProduct, deleteProduct } from '../services/product.service';
import { z } from 'zod';

const getProductsSchema = z.object({
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 20)),
  category: z.string().optional(),
  cursor: z.string().optional(),
});

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

const updateProductSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0.01).optional(),
  description: z.string().optional(),
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

export const fetchProductSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getProductSummary();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedData = createProductSchema.parse(req.body);
    const result = await createProduct(parsedData);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const editProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parsedData = updateProductSchema.parse(req.body);
    const result = await updateProduct(parseInt(id, 10), parsedData);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await deleteProduct(parseInt(id, 10));
    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
