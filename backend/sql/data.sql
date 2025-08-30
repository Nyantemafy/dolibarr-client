-- Inserting data into the sp table
INSERT INTO sp (description, region) 
VALUES 
('Service A', 'Region 1'),
('Service B', 'Region 2');

-- Inserting data into the personne table
-- Insertion de 10 personnes
INSERT INTO personne (nom, prenom, dtn, id_sp)
VALUES
  ('Dupont', 'Jean', '1990-01-15', 1),
  ('Martin', 'Marie', '1985-05-25', 2),
  ('Lemoine', 'Paul', '1992-08-30', 1),
  ('Dufresne', 'Sophie', '1990-11-10', 1),
  ('Leclerc', 'Pierre', '1987-12-05', 2),
  ('Moreau', 'Lucie', '1993-03-22', 1),
  ('Girard', 'Antoine', '1991-06-18', 1),
  ('Roussel', 'Isabelle', '1994-04-10', 2),
  ('Boucher', 'Marc', '1990-07-17', 1),
  ('Robert', 'Clara', '1988-02-27', 2);

-- Inserting 10 members
INSERT INTO membres (id_personne, date_affiliation)
VALUES
  (1, '2025-03-01'),
  (2, '2025-03-01'),
  (3, '2025-03-01'),
  (4, '2025-03-01'),
  (5, '2025-03-01'),
  (6, '2025-03-01'),
  (7, '2025-03-01'),
  (8, '2025-03-01'),
  (9, '2025-03-01'),
  (10, '2025-03-01');


-- Inserting data into the activites table
INSERT INTO activites (daty, description, priorite, region, cotisation) 
VALUES 
('2025-03-01', 'Activity 1', 1, 'Region 1', 50.00),
('2025-03-02', 'Activity 2', 2, 'Region 2', 100.00);

-- Inserting data into the presence_act table
INSERT INTO presence_act (id_membre, id_personne, id_act) 
VALUES 
(1, 1, 1),
(2, 2, 2);

-- Inserting data into the payement_act table
INSERT INTO payement_act (daty, id_act, id_membre, montant) 
VALUES 
('2025-03-10', 1, 1, 50.00),
('2025-03-11', 2, 2, 100.00);

-- Inserting data into the constante table
INSERT INTO constante (cotisation_inf, cotisation_sup) 
VALUES 
(30.00, 150.00);



INSERT INTO sp (id_sp, description, region) VALUES 
(1, 'STK Antananarivo', 'Analamanga'),
(2, 'STK ankaratra', 'vakinarakatra');

INSERT INTO constante (cotisation_inf, cotisation_sup) VALUES (5000, 10000);

INSERT INTO personne (id_personne, nom, prenom, dtn, id_sp) VALUES 
(1, 'rabe', 'koto', '2000-01-15', 1),
(2, 'rakotonandrasana', 'angela', '1995-08-28', 1),
(3, 'rabary', 'john', '1999-02-03', 2),
(4, 'rakoto', 'Ony', '2003-03-23', 2),
(5, 'Andrianirina', 'bob', '1998-06-14', 1),
(6, 'ralay', 'jean', '2001-05-21', 2);

INSERT INTO membres (id_membre, id_personne, date_affiliation) VALUES 
(1, 3, '2012-01-01'),
(2, 4, '2021-01-01');

INSERT INTO activites (id_act, daty, description, priorite, region, cotisation) VALUES 
(1, '2025-12-12', 'excursion', 6, 'analamanga', 6000),
(2, '2025-06-27', 'fihaonambe', 8, 'vakinankaratra', 10000);

INSERT INTO presence_act (id_presence_act, id_membre, id_personne, id_act) VALUES 
(1, 1, 2, 1), 
(2, 1, 1, 1),  
(3, 1, NULL, 1), 
(4, 2, NULL, 2), 
(5, 2, 5, 2),  
(6, 2, 6, 2);  

