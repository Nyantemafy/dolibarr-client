import Activites from "./activites.js";
import Personne from "./personne.js";
import Presence from "./presence.js";

class Payement {
    constructor(db) {
        this.db = db;
    }

    async create(data) {
        const { id_presence, montant } = data;
        const pres = await Presence.get(this.db, id_presence);
        const act = await Activites.get(this.db, pres.id_act);

        const reste = await this.getReste(act, id_presence);
        if (montant > reste) {
            throw new Error(`reste: ${reste}`);
        }

        try {
            const result = await this.db.query('INSERT INTO payement_act (daty, id_presence_act, montant) VALUES (now(),$1,$2) RETURNING id_payement_act',
                [id_presence, montant]);
            return result.rows[0].id_payement_act;
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
            throw new Error('Erreur serveur');
        }
    }

    async getReste(act, id_presence_act) {

        try {
            const { rows } = await this.db.query(`SELECT COALESCE(SUM(montant), 0) AS total 
                FROM payement_act WHERE id_presence_act = $1`, [id_presence_act]);
            return act.cotisation - Number(rows[0].total);
        } catch (err) {
            console.error('Erreur lors de la récupération des données:', err.message);
            throw new Error('Erreur serveur lors de la récupération des paiements');
        }
    }

    async isInscrit(act, id_presence_act) {

        try {
            const { rows } = await this.db.query(`SELECT 1 FROM presence_act WHERE id_presence_act = $1 AND id_act = $2 LIMIT 1`, [id_presence_act, act.id_act]);
            return !!rows.length;
        } catch (err) {
            console.error('Erreur lors de la récupération des données:', err.message);
            throw new Error('Erreur serveur lors de la récupération des paiements');
        }
    }

}

export default Payement;