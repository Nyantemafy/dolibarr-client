import express from 'express';
import BOMsController from '../controller/BOMsController.js';

const router = express.Router();

router.get('/liste', BOMsController.getBOMs);
router.get('/details', BOMsController.getBOMDetails);

export default router;
