import express from 'express';
import StatistiqueController from '../controller/StatistiqueController.js';

const router = express.Router();

router.get('/liste', StatistiqueController.getStatistiquesParDate);

export default router;
