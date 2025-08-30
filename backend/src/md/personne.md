## Personne

---

- constructor(db)
    - **But** : Initialise une instance de la classe avec la connexion à la base de données.
    - **Paramètre** : `db` (objet de connexion à la base de données).
- static async get(db, id)
    - **But** : Récupère une personne par son identifiant.
    - **Paramètres** :
        - `db` (connexion)
        - `id` (identifiant personne)
    - **Retour** : Instance de `Personne` ou erreur si non trouvée.
- async isMembre()
    - **But** : Vérifie si la personne est membre.
    - **Retour** : Booléen indiquant si la personne est membre.
- static async getAll(db)
    - **But** : Récupère toutes les personnes.
    - **Paramètre** : `db` (connexion)
    - **Retour** : Tableau d'instances `Personne`.
- static async getAllNormal(db)
    - **But** : Récupère toutes les personnes qui ne sont pas membres.
    - **Paramètre** : `db` (connexion)
    - **Retour** : Tableau d'instances `Personne`.
- notFound()
    - **But** : Vérifie si l'instance courante ne correspond à aucune personne (id manquant ou vide).
    - **Retour** : Booléen.

---
