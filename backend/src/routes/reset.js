import express from 'express';
import resetController from '../controller/resetController.js';

const router = express.Router();

router.get('/confirm', resetController.resetConfirm);
router.delete('/all', resetController.resetAllData);

export default router;
