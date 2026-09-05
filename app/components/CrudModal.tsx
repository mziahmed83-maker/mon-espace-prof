'use client'

import { useState } from 'react'
import { Save, Upload } from 'lucide-react'
import type { Classe, Eleve } from '@/lib/types'

export default function CrudModal({type,classes,eleves,onClose,onSave}:{type:'classe'|'eleve'|'note'|'devoir'|'document';classes:Classe[];eleves:Eleve[];onClose:()=>void;onSave:(d:any)=>Promise<void>}){
  const [form,setForm]=useState<any>(()=>type==='note'?{eleveId:eleves[0]?.id??'',libelle:'Contrôle',valeur:10,sur:20,coefficient:1}:type==='eleve'?{nom:'',prenom:'',classeId:classes[0]?.id??''}:type==='classe'?{nom:'',niveau:'Tronc commun'}:type==='devoir'?{titre:'',classeId:classes[0]?.id??'',date:new Date().toISOString().slice(0,10),statut:'À faire'}:{titre:'',categorie:'Cours',niveau:'Tronc commun',source:'pc',fichierNom:'',lien:'',fichier:undefined})
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const f=(k:string,v:any)=>setForm((p:any)=>({...p,[k]:v}))
  const title={classe:'Ajouter une classe',eleve:'Ajouter un élève',note:'Ajouter une note',devoir:'Ajouter un devoir',document:'Téléverser / ajouter un document'}[type]
  async function submit(){try{setSaving(true);setError('');await onSave(form)}catch(e:any){setError(e?.message??'Une erreur est survenue.')}finally{setSaving(false)}}

  return <div className="modal-backdrop"><div className="modal"><h3>{title}</h3><div className="form">
    {type==='classe'&&<><Field label="Nom de la classe" value={form.nom} onChange={v=>f('nom',v)}/><Field label="Niveau" value={form.niveau} onChange={v=>f('niveau',v)}/></>}
    {type==='eleve'&&<><Field label="Nom" value={form.nom} onChange={v=>f('nom',v)}/><Field label="Prénom" value={form.prenom} onChange={v=>f('prenom',v)}/><Select label="Classe" value={form.classeId} onChange={v=>f('classeId',v)} options={classes.map(c=>[c.id,c.nom])}/></>}
    {type==='note'&&<><Select label="Élève" value={form.eleveId} onChange={v=>f('eleveId',v)} options={eleves.map(e=>[e.id,`${e.prenom} ${e.nom}`])}/><Field label="Évaluation" value={form.libelle} onChange={v=>f('libelle',v)}/><Field label="Note" type="number" value={form.valeur} onChange={v=>f('valeur',v)}/><Field label="Sur" type="number" value={form.sur} onChange={v=>f('sur',v)}/><Field label="Coefficient" type="number" value={form.coefficient} onChange={v=>f('coefficient',v)}/></>}
    {type==='devoir'&&<><Field label="Titre / consigne" value={form.titre} onChange={v=>f('titre',v)}/><Select label="Classe" value={form.classeId} onChange={v=>f('classeId',v)} options={classes.map(c=>[c.id,c.nom])}/><Field label="Date" type="date" value={form.date} onChange={v=>f('date',v)}/><Select label="Statut" value={form.statut} onChange={v=>f('statut',v)} options={['À faire','Terminé'].map(x=>[x,x])}/></>}
    {type==='document'&&<><Field label="Titre du document" value={form.titre} onChange={v=>f('titre',v)}/><Field label="Catégorie" value={form.categorie} onChange={v=>f('categorie',v)}/><Field label="Niveau" value={form.niveau} onChange={v=>f('niveau',v)}/><Select label="Source" value={form.source} onChange={v=>f('source',v)} options={[["pc","Depuis mon PC"],["drive","Google Drive"],["lien","Autre lien"]]}/>{form.source==='pc'?<label>Choisir un fichier<input className="input" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png" onChange={e=>{const file=e.target.files?.[0];f('fichier',file);f('fichierNom',file?.name??'')}}/>{form.fichierNom&&<span className="file-picked"><Upload size={14}/> {form.fichierNom}</span>}</label>:<Field label={form.source==='drive'?'Lien Google Drive':'Lien du document'} value={form.lien} onChange={v=>f('lien',v)} placeholder="https://..."/>}</>}
    {error&&<div className="auth-message">{error}</div>}
    <div className="actions"><button className="btn secondary" onClick={onClose} disabled={saving}>Annuler</button><button className="btn" onClick={submit} disabled={saving}><Save size={16}/> {saving?'Téléversement…':'Enregistrer'}</button></div>
  </div></div></div>
}

function Field({label,value,onChange,type='text',placeholder}:{label:string;value:any;onChange:(v:string)=>void;type?:string;placeholder?:string}){return <label>{label}<input className="input" type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/></label>}
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:(readonly [string,string])[]}){return <label>{label}<select className="input" value={value} onChange={e=>onChange(e.target.value)}>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}
