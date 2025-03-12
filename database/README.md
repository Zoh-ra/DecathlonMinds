# Configuration de la Base de Données DecathlonMinds

Ce dossier contient les scripts nécessaires pour initialiser et configurer la base de données PostgreSQL pour l'application DecathlonMinds.

## Structure de la Base de Données

La base de données comprend les tables suivantes :
- `users` : Informations des utilisateurs
- `emotional_entries` : Enregistrements des états émotionnels
- `walking_routes` : Parcours de marche disponibles
- `route_points` : Points GPS détaillés des parcours
- `emotional_recommendations` : Recommandations basées sur l'état émotionnel
- `user_activities` : Activités et progrès des utilisateurs

## Prérequis

- PostgreSQL 15 ou supérieur
- Accès administrateur à PostgreSQL

## Installation

1. Assurez-vous que PostgreSQL est installé et en cours d'exécution
2. Ouvrez un terminal et connectez-vous à PostgreSQL :
   ```bash
   psql -U postgres
   ```

3. Exécutez les scripts dans l'ordre suivant :
   ```bash
   psql -U postgres -f init.sql
   psql -U postgres -f sample_data.sql
   ```

## Configuration de la Base de Données

Les paramètres de connexion par défaut sont :
- Base de données : `decathlon_minds_db`
- Utilisateur : `postgres`
- Mot de passe : `postgres`
- Port : `5432`

Ces paramètres peuvent être modifiés dans le fichier `backend/src/main/resources/application.yml`.
