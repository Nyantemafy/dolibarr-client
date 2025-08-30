## Fonctionnement du paiement

---

- Lorsqu'un paiement est créé (`create(data)`), le code :
    1. Récupère la présence (`Presence.get`).
    2. Récupère l'activité liée à cette présence.
    3. Calcule le reste à payer avec `getReste`.
    4. Si le montant du paiement dépasse le reste, il lève une erreur.
    5. Sinon, il insère le paiement.

- La méthode `getReste` :
    - Additionne tous les paiements déjà faits pour cette présence (`SUM(montant)`).
    - Soustrait ce total du montant de la cotisation de l'activité.
    - Si le total payé atteint la cotisation, le reste est 0.

---

### Pourquoi tu ne peux payer qu'une seule fois le montant de la cotisation

- **Explication** :
    - Le système considère que chaque présence doit payer exactement le montant de la cotisation de l'activité.
    - Une fois que la somme des paiements pour une présence atteint la cotisation, `getReste` retourne 0.
    - Toute tentative de paiement supplémentaire échoue car `montant > reste` (reste = 0).
    - **Attention** : Si tu tentes de payer un montant égal à `reste` alors que `reste` est déjà 0 (c'est-à-dire que tout a déjà été payé), tu auras aussi une erreur.

- **Conséquence** :
    - Tu peux faire plusieurs paiements partiels (ex : 5000 puis 5000 pour une cotisation de 10000), mais jamais dépasser la cotisation totale.
    - Si tu fais un paiement égal à la cotisation d'un coup, tu ne peux plus rien payer ensuite pour cette présence.
    - **Si tu tentes de payer alors que le reste est déjà 0, tu auras une erreur même si tu envoies 0 ou le montant affiché comme "reste".**

---

### À vérifier si tu rencontres ce problème

- **Vérifie la valeur de `reste` juste avant le paiement** :  
  Si `reste` est 0, aucun paiement ne doit être accepté.
- **Si tu vois "reste 30" mais que le backend refuse le paiement de 30** :  
  - Il est possible qu'il y ait une erreur d'arrondi ou de calcul dans la somme des paiements déjà faits.
  - Vérifie dans la base de données la somme réelle des paiements pour cette présence.
  - Vérifie que le champ `cotisation` et les montants sont bien des nombres (pas de problème de type ou de décimales).

---

### Solution technique

- Pour éviter ce problème, il est conseillé de :
    - Toujours arrondir les montants à 2 décimales lors des calculs.
    - Vérifier dans la base que la somme des paiements + le paiement en cours ne dépasse pas la cotisation (en tenant compte des arrondis).

---

**Résumé** :  
Si tu tentes de payer alors que le reste réel est 0 (même si l'affichage montre 30), le backend refusera le paiement.  
Vérifie la somme réelle des paiements et la valeur de la cotisation dans la base pour cette présence.
