'use client'

import { useState } from 'react'
import { Pencil, Plus, Settings, Trash2 } from 'lucide-react'
import type { BuiltinKey, CustomRubrique, Preferences, RubriqueNoms } from './appTypes'
import { defaultPreferences, defaultRubriqueNoms } from './appTypes'

export default function SettingsPanel({preferences,onPreferences,rubriqueNoms,onRubriqueNoms,customRubriques,onCustomRubriques}:{preferences:Preferences;onPreferences:(p:Preferences)=>void;rubriqueNoms:RubriqueNoms;onRubriqueNoms:(r:RubriqueNoms)=>void;customRubriques:CustomRubrique[];onCustomRubriques:(r:CustomRubrique[])=>void}){
  const [newTitle,setNewTitle]=useState('')
  const [newSub,setNewSub]=useState('')
  const colors=['#1478ff','#7c3aed','#db2777','#059669','#ea580c','#0f766e','#dc2626','#102a56','#334155','#64748b']
  const setPref=<K extends keyof Preferences>(key:K,value:Preferences[K])=>onPreferences({...preferences,[key]:value})
  const setName=(key:BuiltinKey,value:string)=>onRubriqueNoms({...rubriqueNoms,[key]:value})

  function addRubrique(){if(!newTitle.trim())return;onCustomRubriques([...customRubriques,{id:crypto.randomUUID(),titre:newTitle.trim(),sousTitre:newSub.trim()}]);setNewTitle('');setNewSub('')}
  function editRubrique(r:CustomRubrique){const titre=window.prompt('Titre de la rubrique :',r.titre);if(!titre?.trim())return;const sousTitre=window.prompt('Sous-titre :',r.sousTitre);if(sousTitre===null)return;onCustomRubriques(customRubriques.map(x=>x.id===r.id?{...x,titre:titre.trim(),sousTitre:sousTitre.trim()}:x))}
  function deleteRubrique(r:CustomRubrique){if(window.confirm(`Supprimer la rubrique « ${r.titre} » ?`))onCustomRubriques(customRubriques.filter(x=>x.id!==r.id))}
  const palette=(key:'accent'|'titleColor'|'subtitleColor')=><div className="color-choices">{colors.map(c=><button key={c} className={`color-choice ${preferences[key]===c?'selected':''}`} style={{background:c}} onClick={()=>setPref(key,c)} aria-label={`Couleur ${c}`}/>)}</div>

  return <section className="panel settings-panel">
    <div className="settings-title"><div className="coming-icon"><Settings size={32}/></div><div><h2>Personnaliser tout votre espace</h2><p>Les changements sont appliqués immédiatement et enregistrés automatiquement.</p></div></div>
    <div className="settings-grid">
      <label>Titre de l’application<input className="input" value={preferences.titreApp} onChange={e=>setPref('titreApp',e.target.value)}/></label>
      <label>Sous-titre de l’application<input className="input" value={preferences.sousTitre} onChange={e=>setPref('sousTitre',e.target.value)}/></label>
      <label>Nom affiché<input className="input" value={preferences.nom} onChange={e=>setPref('nom',e.target.value)}/></label>
      <label>Fonction<input className="input" value={preferences.fonction} onChange={e=>setPref('fonction',e.target.value)}/></label>
      <label>Phrase d’accueil<input className="input" value={preferences.citation} onChange={e=>setPref('citation',e.target.value)}/></label>
    </div>
    <div className="setting-block"><strong>Couleur principale</strong>{palette('accent')}</div>
    <div className="setting-block"><strong>Couleur des titres</strong><p className="helper">Choisissez la couleur des grands titres et des titres de rubriques.</p>{palette('titleColor')}</div>
    <div className="setting-block"><strong>Couleur des sous-titres</strong><p className="helper">Choisissez une teinte plus douce ou plus vive pour les textes sous les titres.</p>{palette('subtitleColor')}</div>
    <div className="setting-block"><strong>Thème</strong><div className="theme-choices"><button className={preferences.theme==='clair'?'selected':''} onClick={()=>setPref('theme','clair')}>☀️ Clair</button><button className={preferences.theme==='sombre'?'selected':''} onClick={()=>setPref('theme','sombre')}>🌙 Sombre</button></div></div>
    <div className="setting-block"><strong>Renommer les rubriques du menu</strong><div className="settings-grid">{(Object.keys(rubriqueNoms) as BuiltinKey[]).map(k=><label key={k}>{defaultRubriqueNoms[k]}<input className="input" value={rubriqueNoms[k]} onChange={e=>setName(k,e.target.value)}/></label>)}</div></div>
    <div className="setting-block"><strong>Ajouter une nouvelle rubrique</strong><div className="settings-grid"><label>Titre<input className="input" value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Ex. Réunions"/></label><label>Sous-titre<input className="input" value={newSub} onChange={e=>setNewSub(e.target.value)} placeholder="Ex. Notes et comptes rendus"/></label></div><button className="btn" style={{marginTop:12}} onClick={addRubrique}><Plus size={16}/> Ajouter la rubrique</button>
      {customRubriques.length>0&&<div className="table-wrap" style={{marginTop:16}}><table className="table"><thead><tr><th>Rubrique</th><th>Sous-titre</th><th>Actions</th></tr></thead><tbody>{customRubriques.map(r=><tr key={r.id}><td><b>{r.titre}</b></td><td>{r.sousTitre}</td><td><div className="row-actions"><button className="action-btn edit" onClick={()=>editRubrique(r)}><Pencil size={15}/> Modifier</button><button className="action-btn delete" onClick={()=>deleteRubrique(r)}><Trash2 size={15}/> Supprimer</button></div></td></tr>)}</tbody></table></div>}
    </div>
    <button className="btn secondary reset-btn" onClick={()=>{onPreferences(defaultPreferences);onRubriqueNoms(defaultRubriqueNoms)}}>Réinitialiser l’apparence</button>
  </section>
}
