import express from 'express';
import ManufacturingController from '../controller/ManufacturingController.js';

const router = express.Router();

router.post('/create', ManufacturingController.createManufacturingOrder);
router.get('/liste', ManufacturingController.getManufacturingOrders);

export default router;
