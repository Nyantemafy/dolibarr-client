import express from 'express';
import importController from '../controller/importController.js';

const router = express.Router();

router.post('/products', importController.importProducts);
router.post('/boms', importController.importBOMs);

export default router;
