import express from 'express';
import importController from '../controller/importController.js';

const router = express.Router();

router.post('/importAll', importController.importAll);
router.post('/preview', importController.previewImport);

export default router;
