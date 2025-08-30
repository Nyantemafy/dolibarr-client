-- Table SP
CREATE TABLE sp (
    id_sp SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    region VARCHAR(30) NOT NULL
);

-- Table Personne
CREATE TABLE personne (
    id_personne SERIAL PRIMARY KEY,
    nom VARCHAR(30) NOT NULL,
    prenom VARCHAR(30) NOT NULL,
    dtn DATE NOT NULL,
    id_sp INTEGER REFERENCES sp(id_sp) ON DELETE CASCADE
);

-- Table Membres
CREATE TABLE membres (
    id_membre SERIAL PRIMARY KEY,
    id_personne INTEGER REFERENCES personne(id_personne) ON DELETE CASCADE,  -- Référence à la personne
    date_affiliation DATE NOT NULL
);

-- Table Activités
CREATE TABLE activites (
    id_act SERIAL PRIMARY KEY,
    daty DATE NOT NULL,
    description TEXT NOT NULL,
    priorite INTEGER NOT NULL,
    region VARCHAR(30) NOT NULL,
    cotisation NUMERIC(10, 2) NOT NULL
);

-- Table PrésenceAct
CREATE TABLE presence_act (
    id_presence_act SERIAL PRIMARY KEY,
    id_membre INTEGER REFERENCES membres(id_membre) ON DELETE CASCADE,  -- Référence au membre
    id_personne INTEGER REFERENCES personne(id_personne) ON DELETE CASCADE,  -- Référence à la personne
    id_act INTEGER REFERENCES activites(id_act) ON DELETE CASCADE  -- Référence à l'activité
);

-- 
CREATE TABLE payement_act (
    id_payement_act SERIAL PRIMARY KEY,  -- Clé primaire sur cette colonne
    daty DATE NOT NULL,  -- La date de paiement ne peut pas être nulle
    id_act INTEGER REFERENCES activites(id_act) ON DELETE CASCADE,  -- Référence à la table activites avec suppression en cascade
    id_membre INTEGER REFERENCES membres(id_membre) ON DELETE CASCADE,  -- Référence à la table membres avec suppression en cascade
    id_personne INTEGER REFERENCES personne(id_personne) ON DELETE CASCADE,  -- Référence à la table personne avec suppression en cascade
    montant NUMERIC(10, 2) NOT NULL  -- Le montant doit être spécifié et ne peut pas être nul
);

-- Table Constantes
CREATE TABLE constante (
    cotisation_inf NUMERIC(10, 2) NOT NULL,
    cotisation_sup NUMERIC(10, 2) NOT NULL
);

-- presence
CREATE VIEW presence AS 
    SELECT 
        activites.id_act,
        activites.daty,
        activites.description,
        activites.priorite,
        activites.region,
        activites.cotisation,
        presence_act.id_presence_act,
        presence_act.id_membre,
        presence_act.id_personne
    FROM activites 
    LEFT JOIN presence_act
    ON activites.id_act = presence_act.id_act;


CREATE VIEW personne_membres AS
    SELECT 
        personne.id_personne,
        personne.nom,
        personne.prenom,
        personne.dtn,
        personne.id_sp,
        membres.id_membre,
        membres.date_affiliation
    FROM personne
    LEFT JOIN membres
    ON personne.id_personne = membres.id_personne;

CREATE VIEW presence_activite AS
    SELECT 
        presence_act.id_presence_act,
        presence_act.id_membre,
        presence_act.id_personne,
        presence_act.id_act,
        activites.daty,
        activites.description,
        activites.priorite,
        activites.region,
        activites.cotisation
    FROM presence_act
    LEFT JOIN activites
    ON presence_act.id_act = activites.id_act;

CREATE VIEW payement_activite AS
    SELECT 
        payement_act.id_payement_act,
        payement_act.daty AS payement_date,
        payement_act.id_act,
        payement_act.id_membre,
        payement_act.id_personne,
        payement_act.montant,
        activites.daty AS activite_date,
        activites.description,
        activites.priorite,
        activites.region,
        activites.cotisation
    FROM payement_act
    JOIN activites
    ON payement_act.id_act = activites.id_act;

CREATE VIEW payement_membre_inviter AS
    SELECT payement_activite.*, presence_act.id_membre as id_parrain
    FROM payement_activite LEFT JOIN presence_act
    ON payement_activite.id_personne = presence_act.id_personne
    AND payement_activite.id_act = presence_act.id_act;


SELECT COALESCE(SUM(montant), 0) as total
FROM payement_act
WHERE id_membre = 1 AND id_personne IS NULL;    