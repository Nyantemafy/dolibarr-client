import Sp from "./Sp.js";
import Membre from "./membre.js";
import Personne from "./personne.js";

class Activites {
    constructor(db) {
        this.db = db;
    }

    async create(data) {
        console.log("Données reçues dans create():", data);
        const { date, description, priorite, region, cotisation, personne, pourcentage  } = data;

        if (!date) {
            throw new Error("Date requise");
        }
        if (new Date(date) <= new Date()) {
            throw new Error("La date doit être supérieure à aujourd'hui");
        }
        let value = Number(priorite);
        if (value < 1 || value > 10) {
            throw new Error("priorite doit etre compris entre 1 - 10");
        }
        const constante = await this.getConstante();
        value = Number(cotisation);
        if (value < constante.inf || value > constante.sup) {
            throw new Error(`cotisation doit être compris entre ${constante.inf} - ${constante.sup} (${cotisation})`);
        }
        try {
            const result = await this.db.query(`INSERT INTO activites (daty, description, priorite, region, cotisation, pourcentage, personne) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id_act`,
                [date, description, priorite, region, cotisation, pourcentage, personne]
            );
            return result.rows[0].id_act;
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
            throw new Error('Erreur serveur');
        }
    }

    async getConstante() {
        const result = await this.db.query('SELECT * FROM constante', []);
        let res = result.rows.length > 0 ? result.rows[0] : null;
        return { inf: Number(res.cotisation_inf), sup: Number(res.cotisation_sup) };
    }

    static async get(db, id) {
        const result = new Activites(db);
        const res = await db.query(`SELECT * FROM activites WHERE id_act = $1`, [id]);
        if (res.rows.length <= 0) {
            throw new Error("Activites non trouvée");
        }
        Object.assign(result, res.rows[0]);
        return result;
    }

    async stats() {
        const result = [];
        const data = await Activites.getAll(this.db);
        for (let i = 0; i < data.length; i++) {
            result.push(await data[i].stat());
        }
        return result;
    }

    async statsParSp() {
        const result = [];
        const acts = await Activites.getAll(this.db);
        const sps = await Sp.getAll(this.db);
        for (let i = 0; i < acts.length; i++) {
            acts[i].spsCache = sps;
            const curResult = await acts[i].statParSp();
            delete acts[i].spsCache;
            result.push(curResult);
        }
        return result;
    }
    async statParSp() {
        const result = {};
        const sps = this.spsCache ?? await Sp.getAll(this.db);

        result.act_id = this.id_act;
        result.act_desc = this.description;
        result.act_date = this.daty;
        result.act_montant = this.cotisation;
        const spData = [];
        for (let j = 0; j < sps.length; j++) {
            spData.push(await sps[j].statParAct(this));
        }
        result.sp = spData;
        return result;
    }

    static async getAll(db) {
        const result = [];
        const res = await db.query(`SELECT * FROM activites`, []);
        res.rows.forEach(element => {
            const act = new Activites(db);
            Object.assign(act, element);
            result.push(act);
        });
        return result;
    }

    static async getAllBetween(db, debut, fin) {
        const result = [];
        const res = await db.query(`SELECT * FROM activites WHERE daty BETWEEN $1 AND $2`, [debut, fin]);
        res.rows.forEach(element => {
            const act = new Activites(db);
            Object.assign(act, element);
            result.push(act);
        });
        return result;
    }

    async montantPrevue() {
        const nbMembre = await this.nbMembre();
        const nbPersonne = await this.nbPersonne();
        return (Number(nbMembre) + Number(nbPersonne)) * Number(this.cotisation);
    }
    async montantTotal() {
        const res = await this.db.query(`
                SELECT COALESCE(total, 0) AS total
                FROM recette_activite
                WHERE id_act = $1
            `, [this.id_act]);

        return res.rows.length > 0 ? res.rows[0].total : 0;
    }
    async montantReste() {
        const prevu = await this.montantPrevue();
        const total = await this.montantTotal();
        return prevu - total;
    }

    async nbMembre() {
        const res = await this.db.query(`
                SELECT COUNT(DISTINCT id_membre) AS total 
                FROM presence_act 
                WHERE id_act = $1
            `, [this.id_act]);
        return res.rows.length > 0 ? res.rows[0].total : 0;
    }
    async nbPersonne() {
        const res = await this.db.query(`
                SELECT COUNT(DISTINCT id_personne) AS total
                FROM presence_act
                WHERE id_act = $1
            `, [this.id_act]);

        return res.rows.length > 0 ? res.rows[0].total : 0;
    }

    async stat() {
        const result = {};
        result.act_id = this.id_act;
        result.act_desc = this.description;
        result.act_date = this.daty;
        result.act_montant = this.cotisation;
        result.nb_membre = await this.nbMembre();
        result.nb_non_membre = await this.nbPersonne();
        result.montant_prevue = await this.montantPrevue();
        result.montant_total = await this.montantTotal();
        result.montant_reste = await this.montantReste();
        // result.membres = await this.membrePresent();
        // result.personnes = await this.personnePresent();
        return result;
    }

    async membrePresent() {
        const result = [];
        try {
            const res = await this.db.query(`SELECT DISTINCT id_membre FROM presence WHERE id_act = $1`, [this.id_act]);
            for (const element of res.rows) {
                if (element.id_membre == null) continue;

                const mbr = await Membre.get(this.db, element.id_membre);
                delete mbr.db;
                result.push(mbr);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }
        return result;
    }


    async personnePresent() {
        const result = [];
        try {
            const res = await this.db.query(`SELECT DISTINCT id_personne FROM presence WHERE id_act = $1`, [this.id_act]);
            for (const element of res.rows) {
                if (element.id_personne == null) continue;

                const prs = await Personne.get(this.db, element.id_personne);
                delete prs.db;
                result.push(prs);
            };
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }

        return result;
    }

}

export default Activites;