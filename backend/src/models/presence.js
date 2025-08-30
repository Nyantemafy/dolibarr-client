import Membre from "./membre.js";
import Personne from "./personne.js";
import Activites from "./activites.js";

class Presence {
    constructor(db) {
        this.db = db;
    }

    async create(data) {
        const { id_membre, id_personne, id_act } = data;
        const membre = await Membre.get(this.db, id_membre);
        if (membre.notFound()) {
            throw new Error("membre non trouver");
        }

        let present = await this.isPresentMembre(id_membre, id_act);
        if (id_personne != "" && id_personne != undefined && id_personne != null) {
            // if (!present) {
            //     throw new Error("un membre parrain doit etre present");
            // }
            const personne = await Personne.get(this.db, id_personne);
            if (personne.notFound()) {
                throw new Error("personne non trouver");
            }
            if (await personne.isMembre()) {
                throw new Error("personne inviter est un membre");
            }
            present = await this.isPresentPersonne(id_personne, id_act);
        }
        if (present) {
            throw new Error("dejat inscrit");
        }

        try {
            const result = await this.db.query('INSERT INTO presence_act (id_membre, id_personne, id_act) VALUES ($1,$2,$3) RETURNING id_presence_act',
                [id_membre, id_personne || null, id_act]
            );
            return result.rows[0].id_presence_act;
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
            throw new Error('Erreur serveur');
        }
    }

    static async get(db, id) {
        const result = new Presence(db);
        try {
            const res = await db.query(`SELECT * FROM presence_act WHERE id_presence_act = $1`, [id]);
            if (res.rows.length <= 0) {
                throw new Error("presence non trouvée");
            }
            Object.assign(result, res.rows[0]);
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }
        return result;
    }

    async membrePresentDate(id_membre, date) {
        try {
            const result = await this.db.query('SELECT * FROM presence WHERE id_membre = $1  AND daty = $2', [id_membre, date]);
            if (result.rows.length > 0) {
                return true;
            }
            return false;
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
            throw new Error('Erreur serveur');
        }
    }
    async personnePresentDate(id_personne, date) {
        try {
            const result = await this.db.query('SELECT * FROM presence WHERE id_personne = $1  AND daty = $2', [id_personne, date]);
            if (result.rows.length > 0) {
                return true;
            }
            return false;
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
            throw new Error('Erreur serveur');
        }
    }

    async isPresent(id_personne, id_act) {
        try {
            const result = await this.db.query('SELECT * FROM presence_act WHERE (id_membre = $1 OR id_personne = $1) AND id_act = $2', [id_personne, id_act]);
            if (result.rows.length > 0) {
                return true;
            }
            return false;
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
            throw new Error('Erreur serveur');
        }
    }
    async isPresentMembre(id_membre, id_act) {
        try {
            const result = await this.db.query('SELECT * FROM presence_act WHERE id_membre = $1 AND id_act = $2', [id_membre, id_act]);
            if (result.rows.length > 0) {
                return true;
            }
            return false;
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
            throw new Error('Erreur serveur');
        }
    }
    async isPresentPersonne(id_personne, id_act) {
        try {
            const result = await this.db.query('SELECT * FROM presence_act WHERE id_personne = $1 AND id_act = $2', [id_personne, id_act]);
            if (result.rows.length > 0) {
                return true;
            }
            return false;
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
            throw new Error('Erreur serveur');
        }
    }

}

export default Presence;