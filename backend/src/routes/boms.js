import express from 'express';
import BOMsController from '../controller/BOMsController.js';

const router = express.Router();

router.get('/liste', BOMsController.getBOMs);
router.get('/details', BOMsController.getBOMDetails);
router.get('/:id/with-components', BOMsController.getBOMWithComponents);
router.post('/creat', BOMsController.createBOM);

export default router;
