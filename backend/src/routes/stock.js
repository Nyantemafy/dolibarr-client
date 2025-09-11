import express from 'express';
import StockController from '../controller/StockController.js';

const router = express.Router();

router.get('/liste', StockController.getStockList);
router.get('/movements/:productId', StockController.getProductMovements);
router.post('/transfer', StockController.transferStock);
router.post('/bulk-correct', StockController.bulkCorrectStock);
router.post('/bulk-transfer', StockController.bulkTransferStock);

export default router;
