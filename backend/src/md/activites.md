# Documentation du fichier `activites.js`

Ce fichier contient la classe `Activites` qui gère les opérations liées aux activités dans l'application. Voici la liste des méthodes et leur fonctionnement :

---

## Activites

---

- constructor(db)
    - **But** : Initialise une instance de la classe avec la connexion à la base de données.
    - **Paramètre** : `db` (objet de connexion à la base de données).
- async create(data)
    - **But** : Crée une nouvelle activité après avoir validé les données (date, priorité, cotisation).
    - **Paramètre** : `data` (objet contenant date, description, priorite, region, cotisation).
    - **Retour** : L'identifiant de l'activité créée.
    - **Exceptions** : Lance une erreur si les validations échouent.
- async getConstante()
    - **But** : Récupère les valeurs limites de cotisation depuis la table `constante`.
    - **Retour** : Objet `{ inf, sup }` représentant les bornes de cotisation.
- async stats()
    - **But** : Retourne les statistiques de toutes les activités.
    - **Retour** : Tableau d'objets statistiques pour chaque activité.
- async statsParSp()
    - **But** : Retourne les statistiques des activités par SP (Sous-Programme).
    - **Retour** : Tableau de statistiques par SP pour chaque activité.
- async statParSp()
    - **But** : Retourne les statistiques de l'activité courante par SP.
    - **Retour** : Objet contenant les statistiques par SP.
- async montantPrevue()
    - **But** : Calcule le montant total prévu pour l'activité (nombre de membres + personnes * cotisation).
    - **Retour** : Montant prévu (nombre).
- async montantTotal()
    - **But** : Calcule le montant total réellement collecté pour l'activité.
    - **Retour** : Montant total collecté (nombre).
- async montantReste()
    - **But** : Calcule le montant restant à collecter (prévu - total).
    - **Retour** : Montant restant (nombre).
- async nbMembre()
    - **But** : Compte le nombre de membres présents à l'activité.
    - **Retour** : Nombre de membres (nombre).
- async nbPersonne()
    - **But** : Compte le nombre de personnes non-membres présentes à l'activité.
    - **Retour** : Nombre de personnes (nombre).
- async stat()
    - **But** : Retourne un objet statistique détaillé pour l'activité courante.
    - **Retour** : Objet contenant id, description, date, cotisation, nombre de membres/personnes, montants.
- async membrePresent()
    - **But** : Liste les membres présents à l'activité.
    - **Retour** : Tableau d'objets membres.
- async personnePresent()
    - **But** : Liste les personnes non-membres présentes à l'activité.
    - **Retour** : Tableau d'objets personnes.

---

### **Méthodes statiques**

- static async get(db, id)
    - **But** : Récupère une activité par son identifiant.
    - **Paramètres** :
        - `db` (connexion)
        - `id` (identifiant activité)
    - **Retour** : Instance de `Activites` correspondant à l'activité.
- static async getAll(db)
    - **But** : Récupère toutes les activités.
    - **Paramètre** : `db` (connexion)
    - **Retour** : Tableau d'instances `Activites`.
- static async getAllBetween(db, debut, fin)
    - **But** : Récupère toutes les activités entre deux dates.
    - **Paramètres** :
        - `db` (connexion)
        - `debut` (date début)
        - `fin` (date fin)
    - **Retour** : Tableau d'instances `Activites`.

---

## Notes

- Toutes les méthodes asynchrones retournent des Promises.
- Les méthodes manipulant la base de données utilisent des requêtes SQL via l'objet `db`.
- Les exceptions sont gérées pour signaler les erreurs de validation ou de requête.

---
