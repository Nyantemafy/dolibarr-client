import express from 'express';
import ManufacturingController from '../controller/ManufacturingController.js';

const router = express.Router();

router.post('/create', ManufacturingController.createManufacturingOrder);
router.get('/liste', ManufacturingController.getManufacturingOrders);
router.post('/validation/:id', ManufacturingController.validateOrder);
router.post('/produire/:id', ManufacturingController.produceOrder);
router.post('/orders/batch', ManufacturingController.createBatchManufacturingOrders);
router.get("/getById/:id", ManufacturingController.getManufacturingOrderById);
router.get("/fetchdetail/:id", ManufacturingController.fetchOrderWithDetails);
router.put('/update/:id', ManufacturingController.updateManufacturingOrder);
router.delete('/delete/:id', ManufacturingController.deleteManufacturingOrder);
router.post('/delete-multiple', ManufacturingController.deleteMultipleManufacturingOrders);

export default router;
