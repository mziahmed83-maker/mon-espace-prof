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

## Lecture et correction des copies

La rubrique **Corrections** accepte jusqu’à 10 images (JPG/JPEG, PNG ou WebP) ou un PDF à la fois. Pour les images, l’enseignant peut changer l’ordre des pages, les remplacer, les supprimer, les tourner et les recadrer par marges. Les pages et les corrections sont enregistrées localement dans le navigateur : les métadonnées utilisent `localStorage` et les fichiers `IndexedDB`. Les fichiers ne sont pas publiés ni synchronisés avec Supabase. Supprimer une correction depuis l’historique supprime aussi ses pages locales.

La lecture et l’évaluation réelles nécessitent `OPENAI_API_KEY` et `CORRECTION_ACCESS_CODE` dans les variables d’environnement du serveur Vercel (ou dans `.env.local` en développement). `OPENAI_CORRECTION_MODEL` est facultative ; le modèle par défaut est `gpt-4.1-mini`. L’interface signale que la copie est transmise à OpenAI seulement après clic sur « Lire et transcrire les pages » ou « Proposer une évaluation selon ce barème ». Sans ces variables, la rubrique laisse la saisie manuelle disponible et n’indique pas que l’IA fonctionne.

L’enseignant doit fournir la consigne, le total, les critères, les réponses attendues, les types d’erreurs et les pénalités autorisées. La somme du barème doit égaler le total prévu. La proposition reste modifiable ; elle n’est transférée dans « Notes » qu’après validation explicite. L’IA peut mal lire l’écriture manuscrite : chaque transcription et chaque point doivent être comparés à l’original. Les passages incertains ou les règles absentes du barème doivent être vérifiés manuellement. La version actuelle accepte un seul PDF (non recadrable ou rotatif dans l’application) ou plusieurs images ; pour modifier les pages d’un PDF, convertissez-les en images avant l’import.
