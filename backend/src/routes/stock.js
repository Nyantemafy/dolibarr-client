import express from 'express';
import StockController from '../controller/StockController.js';

const router = express.Router();

router.get('/liste', StockController.getStockList);
router.get('/movements/:productId', StockController.getProductMovements);

export default router;
