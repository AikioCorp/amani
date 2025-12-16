# 🔧 Fix pour l'inscription - Amani Finance

## ✅ Problème résolu

Erreur lors de l'inscription :
```
POST https://rrhcctylbczzahgiqoub.supabase.co/auth/v1/signup 500 (Internal Server Error)
AuthApiError: Database error saving new user
```

## Cause

Supabase ne peut pas créer automatiquement le profil utilisateur dans la table `profiles` car il n'y a pas de trigger configuré.

## ✅ Solution implémentée

Le trigger a été adapté au schéma exact de votre base de données avec tous les champs de la table `profiles` :
- `id`, `email`, `first_name`, `last_name`
- `organization`, `avatar_url`, `roles`
- `phone`, `location`, `linkedin`, `twitter`, `bio`
- `preferences` (jsonb), `created_at`, `updated_at`

## Solution

### 1. Exécuter le script SQL dans Supabase

**Étapes :**

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez et exécutez le contenu du fichier : `database_migrations/create_profile_trigger.sql`
5. Cliquez sur **Run**

### 2. Ce que fait le trigger

Le trigger `on_auth_user_created` :
- S'exécute automatiquement après chaque inscription
- Crée un profil dans la table `profiles` avec :
  - `id` : ID de l'utilisateur Supabase
  - `email` : Email de l'utilisateur
  - `first_name` : Prénom (depuis les métadonnées)
  - `last_name` : Nom (depuis les métadonnées)
  - `organization` : Organisation (depuis les métadonnées)
  - `role` : "user" par défaut
  - `is_active` : true par défaut

### 3. Vérification

Après avoir exécuté le script SQL, testez l'inscription :

1. Allez sur `/register`
2. Remplissez le formulaire
3. Cliquez sur "Créer mon compte"
4. ✅ L'inscription devrait fonctionner sans erreur

### 4. Vérifier dans Supabase

Pour vérifier que le trigger fonctionne :

1. Allez dans **Table Editor** > **profiles**
2. Vous devriez voir le nouveau profil créé automatiquement
3. Vérifiez que les données (prénom, nom, email) sont correctes

## Code modifié

Le fichier `Register.tsx` a été simplifié pour :
- Ne plus créer manuellement le profil
- Laisser le trigger Supabase gérer la création
- Améliorer la gestion d'erreur
- Afficher des messages d'erreur plus clairs

## Alternative (si vous ne pouvez pas exécuter le SQL)

Si vous n'avez pas accès au SQL Editor de Supabase, vous pouvez :

1. Demander à l'administrateur du projet Supabase d'exécuter le script
2. Ou utiliser l'API Supabase Management pour créer le trigger

## Support

Si le problème persiste après avoir exécuté le trigger, vérifiez :
- Les permissions RLS sur la table `profiles`
- Que la table `profiles` existe bien
- Que les colonnes correspondent au schéma attendu
