import express from 'express';
import WarehouseController from '../controller/WarehouseController.js';

const router = express.Router();

router.get('/liste', WarehouseController.getAllWarehouse);
router.post('/create', WarehouseController.createWarehouse);

export default router;