# Instructions pour l'initialisation de la base de données avec pgAdmin 4

## Étapes à suivre

1. **Lancer pgAdmin 4**
   - Ouvrez pgAdmin 4 depuis le menu démarrer
   - Connectez-vous avec votre mot de passe principal

2. **Créer la base de données**
   - Dans l'arborescence à gauche, faites un clic droit sur "Databases"
   - Sélectionnez "Create" > "Database..."
   - Nom de la base : `decathlon_minds_db`
   - Cliquez sur "Save"

3. **Exécuter le script d'initialisation**
   - Cliquez sur la nouvelle base de données `decathlon_minds_db`
   - Cliquez sur l'icône "Query Tool" (l'icône ressemble à une feuille avec une loupe)
   - Copiez tout le contenu du fichier `init.sql` dans l'éditeur
   - Cliquez sur le bouton "Execute" (triangle de lecture) ou appuyez sur F5
   - Attendez que toutes les tables soient créées

4. **Insérer les données de test**
   - Dans la même fenêtre Query Tool
   - Effacez le contenu précédent
   - Copiez tout le contenu du fichier `sample_data.sql`
   - Exécutez le script

5. **Vérification**
   - Dans l'arborescence à gauche, développez `decathlon_minds_db` > "Schemas" > "public" > "Tables"
   - Vous devriez voir toutes les tables créées :
     - users
     - emotional_entries
     - walking_routes
     - route_points
     - emotional_recommendations
     - user_activities

## En cas de problème

Si vous rencontrez des erreurs :
1. Vérifiez que la base de données `decathlon_minds_db` n'existe pas déjà
2. Assurez-vous que PostgreSQL est bien en cours d'exécution
3. Vérifiez que vous avez les droits suffisants sur la base de données

## Configuration de l'application

Le fichier `application.yml` dans le backend est déjà configuré avec les paramètres par défaut :
- URL : `jdbc:postgresql://localhost:5432/decathlon_minds_db`
- Utilisateur : `postgres`
- Mot de passe : `postgres`

Si vous utilisez des identifiants différents, modifiez le fichier `application.yml` en conséquence.
