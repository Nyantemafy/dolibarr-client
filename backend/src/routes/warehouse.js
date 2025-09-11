import express from 'express';
import WarehouseController from '../controller/WarehouseController.js';

const router = express.Router();

router.get('/liste', WarehouseController.getAllWarehouse);

export default router;