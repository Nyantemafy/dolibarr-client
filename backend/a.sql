SELECT * 
FROM personne LEFT JOIN membres 
ON personne.id_personne = membres.id_personne;

SELECT personne.id_personne as id_pers
FROM personne LEFT JOIN membres 
ON personne.id_personne = membres.id_personne
WHERE personne.id_sp = 1 AND membres.id_membre IS NULL

                SELECT COUNT(DISTINCT id_membre) as total
                FROM presence_act 
                WHERE id_membre in (1,3,4,6,7,9) AND id_act = 1


SELECT COUNT(DISTINCT id_membre) AS total
FROM presence
WHERE id_membre = 1 AND daty BETWEEN '2020-10-10' AND '2026-10-10'