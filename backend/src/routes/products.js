import express from 'express';
import ProductController from '../controller/ProductController.js';

const router = express.Router();

router.get('/liste', ProductController.getAllProduct);
router.get("/getById/:id", ProductController.getProductById);

export default router;