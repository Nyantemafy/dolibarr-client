import express from 'express';
import importController from '../controller/importController.js';

const router = express.Router();

router.post('/importAll', importController.importAll);

export default router;
