'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  Library,
  Link as LinkIcon,
  LogOut,
  Plus,
  Save,
  Search,
  Settings,
  Sun,
  Upload,
  Users,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Classe, Devoir, DocumentPedago, Eleve, Note } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'

type Tab = 'dashboard'|'classes'|'eleves'|'notes'|'devoirs'|'documents'|'bibliotheque'|'calendrier'|'statistiques'|'parametres'

const initialClasses: Classe[] = [
  {id:'c1',nom:'TC 1',niveau:'Tronc commun'},
  {id:'c2',nom:'3e A',niveau:'3e collège'},
]
const initialEleves: Eleve[] = [
  {id:'e1',nom:'Amrani',prenom:'Sara',classeId:'c1'},
  {id:'e2',nom:'Bennani',prenom:'Yassine',classeId:'c1'},
  {id:'e3',nom:'El Fassi',prenom:'Lina',classeId:'c2'},
]
const initialNotes: Note[] = [
  {id:'n1',eleveId:'e1',libelle:'Contrôle 1',valeur:15,sur:20,coefficient:1},
  {id:'n2',eleveId:'e2',libelle:'Contrôle 1',valeur:12.5,sur:20,coefficient:1},
  {id:'n3',eleveId:'e3',libelle:'Contrôle 1',valeur:17,sur:20,coefficient:1},
]
const initialDevoirs: Devoir[] = [
  {id:'d1',titre:'Lire Aux champs + questions',classeId:'c1',date:'2026-09-10',statut:'À faire'},
  {id:'d2',titre:'Figures de style — exercices',classeId:'c2',date:'2026-09-08',statut:'À faire'},
]
const initialDocs: DocumentPedago[] = [
  {id:'doc1',titre:'Fiche — Aux champs',categorie:'Œuvre',niveau:'Tronc commun',source:'lien'},
  {id:'doc2',titre:'Exercices — Figures de style',categorie:'Langue',niveau:'Collège',source:'lien'},
]

function useStored<T>(key:string,fallback:T){
  const [value,setValue]=useState<T>(fallback)
  useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw)setValue(JSON.parse(raw))}catch{}},[key])
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}},[key,value])
  return [value,setValue] as const
}

export default function App(){
  const [tab,setTab]=useState<Tab>('dashboard')
  const [classes,setClasses]=useStored('ep-classes',initialClasses)
  const [eleves,setEleves]=useStored('ep-eleves',initialEleves)
  const [notes,setNotes]=useStored('ep-notes',initialNotes)
  const [devoirs,setDevoirs]=useStored('ep-devoirs',initialDevoirs)
  const [docs,setDocs]=useStored('ep-docs',initialDocs)
  const [modal,setModal]=useState<null|'classe'|'eleve'|'note'|'devoir'|'document'>(null)
  const [user,setUser]=useState<User|null>(null)
  const [email,setEmail]=useState('')
  const [authMessage,setAuthMessage]=useState('')
  const [search,setSearch]=useState('')

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>setUser(data.user ?? null))
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user ?? null))
    return ()=>subscription.unsubscribe()
  },[])

  const moyenne=useMemo(()=>notes.length?notes.reduce((s,n)=>s+(n.valeur/n.sur*20),0)/notes.length:0,[notes])
  const classeNom=(id:string)=>classes.find(c=>c.id===id)?.nom??'—'
  const eleveNom=(id:string)=>{const e=eleves.find(x=>x.id===id);return e?`${e.prenom} ${e.nom}`:'—'}

  const nav=[
    ['dashboard','Accueil',Home],
    ['classes','Classes',GraduationCap],
    ['eleves','Élèves',Users],
    ['notes','Notes',ClipboardList],
    ['devoirs','Devoirs',BookOpen],
    ['documents','Mes documents',FolderOpen],
    ['bibliotheque','Bibliothèque',Library],
    ['calendrier','Mon calendrier',CalendarDays],
    ['statistiques','Statistiques',BarChart3],
    ['parametres','Paramètres',Settings],
  ] as const

  const pageTitle=nav.find(x=>x[0]===tab)?.[1]??'Accueil'

  async function sendMagicLink(){
    setAuthMessage('')
    if(!email.trim()){setAuthMessage('Saisissez votre adresse e-mail.');return}
    const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}})
    setAuthMessage(error?error.message:'Lien envoyé. Ouvrez votre e-mail puis cliquez sur le lien de connexion.')
  }

  async function openDocument(d:DocumentPedago){
    if(d.storagePath){
      const {data,error}=await supabase.storage.from('documents-pedago').createSignedUrl(d.storagePath,3600)
      if(error){alert('Impossible d’ouvrir ce fichier : '+error.message);return}
      window.open(data.signedUrl,'_blank','noopener,noreferrer')
      return
    }
    if(d.lien) window.open(d.lien,'_blank','noopener,noreferrer')
  }

  async function saveItem(data:any){
    const id=crypto.randomUUID()
    if(modal==='classe') setClasses([...classes,{id,...data}])
    if(modal==='eleve') setEleves([...eleves,{id,...data}])
    if(modal==='note') setNotes([...notes,{id,...data,valeur:Number(data.valeur),sur:Number(data.sur),coefficient:Number(data.coefficient)}])
    if(modal==='devoir') setDevoirs([...devoirs,{id,...data}])
    if(modal==='document'){
      if(data.source==='pc'){
        if(!user) throw new Error('Connectez-vous d’abord avec votre e-mail pour téléverser un fichier.')
        const file:File|undefined=data.fichier
        if(!file) throw new Error('Choisissez un fichier à téléverser.')
        const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_')
        const path=`${user.id}/${crypto.randomUUID()}-${safeName}`
        const {error}=await supabase.storage.from('documents-pedago').upload(path,file,{contentType:file.type||undefined,upsert:false})
        if(error) throw error
        const clean={...data}
        delete clean.fichier
        setDocs([...docs,{id,...clean,fichierNom:file.name,storagePath:path}])
      }else{
        if(!data.lien?.trim()) throw new Error('Ajoutez le lien du document.')
        setDocs([...docs,{id,...data,lien:data.lien.trim()}])
      }
    }
    setModal(null)
  }

  const filteredDocs=docs.filter(d=>`${d.titre} ${d.categorie} ${d.niveau}`.toLowerCase().includes(search.toLowerCase()))

  return <div className="app-frame">
    <header className="app-header">
      <div className="header-brand"><div className="logo-mark">📘</div><div><strong>Mon Espace Prof</strong><small>Gestion pédagogique personnelle</small></div></div>
      <div className="search-box"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un document, une classe, un élève..."/></div>
      <div className="profile-zone"><button className="icon-button" aria-label="Notifications"><Bell size={20}/><span className="notify-dot"/></button><div className="avatar">M</div><div className="profile-copy"><strong>M. Ahmed</strong><span>Professeur de français</span></div></div>
    </header>

    <div className="shell">
      <aside className="sidebar">
        <div className="nav">{nav.map(([k,label,Icon])=><button key={k} onClick={()=>setTab(k)} className={tab===k?'active':''}><Icon size={19}/>{label}</button>)}</div>
        <div className="sidebar-quote"><span>Enseigner,<br/>c’est croire<br/>en demain !</span><div className="book-stack">📚</div></div>
      </aside>

      <main className="main">
        {tab==='dashboard' ? <>
          <section className="welcome-row"><div><div className="welcome-title"><Sun size={38}/><div><h1>Bienvenue, M. Ahmed !</h1><p>Votre espace de travail enseignant, simple et centralisé.</p></div></div></div><blockquote>« Transmettre, c’est semer des possibles. »</blockquote></section>

          <div className="cards">
            <Stat label="Classes" value={classes.length} icon={<GraduationCap size={30}/>} onClick={()=>setTab('classes')}/>
            <Stat label="Élèves" value={eleves.length} icon={<Users size={30}/>} onClick={()=>setTab('eleves')}/>
            <Stat label="Devoirs à faire" value={devoirs.filter(d=>d.statut==='À faire').length} icon={<FileText size={30}/>} onClick={()=>setTab('devoirs')}/>
            <Stat label="Moyenne générale" value={moyenne.toFixed(1)} icon={<BarChart3 size={30}/>} onClick={()=>setTab('notes')}/>
          </div>

          <div className="grid2 dashboard-grid">
            <section className="panel modern-panel"><div className="panel-heading"><h2><FileText size={20}/> Derniers devoirs</h2><button className="text-link" onClick={()=>setTab('devoirs')}>Voir tout</button></div><div className="list">{devoirs.slice(0,5).map((d,i)=><div className="item rich-item" key={d.id}><div className={`item-icon icon-${i%3}`}><FileText size={20}/></div><div className="item-body"><strong>{d.titre}</strong><span>{classeNom(d.classeId)} · {d.date}</span></div><span className={d.statut==='À faire'?'status-chip todo':'status-chip done'}>{d.statut==='À faire'?'À corriger':'Corrigé'}</span><ChevronRight size={20}/></div>)}</div></section>
            <section className="panel modern-panel"><div className="panel-heading"><h2><Library size={20}/> Bibliothèque</h2><button className="text-link" onClick={()=>setTab('bibliotheque')}>Voir tout</button></div><div className="list">{filteredDocs.slice(0,5).map((d,i)=><button className="item rich-item library-row" key={d.id} onClick={()=>openDocument(d)}><div className={`item-icon lib-${i%3}`}><BookOpen size={20}/></div><div className="item-body"><strong>{d.titre}</strong><span>{d.categorie} · {d.niveau}</span></div><ChevronRight size={20}/></button>)}</div></section>
          </div>

          <section className="quote-banner"><div className="quote-mark">“</div><div className="quote-copy">« Un bon enseignant éclaire les chemins et fait grandir les possibles. »</div><div className="leaf-mark">🌿 <span>Apprendre<br/>Partager<br/>Réussir</span></div></section>
        </> : <>
          <div className="top"><div><h1>{pageTitle}</h1><p>Votre espace de travail enseignant, simple et centralisé.</p></div>{user?<button className="btn secondary" onClick={()=>supabase.auth.signOut()}><LogOut size={15}/> Se déconnecter</button>:<span className="pill">Connexion requise pour les fichiers</span>}</div>

          {tab==='classes'&&<Section title="Mes classes" onAdd={()=>setModal('classe')}><table className="table"><thead><tr><th>Classe</th><th>Niveau</th><th>Élèves</th></tr></thead><tbody>{classes.map(c=><tr key={c.id}><td><b>{c.nom}</b></td><td>{c.niveau}</td><td>{eleves.filter(e=>e.classeId===c.id).length}</td></tr>)}</tbody></table></Section>}
          {tab==='eleves'&&<Section title="Liste des élèves" onAdd={()=>setModal('eleve')}><table className="table"><thead><tr><th>Nom</th><th>Prénom</th><th>Classe</th></tr></thead><tbody>{eleves.map(e=><tr key={e.id}><td>{e.nom}</td><td>{e.prenom}</td><td>{classeNom(e.classeId)}</td></tr>)}</tbody></table></Section>}
          {tab==='notes'&&<Section title="Notes" onAdd={()=>setModal('note')}><table className="table"><thead><tr><th>Élève</th><th>Évaluation</th><th>Note</th><th>Coef.</th></tr></thead><tbody>{notes.map(n=><tr key={n.id}><td>{eleveNom(n.eleveId)}</td><td>{n.libelle}</td><td><b>{n.valeur}/{n.sur}</b></td><td>{n.coefficient}</td></tr>)}</tbody></table></Section>}
          {tab==='devoirs'&&<Section title="Devoirs et exercices" onAdd={()=>setModal('devoir')}><table className="table"><thead><tr><th>Titre</th><th>Classe</th><th>Date</th><th>Statut</th></tr></thead><tbody>{devoirs.map(d=><tr key={d.id}><td>{d.titre}</td><td>{classeNom(d.classeId)}</td><td>{d.date}</td><td><span className={d.statut==='À faire'?'badge warn':'badge'}>{d.statut}</span></td></tr>)}</tbody></table></Section>}

          {tab==='documents'&&<section className="panel">
            {!user&&<div className="auth-box"><strong>Connexion sécurisée</strong><p>Pour téléverser des fichiers privés, recevez un lien de connexion par e-mail.</p><div className="auth-row"><input className="input" type="email" value={email} placeholder="votre@email.com" onChange={e=>setEmail(e.target.value)}/><button className="btn" onClick={sendMagicLink}>Recevoir le lien</button></div>{authMessage&&<div className="auth-message">{authMessage}</div>}</div>}
            <div className="toolbar"><button className="btn" onClick={()=>setModal('document')}><Upload size={16}/> Téléverser un document</button></div><h2>Mes documents</h2><p className="helper">Les fichiers du PC sont stockés dans votre espace Supabase privé. Les liens Google Drive restent accessibles depuis leur emplacement d’origine.</p>
            <div className="table-wrap"><table className="table"><thead><tr><th>Document</th><th>Catégorie</th><th>Niveau</th><th>Source</th><th>Accès</th></tr></thead><tbody>{filteredDocs.map(d=><tr key={d.id}><td><b>{d.titre}</b>{d.fichierNom&&<div className="sub">{d.fichierNom}</div>}</td><td>{d.categorie}</td><td>{d.niveau}</td><td>{d.source==='drive'?'Google Drive':d.source==='pc'?'Supabase':'Lien'}</td><td>{d.storagePath||d.lien?<button className="doc-link doc-button" onClick={()=>openDocument(d)}>{d.source==='drive'?<><ExternalLink size={14}/> Ouvrir dans Google Drive</>:<><LinkIcon size={14}/> Ouvrir le document</>}</button>:<span className="muted">Aucun fichier</span>}</td></tr>)}</tbody></table></div>
          </section>}

          {tab==='bibliotheque'&&<section className="panel"><div className="panel-heading"><h2>Bibliothèque</h2><button className="btn" onClick={()=>setModal('document')}><Plus size={16}/> Ajouter</button></div><div className="library-grid">{filteredDocs.map((d,i)=><button key={d.id} className="library-card" onClick={()=>openDocument(d)}><div className={`item-icon lib-${i%3}`}><BookOpen size={22}/></div><strong>{d.titre}</strong><span>{d.categorie} · {d.niveau}</span></button>)}</div></section>}
          {tab==='calendrier'&&<ComingSoon icon={<CalendarDays size={34}/>} title="Mon calendrier" text="Cette rubrique accueillera vos séances, réunions et échéances."/>}
          {tab==='statistiques'&&<ComingSoon icon={<BarChart3 size={34}/>} title="Statistiques" text="Cette rubrique affichera les moyennes, résultats et progressions."/>}
          {tab==='parametres'&&<ComingSoon icon={<Settings size={34}/>} title="Paramètres" text="Cette rubrique permettra de personnaliser votre espace professeur."/>}
        </>}
      </main>
    </div>

    {modal&&<Editor type={modal} classes={classes} eleves={eleves} onClose={()=>setModal(null)} onSave={saveItem}/>} 
  </div>
}

function Stat({label,value,icon,onClick}:{label:string,value:string|number;icon:React.ReactNode;onClick:()=>void}){return <button className="card" onClick={onClick}><div className="card-icon">{icon}</div><div className="label">{label}</div><div className="value">{value}</div><span className="card-arrow"><ChevronRight size={18}/></span></button>}
function Section({title,onAdd,children}:{title:string;onAdd:()=>void;children:React.ReactNode}){return <section className="panel"><div className="toolbar"><button className="btn" onClick={onAdd}><Plus size={16}/> Ajouter</button></div><h2>{title}</h2><div className="table-wrap">{children}</div></section>}
function ComingSoon({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <section className="panel coming-soon"><div className="coming-icon">{icon}</div><h2>{title}</h2><p>{text}</p><span>Fonction en préparation</span></section>}

function Editor({type,classes,eleves,onClose,onSave}:{type:'classe'|'eleve'|'note'|'devoir'|'document';classes:Classe[];eleves:Eleve[];onClose:()=>void;onSave:(d:any)=>Promise<void>}){
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
