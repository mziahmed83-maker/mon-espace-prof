export type BuiltinKey='dashboard'|'classes'|'eleves'|'notes'|'devoirs'|'documents'|'bibliotheque'|'calendrier'|'statistiques'|'parametres'

export type Preferences={
  titreApp:string
  nom:string
  fonction:string
  sousTitre:string
  citation:string
  accent:string
  theme:'clair'|'sombre'
}

export type CustomRubrique={id:string;titre:string;sousTitre:string}
export type RubriqueNoms=Record<BuiltinKey,string>

export const defaultPreferences:Preferences={
  titreApp:'Mon Espace Prof',
  nom:'M. Ahmed',
  fonction:'Professeur de français',
  sousTitre:'Gestion pédagogique personnelle',
  citation:'Transmettre, c’est semer des possibles.',
  accent:'#1478ff',
  theme:'clair'
}

export const defaultRubriqueNoms:RubriqueNoms={
  dashboard:'Accueil',classes:'Classes',eleves:'Élèves',notes:'Notes',devoirs:'Devoirs',
  documents:'Mes documents',bibliotheque:'Bibliothèque',calendrier:'Mon calendrier',
  statistiques:'Statistiques',parametres:'Paramètres'
}
