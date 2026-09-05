export type Classe = { id: string; nom: string; niveau: string }
export type Eleve = { id: string; nom: string; prenom: string; classeId: string }
export type Note = { id: string; eleveId: string; libelle: string; valeur: number; sur: number; coefficient: number }
export type Devoir = { id: string; titre: string; classeId: string; date: string; statut: 'À faire' | 'Terminé' }
export type DocumentPedago = {
  id: string
  titre: string
  categorie: string
  niveau: string
  source?: 'pc' | 'drive' | 'lien'
  fichierNom?: string
  lien?: string
  storagePath?: string
}
