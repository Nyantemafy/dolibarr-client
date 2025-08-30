# Documentation du fichier `membre.js`

Ce fichier contient la classe `Membre` qui hérite de `Personne` et gère les opérations liées aux membres dans l'application. Voici la liste des méthodes et leur fonctionnement :

---

## Membre

---

- constructor(db)
    - **But** : Initialise une instance de la classe avec la connexion à la base de données.
    - **Paramètre** : `db` (objet de connexion à la base de données).

- async stat(debut, fin, remise)
    - **But** : Retourne les statistiques d'un membre sur une période donnée.
    - **Paramètres** :
        - `debut` (date de début)
        - `fin` (date de fin)
        - `remise` (pourcentage de remise)
    - **Retour** : Objet contenant id, nom, nombre d'activités, présence, montants prévus et payés.

- async stats(debut, fin, remise)
    - **But** : Retourne les statistiques de tous les membres sur une période donnée.
    - **Paramètres** : mêmes que `stat`.
    - **Retour** : Tableau d'objets statistiques pour chaque membre.

- async statAndPersonne(debut, fin, remise)
    - **But** : Retourne les statistiques d'un membre en tenant compte des invités et des remises.
    - **Paramètres** : mêmes que `stat`.
    - **Retour** : Objet statistique enrichi (nombre d'invités, montants ajustés, reste à payer).

- async statsAndPersonne(debut, fin, remise)
    - **But** : Retourne les statistiques de tous les membres avec invités/remises.
    - **Paramètres** : mêmes que `statAndPersonne`.
    - **Retour** : Tableau d'objets statistiques enrichis.

- async nbPresence(debut, fin)
    - **But** : Compte le nombre de présences du membre sur une période.
    - **Paramètres** :
        - `debut` (date de début)
        - `fin` (date de fin)
    - **Retour** : Nombre de présences.

- async nbInviter(debut, fin)
    - **But** : Compte le nombre d'invités par le membre sur une période.
    - **Paramètres** :
        - `debut` (date de début)
        - `fin` (date de fin)
    - **Retour** : Nombre d'invités.

- async montantPrevu(debut, fin)
    - **But** : Calcule le montant prévu à payer par le membre (hors invités) sur une période.
    - **Paramètres** :
        - `debut` (date de début)
        - `fin` (date de fin)
    - **Retour** : Montant prévu.

- async montantPrevuAndInviter(debut, fin)
    - **But** : Calcule le montant prévu à payer par le membre et ses invités sur une période.
    - **Paramètres** :
        - `debut` (date de début)
        - `fin` (date de fin)
    - **Retour** : Montant prévu total.

- async montantPayer(debut, fin)
    - **But** : Calcule le montant effectivement payé par le membre (hors invités) sur une période.
    - **Paramètres** :
        - `debut` (date de début)
        - `fin` (date de fin)
    - **Retour** : Montant payé.

- async montantPayerAndInviter(debut, fin)
    - **But** : Calcule le montant payé par le membre et ses invités sur une période.
    - **Paramètres** :
        - `debut` (date de début)
        - `fin` (date de fin)
    - **Retour** : Montant payé total.

- async getPersonne()
    - **But** : Récupère les informations de la personne associée au membre.
    - **Retour** : Instance de `Personne`.

---

### Méthodes statiques

- static async get(db, id)
    - **But** : Récupère un membre par son identifiant.
    - **Paramètres** :
        - `db` (connexion)
        - `id` (identifiant membre)
    - **Retour** : Instance de `Membre` enrichie des infos de la personne.

- static async getAll(db)
    - **But** : Récupère tous les membres.
    - **Paramètre** : `db` (connexion)
    - **Retour** : Tableau d'instances `Membre`.

- static async getAll_Personne(db)
    - **But** : Récupère toutes les personnes qui sont membres.
    - **Paramètre** : `db` (connexion)
    - **Retour** : Tableau d'instances `Membre`.

---
