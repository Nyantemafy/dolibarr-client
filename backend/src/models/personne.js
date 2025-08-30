class Personne {
    constructor(db) {
        this.db = db;
    }

    static async get(db, id) {
        const result = new Personne(db);
        try {
            const res = await db.query(`SELECT * FROM personne WHERE id_personne = $1`, [id]);
            if (res.rows.length <= 0) {
                console.log(`SELECT * FROM personne WHERE id_personne = ${id}`)
                throw new Error("Personne non trouvée");
            }
            Object.assign(result, res.rows[0]);
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }
        return result;
    }

    async isMembre() {
        try {
            const res = await this.db.query(`SELECT * FROM membres WHERE id_personne = $1`, [this.id_personne]);
            if (res.rows.length > 0) {
                return true;
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des données', err.stack);
        }
        return false;
    }

    static async getAll(db) {
        const result = [];
        const res = await db.query(`SELECT * FROM Personne`, []);
        res.rows.forEach(element => {
            const act = new Personne(db);
            Object.assign(act, element);
            result.push(act);
        });
        return result;
    }

    static async getAllNormal(db) {
        const result = [];
        const res = await db.query(`SELECT * FROM personne_membres WHERE id_membre IS NULL`, []);
        res.rows.forEach(element => {
            const act = new Personne(db);
            Object.assign(act, element);
            result.push(act);
        });
        return result;
    }

    notFound() {
        if (this.id_personne == undefined || this.id_personne == null || this.id_personne == "") {
            return true;
        }
        return false;
    }
}

export default Personne;
