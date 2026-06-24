import { Router } from 'express';
import { fetchProducts, fetchProductSummary, addProduct, editProduct, removeProduct } from '../controllers/product.controller';

const router = Router();

router.get('/', fetchProducts);
router.get('/summary', fetchProductSummary);
router.post('/', addProduct);
router.patch('/:id', editProduct);
router.delete('/:id', removeProduct);

export default router;
