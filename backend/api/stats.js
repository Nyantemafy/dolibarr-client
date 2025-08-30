import express from 'express';
import db from '../src/db.js';
import Activites from '../src/models/activites.js';
import Membre from '../src/models/membre.js';

const router = express.Router();

const act = new Activites(db);
const membre = new Membre(db);

router.get('/act', async (req, res) => {
    try {
        const data = await act.stats();
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});
router.get('/act/:id_act', async (req, res) => {
    try {
        const id = req.params.id_act;
        const curAct = await Activites.get(db, id);
        const data = await curAct.stat();
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});

router.get('/sp', async (req, res) => {
    try {
        const data = await act.statsParSp();
        // console.log(data);

        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});
router.get('/sp/:id_act', async (req, res) => {
    try {
        const id = req.params.id_act;
        const curAct = await Activites.get(db, id);
        const data = await curAct.statParSp();
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});

router.get('/act_membre/:interv_date', async (req, res) => {
    const interv_date = req.params.interv_date;
    const interval = interv_date.split(".");
    const remise = interval[2] ?? 0;

    try {
        const data = await membre.stats(interval[0], interval[1], remise);
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});

router.get('/act_membre_inviter/:interv_date', async (req, res) => {
    const interv_date = req.params.interv_date;
    const interval = interv_date.split(".");
    const remise = interval[2] ?? 0;
    try {
        const data = await membre.statsAndPersonne(interval[0], interval[1], remise);
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});

export default router;