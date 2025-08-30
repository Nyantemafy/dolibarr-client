## stats.js (API)

---

- GET `/act`
    - **But** : Récupère les statistiques de toutes les activités.
    - **Retour** : Tableau d'objets statistiques.

- GET `/act/:id_act`
    - **But** : Récupère les statistiques détaillées d'une activité par son identifiant.
    - **Paramètre** : `id_act` (identifiant activité)
    - **Retour** : Objet statistique.

- GET `/sp`
    - **But** : Récupère les statistiques des activités par SP (Sous-Programme).
    - **Retour** : Tableau de statistiques par SP.

- GET `/sp/:id_act`
    - **But** : Récupère les statistiques par SP pour une activité donnée.
    - **Paramètre** : `id_act` (identifiant activité)
    - **Retour** : Objet statistique par SP.

- GET `/act_membre/:interv_date`
    - **But** : Récupère les statistiques des membres sur une période donnée.
    - **Paramètre** : `interv_date` (format `debut.fin.[remise]`)
    - **Retour** : Tableau d'objets statistiques pour chaque membre.

- GET `/act_membre_inviter/:interv_date`
    - **But** : Récupère les statistiques des membres et de leurs invités sur une période donnée.
    - **Paramètre** : `interv_date` (format `debut.fin.[remise]`)
    - **Retour** : Tableau d'objets statistiques enrichis.

---
