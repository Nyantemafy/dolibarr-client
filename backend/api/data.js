import express from 'express';
import db from '../src/db.js';
import Activites from '../src/models/activites.js';
import Personne from '../src/models/personne.js';
import Membre from '../src/models/membre.js';
import Sp from '../src/models/Sp.js';

const router = express.Router();

router.get('/sp', async (req, res) => {
    try {
        const data = await Sp.getAll(db);
        data.forEach(element => {
            delete element.db;
        });
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});

router.get('/act', async (req, res) => {
    try {
        const data = await Activites.getAll(db);
        data.forEach(element => {
            delete element.db;
        });
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});

router.get('/personne', async (req, res) => {
    try {
        const data = await Personne.getAll(db);
        data.forEach(element => {
            delete element.db;
        });
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});

router.get('/personne_normal', async (req, res) => {
    try {
        const data = await Personne.getAllNormal(db);
        data.forEach(element => {
            delete element.db;
        });
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});

router.get('/membres', async (req, res) => {
    try {
        const data = await Membre.getAll_Personne(db);
        data.forEach(element => {
            delete element.db;
        });
        res.json(data);
    } catch (error) {
        return res.status(400).json({ error: `erreur : ${error.stack}` });
    }
});

export default router;