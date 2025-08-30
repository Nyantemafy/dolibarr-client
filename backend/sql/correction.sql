DELETE FROM sp;
DELETE FROM personne;
DELETE FROM membres;
DELETE FROM activites;
DELETE FROM presence_act;
DELETE FROM payement_act;


INSERT INTO sp (id_sp, description, region) 
VALUES 
(1, 'STK Antananarivo', 'Analamanga'),
(2, 'Service B', 'vakinarakatra');


INSERT INTO personne (id_personne, nom, prenom, dtn, id_sp)
VALUES
  (1,'rabe', 'koto', '2000-01-15', 1),
  (2,'rakotonandrasana', 'angela', '1995-08-28', 1),
  (3,'rabary', 'john', '1999-02-03', 2),
  (4,'rakoto', 'Ony', '2003-03-23', 2),
  (5,'Andrianirina', 'bob', '1998-06-14', 1),
  (6,'ralay', 'jean', '2001-05-21', 2);


INSERT INTO membres (id_membre, id_personne, date_affiliation)
VALUES
  (1, 3, '2025-03-01'),
  (2, 4, '2025-03-01');


INSERT INTO activites (id_act, daty, description, priorite, region, cotisation)
VALUES
  (1, '2025-12-12', 'excursion', 6, 'analamanga', 6000),
  (2, '2025-06-27', 'fihaonambe', 8, 'vakinankaratra', 10000);


INSERT INTO presence_act (id_presence_act, id_membre, id_personne, id_act)
VALUES
  (1, 1, 2, 1),
  (2, 1, 1, 1),
  (3, 1, NULL, 1),
  (4, 2, NULL, 2),
  (5, 2, 5, 2),
  (6, 2, 6, 2);


INSERT INTO payement_act (id_payement_act, daty, id_presence_act, montant)
VALUES
  (1, '2025-08-07', 1, 2000),
  (2, '2025-10-10', 1, 4000),
  (3, '2025-05-04', 2, 5000),
  (4, '2025-06-05', 3, 6000),
  (5, '2025-06-11', 4, 10000),
  (6, '2025-06-11', 5, 10000),
  (7, '2025-06-11', 6, 8000);
