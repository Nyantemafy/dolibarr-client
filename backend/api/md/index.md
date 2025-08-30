## index.js (API)

---

- GET `/`
    - **But** : Vérifie que l'API fonctionne (endpoint de test).
    - **Retour** : Message JSON simple `{ msg: "hello" }`.

- Sous-route `/create`
    - **But** : Gère la création d'activités, de présences et de paiements (voir `create.js`).

- Sous-route `/stats`
    - **But** : Gère la récupération des statistiques (voir `stats.js`).

- Sous-route `/data`
    - **But** : Gère la récupération des données de base (SP, activités, personnes, membres, etc.) (voir `data.js`).

---
