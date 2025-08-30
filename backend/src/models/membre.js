import Activites from "./activites.js";
import Personne from "./personne.js";

class Membre extends Personne {
    constructor(db) {
        super(db);
    }

    async stat(debut, fin, remise) {
        const result = {};
        let acts = [];
        if (!this.acts) acts = await Activites.getAllBetween(this.db, debut, fin);
        else acts = this.acts;

        const personne = await this.getPersonne();
        result.membre_id = this.id_membre;
        result.membre_nom = personne.nom;
        result.act_nombre = acts.length;
        result.act_presence = await this.nbPresence(debut, fin);
        result.montant_prevu = await this.montantPrevu(debut, fin);
        result.montant_payer = await this.montantPayer(debut, fin);

        return result;
    }

    async stats(debut, fin, remise) {
        const result = [];
        const membres = await Membre.getAll(this.db);
        this.acts = await Activites.getAllBetween(this.db, debut, fin);
        for (let i = 0; i < membres.length; i++) {
            result.push(await membres[i].stat(debut, fin, remise))
        }
        delete this.acts;
        return result;
    }

    async statAndPersonne(debut, fin, remise) {
        const result = {};
        let acts = [];
        if (!this.acts) acts = await Activites.getAllBetween(this.db, debut, fin);
        else acts = this.acts;

        const personne = await this.getPersonne();
        result.membre_id = this.id_membre;
        result.membre_nom = personne.nom;
        result.act_nombre = acts.length;
        result.nb_inviter = await this.nbInviter(debut, fin);
        result.montant_prevu = await this.montantPrevuAndInviter(debut, fin);
        result.montant_payer = await this.montantPayerAndInviter(debut, fin);

        console.log(Number(result.nb_inviter) >= 2 && remise > 0);
        if (Number(result.nb_inviter) >= 2) {
            console.log('here:' + remise);
            try {
                let montant_act = Number(result.montant_prevu) / (Number(result.nb_inviter) + 1);
                console.log("montant_act: " + montant_act);

                let rms = (remise / 100) * montant_act;

                let montant_personnel = montant_act - rms;

                result.montant_prevu = Number(result.montant_prevu) - montant_act + montant_personnel;
                console.log(result);
            } catch (error) {
            }
        }
        result.montant_reste = Number(result.montant_prevu) - (result.montant_payer);

        return result;
    }

    async statsAndPersonne(debut, fin, remise) {
        const result = [];
        const membres = await Membre.getAll(this.db);
        this.acts = await Activites.getAllBetween(this.db, debut, fin);
        for (let i = 0; i < membres.length; i++) {
            result.push(await membres[i].statAndPersonne(debut, fin, remise))
        }
        delete this.acts;
        return result;
    }

    async nbPresence(debut, fin) {
        const res = await this.db.query(`
                SELECT COUNT(id_membre) AS total
                FROM presence
                WHERE id_membre = $1 AND id_personne IS NULL AND daty BETWEEN $2 AND $3
            `, [this.id_membre, debut, fin]);

        return res.rows.length > 0 ? res.rows[0].total : 0;
    }

    async nbInviter(debut, fin) {
        const res = await this.db.query(`
                SELECT COUNT(id_personne) AS total
                FROM presence
                WHERE id_membre = $1 AND daty BETWEEN $2 AND $3
            `, [this.id_membre, debut, fin]);

        return res.rows.length > 0 ? res.rows[0].total : 0;
    }

    async montantPrevu(debut, fin) {
        const res = await this.db.query(`
                SELECT COALESCE(SUM(cotisation), 0) as total
                FROM presence_activite
                WHERE id_membre = $1 AND id_personne IS NULL
                AND daty BETWEEN $2 AND $3
            `, [this.id_membre, debut, fin]);

        return res.rows.length > 0 ? res.rows[0].total : 0;
    }

    async montantPrevuAndInviter(debut, fin) {
        const res = await this.db.query(`
                SELECT COALESCE(SUM(cotisation), 0) as total
                FROM presence_activite
                WHERE id_membre = $1
                AND daty BETWEEN $2 AND $3
            `, [this.id_membre, debut, fin]);

        return res.rows.length > 0 ? res.rows[0].total : 0;
    }

    async montantPayer(debut, fin) {
        const res = await this.db.query(`
                SELECT COALESCE(SUM(montant), 0) as total
                FROM payement_membre_inviter
                WHERE (id_membre = $1 AND id_personne is NULL)
                AND activite_date BETWEEN $2 AND $3
            `, [this.id_membre, debut, fin]);
        return res.rows.length > 0 ? res.rows[0].total : 0;
    }
    async montantPayerAndInviter(debut, fin) {
        const res = await this.db.query(`
                SELECT COALESCE(SUM(montant), 0) as total
                FROM payement_membre_inviter
                WHERE (id_membre = $1 OR id_parrain = $2)
                AND activite_date BETWEEN $3 AND $4
            `, [this.id_membre, this.id_membre, debut, fin]);
        return res.rows.length > 0 ? res.rows[0].total : 0;
    }

    async getPersonne() {
        return Personne.get(this.db, this.id_personne);
    }
    static async get(db, id) {
        const result = new Membre(db);
        try {
            const memb = await db.query(`SELECT * FROM membres WHERE id_membre = $1`, [id]);
            if (memb.rows.length <= 0) {
                // console.log(`SELECT * FROM membres WHERE id_membre = ${id}`)
                throw new Error("Membre non trouvée");
            }
            Object.assign(result, memb.rows[0]);
            const res = await db.query(`SELECT * FROM personne WHERE id_personne = $1`, [result.id_personne]);
            if (res.rows.length <= 0) {
                // console.log(`SELECT * FROM personne WHERE id_personne = $1 ${result.id_personne}`)
                throw new Error("Personne non trouvée");
            }
            Object.assign(result, res.rows[0]);

        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }
        return result;
    }

    static async getAll(db) {
        const result = [];
        try {
            const res = await db.query(`SELECT * FROM membres`, []);
            res.rows.forEach(element => {
                const act = new Membre(db);
                Object.assign(act, element);
                result.push(act);
            });
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }
        return result;
    }

    static async getAll_Personne(db) {
        const result = [];
        try {
            const res = await db.query(`SELECT * FROM personne_membres WHERE id_membre IS NOT NULL`, []);
            res.rows.forEach(element => {
                const act = new Membre(db);
                Object.assign(act, element);
                result.push(act);
            });
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }
        return result;
    }

}

export default Membre;