class Sp {
    constructor(db) {
        this.db = db;
    }

    async create(req, res) {

    }

    static async get(db, id) {
        const result = new Sp(db);
        try {
            const res = await db.query(`SELECT * FROM activites WHERE id_act = $1`, [id]);
            if (res.rows.length <= 0) {
                throw new Error("Sp non trouvée");
            }
            Object.assign(result, res.rows[0]);
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }
        return result;
    }

    async statParAct(act) {
        const result = {};
        result.sp_id = this.id_sp;
        result.sp_desc = this.description;
        result.sp_region = this.region;
        result.nb_membre = await this.nbMembreAct(act);
        result.nb_non_membre = await this.nbNonMembreAct(act);
        result.montant_prevu = await this.montantPrevue(act);
        result.montant_total = await this.montantTotal(act);
        result.montant_reste = result.montant_prevu - result.montant_total;
        result.membres = await this.membrePresent(act);
        result.personnes = await this.personnePresent(act);
        return result;
    }

    static async getAll(db) {
        const result = [];
        try {
            const res = await db.query(`SELECT * FROM Sp`, []);
            res.rows.forEach(element => {
                const act = new Sp(db);
                Object.assign(act, element);
                result.push(act);
            });
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }
        return result;
    }

    async nbMembreAct(act) {
        const membres = await this.idMembres();
        try {
            const res = await this.db.query(`
                SELECT COUNT(DISTINCT id_membre) as total
                FROM presence_act 
                WHERE id_membre in (${membres.join(", ")}) AND id_act = $1
            `, [act.id_act]);
            return res.rows.length > 0 ? res.rows[0].total : 0;
        } catch (err) {
            console.error('Erreur lors du comptage des membres', err.stack);
            return 0;
        }
    }

    async nbNonMembreAct(act) {
        const nonMembre = await this.idNonMembres();
        const res = await this.db.query(`
                SELECT COUNT(DISTINCT id_personne) as total
                FROM presence_act 
                WHERE id_personne in (${nonMembre.join(", ")}) AND id_act = $1
            `, [act.id_act]);
        return res.rows.length > 0 ? res.rows[0].total : 0;
    }

    async montantPrevue(act) {
        try {
            const nbMembre = await this.nbMembreAct(act);
            const nbPersonne = await this.nbNonMembreAct(act);

            // Récupérer les conditions de réduction depuis l'activité
            const reductionPourcentage = Number(act.pourcentage) || 0;
            const reductionPersonne = Number(act.personne) || 0;

            // Pour chaque membre, vérifier s'il a amené assez de personnes pour la réduction
            let total = 0;
            const membres = await this.membrePresent(act);
            for (const membre of membres) {
                // Compter le nombre de personnes amenées par ce membre pour cette activité
                const res = await this.db.query(
                    `SELECT COUNT(*) AS nb_invite
                     FROM presence_act
                     WHERE id_membre = $1 AND id_personne IS NOT NULL AND id_act = $2`,
                    [membre.id_membre, act.id_act]
                );
                const nbInvite = Number(res.rows[0]?.nb_invite || 0);

                let cotisation = Number(act.cotisation);
                if (reductionPourcentage > 0 && reductionPersonne > 0 && nbInvite >= reductionPersonne) {
                    cotisation = cotisation * (1 - reductionPourcentage / 100);
                }
                total += cotisation;
            }

            // Ajouter la cotisation des personnes invitées (pas de réduction pour eux)
            total += nbPersonne * Number(act.cotisation);

            return total;
        } catch (err) {
            console.error("Erreur lors du calcul du montant prévu", err.stack);
            return 0;
        }
    }
    async montantTotal(act) {
        const idMembres = await this.idMembres();
        const idNonMembres = await this.idNonMembres();

        try {
            const res = await this.db.query(`
                SELECT COALESCE(SUM(montant), 0) AS total
                FROM payement_act
                WHERE id_act = $1
                AND (
                    (id_membre IN (${idMembres.join(', ')}) AND id_personne IS NULL)
                    OR id_personne IN (${idNonMembres.join(', ')})
                )
            `, [act.id_act]);

            return res.rows.length > 0 ? res.rows[0].total : 0;
        } catch (err) {
            console.error("Erreur lors du calcul du montant total", err.stack);
            return 0;
        }
    }

    async montantReste(act) {
        try {
            const prevu = await this.montantPrevue(act);
            const total = await this.montantTotal(act);
            return prevu - total;
        } catch (err) {
            console.error("Erreur lors du calcul du montant restant", err.stack);
            return 0;
        }
    }

    async idMembres() {
        const result = [0];

        try {
            const res = await this.db.query(`
                SELECT id_membre
                FROM personne_membres
                WHERE id_sp = $1 AND id_membre is NOT NULL
            `, [this.id_sp]);
            res.rows.forEach(element => {
                result.push(element.id_membre);
            });
        } catch (err) {
            console.error('Erreur lors du recuperation id_membres', err.stack);
        }

        return result;
    }
    async idNonMembres() {
        const result = [0];

        try {
            const res = await this.db.query(`
                SELECT id_personne
                FROM personne_membres
                WHERE id_sp = $1 AND id_membre IS NULL
            `, [this.id_sp]);
            res.rows.forEach(element => {
                result.push(element.id_personne);
            });
        } catch (err) {
            console.error('Erreur lors du recuperation id_membres', err.stack);
        }

        return result;
    }

    async membrePresent(act) {
        const membres = await act.membrePresent();
        for (let i = 0; i < membres.length; i++) {
            if (membres[i].id_sp != this.id_sp) {
                membres.splice(i, 1);
                i--;
            }
        }
        return membres;
    }

    async personnePresent(act) {
        const personnes = await act.personnePresent();
        for (let i = 0; i < personnes.length; i++) {
            if (personnes[i].id_sp != this.id_sp) {
                personnes.splice(i, 1);
                i--;
            }
        }
        return personnes;
    }

}

export default Sp;