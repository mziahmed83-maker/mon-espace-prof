# Mon Espace Prof

Prototype d'application web pour professeur : classes, élèves, notes, devoirs et bibliothèque pédagogique.

## Statut

Projet Next.js relié à GitHub et prêt pour déploiement Vercel.

## Lancer localement

1. Installer Node.js 20+.
2. Dans le dossier : `npm install`
3. Lancer : `npm run dev`
4. Ouvrir `http://localhost:3000`

La V1 fonctionne en **mode démo local** : les données saisies sont conservées dans le navigateur via `localStorage`.

## Passage à Supabase

1. Créer un projet Supabase.
2. Exécuter `supabase/schema.sql` dans le SQL Editor.
3. Copier `.env.example` vers `.env.local` et renseigner l'URL et la clé publique du projet.
4. Ajouter les clients Supabase (`@supabase/ssr`) et remplacer progressivement le stockage local par les tables Supabase.
5. Créer un bucket Storage privé pour les documents pédagogiques.

## Déploiement Vercel

Le dépôt est connecté à Vercel. Tout nouveau commit sur `main` doit déclencher un déploiement automatique.

## Sécurité

Le schéma active Row Level Security (RLS) afin que chaque utilisateur ne puisse voir que ses propres données.
