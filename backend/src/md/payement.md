## Payement

---

- constructor(db)
    - **But** : Initialise une instance de la classe avec la connexion à la base de données.
    - **Paramètre** : `db` (objet de connexion à la base de données).
- async create(data)
    - **But** : Crée un paiement pour une présence à une activité, après vérification du reste à payer.
    - **Paramètre** : `data` (objet contenant `id_presence`, `montant`).
    - **Retour** : L'identifiant du paiement créé.
    - **Exceptions** : Lance une erreur si le montant dépasse le reste à payer ou en cas d'erreur serveur.
- async getReste(act, id_presence_act)
    - **But** : Calcule le reste à payer pour une présence à une activité.
    - **Paramètres** :
        - `act` (instance d'Activites)
        - `id_presence_act` (identifiant de la présence)
    - **Retour** : Montant restant à payer.
    - **Exceptions** : Lance une erreur en cas de problème de récupération des paiements.
- async isInscrit(act, id_presence_act)
    - **But** : Vérifie si une présence est bien inscrite à une activité.
    - **Paramètres** :
        - `act` (instance d'Activites)
        - `id_presence_act` (identifiant de la présence)
    - **Retour** : Booléen indiquant l'inscription.
    - **Exceptions** : Lance une erreur en cas de problème de récupération des données.

---
