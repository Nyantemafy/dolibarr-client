import express from 'express';
import create from './create.js';
import stats from './stats.js';
import tableData from './data.js'

const router = express.Router();

router.get('/', async (req, res) => {
    res.json({ msg: "hello" })
});

router.use('/create', create);
router.use('/stats', stats);
router.use('/data', tableData);

export default router;