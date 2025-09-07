import express from 'express';
import ManufacturingController from '../controller/ManufacturingController.js';

const router = express.Router();

router.post('/create', ManufacturingController.createManufacturingOrder);
router.get('/liste', ManufacturingController.getManufacturingOrders);
router.post('/validation/:id', ManufacturingController.validateOrder);
router.post('/produire/:id', ManufacturingController.produceOrder);
router.post('/orders/batch', ManufacturingController.createBatchManufacturingOrders);

export default router;
