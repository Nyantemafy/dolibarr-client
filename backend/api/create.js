import express from 'express';
import db from '../src/db.js';
import Activites from '../src/models/activites.js';
import Presence from '../src/models/presence.js';
import Payement from '../src/models/payement.js';
const router = express.Router();

const act = new Activites(db);
const presence = new Presence(db);
const payement = new Payement(db);

router.post('/act', async (req, res) => {
    try {
        await act.create(req.body, res);
        res.json({ message: 'Activité ajoutée avec succès' });
    } catch (error) {
        return res.status(400).json({ error: `${error.message}` });
    }
});
router.post('/presence', async (req, res) => {
    try {
        await presence.create(req.body, res);
        res.json({ message: 'Présence enregistrée avec succès' });
    } catch (error) {
        return res.status(400).json({ error: `${error.message}` });
    }
});
router.post('/paiement', async (req, res) => {
    try {
        await payement.create(req.body, res);
        res.json({ message: 'Paiement effectué avec succès' });
    } catch (error) {
        return res.status(400).json({ error: `${error.message}` });
    }
});

export default router;