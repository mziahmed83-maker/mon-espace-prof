'use client'

import { useEffect,useMemo,useRef,useState,type CSSProperties,type ReactNode } from 'react'
import {BarChart3,Bell,BookOpen,CalendarDays,CheckCircle2,ChevronRight,ClipboardList,ExternalLink,FileText,FolderOpen,GraduationCap,Home,Library,Link as LinkIcon,LogOut,Pencil,Plus,Search,Settings,Sun,Trash2,Upload,UserPlus,Users} from 'lucide-react'
import type {User} from '@supabase/supabase-js'
import type {Classe,Devoir,DocumentPedago,Eleve,Note} from '@/lib/types'
import {supabase} from '@/lib/supabase/client'
import CrudModal from './components/CrudModal'
import SettingsPanel from './components/SettingsPanel'
import type {BuiltinKey,CustomRubrique,Preferences,RubriqueNoms} from './components/appTypes'
import {defaultPreferences,defaultRubriqueNoms} from './components/appTypes'
import '../dashboard.css'

const initialClasses:Classe[]=[{id:'c1',nom:'TC 1',niveau:'Tronc commun'}]
const initialEleves:Eleve[]=[]
const initialNotes:Note[]=[]
const initialDevoirs:Devoir[]=[{id:'d1',titre:'Lire Aux champs + questions',classeId:'c1',date:'2026-09-10',statut:'À faire'}]
const initialDocs:DocumentPedago[]=[{id:'doc1',titre:'Fiche — Aux champs',categorie:'Œuvre',niveau:'Tronc commun',source:'lien'},{id:'doc2',titre:'Exercices — Figures de style',categorie:'Langue',niveau:'Collège',source:'lien'}]

function useStored<T>(key:string,fallback:T){const [value,setValue]=useState<T>(fallback);useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw)setValue(JSON.parse(raw))}catch{}},[key]);useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}},[key,value]);return [value,setValue] as const}

export default function TeacherApp(){
 const [preview,setPreview]=useState<DocumentPedago|null>(null)
 const [tab,setTab]=useState<string>('dashboard')
 const [classes,setClasses]=useStored('ep-classes',initialClasses),[eleves,setEleves]=useStored('ep-eleves',initialEleves),[notes,setNotes]=useStored('ep-notes',initialNotes),[devoirs,setDevoirs]=useStored('ep-devoirs',initialDevoirs),[docs,setDocs]=useStored('ep-docs',initialDocs)
 const [preferences,setPreferences]=useStored<Preferences>('ep-preferences-v2',defaultPreferences),[rubriqueNoms,setRubriqueNoms]=useStored<RubriqueNoms>('ep-rubrique-noms',defaultRubriqueNoms),[customRubriques,setCustomRubriques]=useStored<CustomRubrique[]>('ep-custom-rubriques',[])
 const [modal,setModal]=useState<null|'classe'|'eleve'|'note'|'devoir'|'document'>(null),[user,setUser]=useState<User|null>(null),[email,setEmail]=useState(''),[authMessage,setAuthMessage]=useState(''),[search,setSearch]=useState('')

 useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user??null));const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user??null));return()=>subscription.unsubscribe()},[])
 useEffect(()=>{try{if(localStorage.getItem('ep-exemples-nettoyes-v1'))return;const ids=new Set(['e1','e2','e3']);setClasses(p=>p.filter(c=>!(c.id==='c2'||c.nom.trim().toLowerCase()==='3e a')));setEleves(p=>p.filter(e=>!ids.has(e.id)));setNotes(p=>p.filter(n=>!ids.has(n.eleveId)));setDevoirs(p=>p.filter(d=>d.classeId!=='c2'));localStorage.setItem('ep-exemples-nettoyes-v1','1')}catch{}},[setClasses,setEleves,setNotes,setDevoirs])

 const moyenne=useMemo(()=>notes.length?notes.reduce((s,n)=>s+(n.valeur/n.sur*20),0)/notes.length:0,[notes])
 const classeNom=(id:string)=>classes.find(c=>c.id===id)?.nom??'—',eleveNom=(id:string)=>{const e=eleves.find(x=>x.id===id);return e?`${e.prenom} ${e.nom}`:'—'}
 const builtin:[BuiltinKey,React.ComponentType<{size?:number}>][]=[['dashboard',Home],['classes',GraduationCap],['eleves',Users],['notes',ClipboardList],['devoirs',BookOpen],['documents',FolderOpen],['bibliotheque',Library],['calendrier',CalendarDays],['statistiques',BarChart3],['parametres',Settings]]
 const customActive=tab.startsWith('custom:')?customRubriques.find(r=>`custom:${r.id}`===tab):undefined
 const pageTitle=customActive?.titre??rubriqueNoms[tab as BuiltinKey]??'Accueil'
 const filteredDocs=docs.filter(d=>`${d.titre} ${d.categorie} ${d.niveau}`.toLowerCase().includes(search.toLowerCase()))
 const initials=preferences.nom.replace(/^(M\.|Mme|Mr)\s*/i,'').trim().charAt(0).toUpperCase()||'M'
 const style={'--accent':preferences.accent} as CSSProperties

 async function sendMagicLink(){setAuthMessage('');if(!email.trim()){setAuthMessage('Saisissez votre adresse e-mail.');return}const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});setAuthMessage(error?error.message:'Lien envoyé. Ouvrez votre e-mail puis cliquez sur le lien de connexion.')}
 function openDocument(d:DocumentPedago){if(d.storagePath){setPreview(d);return}if(d.lien){try{const url=new URL(d.lien);if(!['https:','http:'].includes(url.protocol))throw new Error();window.open(url.href,'_blank','noopener,noreferrer')}catch{alert('Ce lien est invalide. Modifiez le document pour le corriger.')}}else{alert('Ajoutez un fichier ou un lien à ce document pour l’ouvrir.')}}
 async function deleteDocument(d:DocumentPedago){if(!confirm(`Supprimer « ${d.titre} » ?`))return;if(d.storagePath){if(!user){alert('Reconnectez-vous avant de supprimer ce fichier.');return}const {error}=await supabase.storage.from('documents-pedago').remove([d.storagePath]);if(error){alert(error.message);return}}setDocs(docs.filter(x=>x.id!==d.id))}
 function editDocument(d:DocumentPedago){const titre=prompt('Titre :',d.titre);if(!titre?.trim())return;const categorie=prompt('Catégorie :',d.categorie);if(!categorie?.trim())return;const niveau=prompt('Niveau :',d.niveau);if(!niveau?.trim())return;let lien=d.lien;if(d.source!=='pc'){const n=prompt('Lien :',d.lien??'');if(n===null)return;lien=n.trim()}setDocs(docs.map(x=>x.id===d.id?{...x,titre:titre.trim(),categorie:categorie.trim(),niveau:niveau.trim(),lien}:x))}
 const actions=(edit:()=>void,del:()=>void)=><div className="row-actions"><button className="action-btn edit" onClick={edit}><Pencil size={15}/> Modifier</button><button className="action-btn delete" onClick={del}><Trash2 size={15}/> Supprimer</button></div>
 function editClasse(c:Classe){const nom=prompt('Nom :',c.nom),niveau=nom?prompt('Niveau :',c.niveau):null;if(nom?.trim()&&niveau?.trim())setClasses(classes.map(x=>x.id===c.id?{...x,nom:nom.trim(),niveau:niveau.trim()}:x))}
 function deleteClasse(c:Classe){if(!confirm(`Supprimer la classe « ${c.nom} » ?`))return;const ids=new Set(eleves.filter(e=>e.classeId===c.id).map(e=>e.id));setClasses(classes.filter(x=>x.id!==c.id));setEleves(eleves.filter(e=>e.classeId!==c.id));setNotes(notes.filter(n=>!ids.has(n.eleveId)));setDevoirs(devoirs.filter(d=>d.classeId!==c.id))}
 function editEleve(e:Eleve){const nom=prompt('Nom :',e.nom),prenom=nom?prompt('Prénom :',e.prenom):null;if(!nom?.trim()||!prenom?.trim())return;const c=prompt('Classe :',classeNom(e.classeId));const selected=classes.find(x=>x.nom.toLowerCase()===c?.trim().toLowerCase());setEleves(eleves.map(x=>x.id===e.id?{...x,nom:nom.trim(),prenom:prenom.trim(),classeId:selected?.id??e.classeId}:x))}
 function deleteEleve(e:Eleve){if(confirm(`Supprimer ${e.prenom} ${e.nom} ?`)){setEleves(eleves.filter(x=>x.id!==e.id));setNotes(notes.filter(n=>n.eleveId!==e.id))}}
 function editNote(n:Note){const lib=prompt('Évaluation :',n.libelle),v=lib?prompt('Note :',String(n.valeur)):null,s=v?prompt('Sur :',String(n.sur)):null,c=s?prompt('Coefficient :',String(n.coefficient)):null;if(lib?.trim()&&v!==null&&s!==null&&c!==null)setNotes(notes.map(x=>x.id===n.id?{...x,libelle:lib.trim(),valeur:Number(v),sur:Number(s),coefficient:Number(c)}:x))}
 function editDevoir(d:Devoir){const t=prompt('Titre :',d.titre),date=t?prompt('Date :',d.date):null,st=date?prompt('Statut :',d.statut):null;if(t?.trim()&&date?.trim()&&st!==null)setDevoirs(devoirs.map(x=>x.id===d.id?{...x,titre:t.trim(),date:date.trim(),statut:st.toLowerCase().startsWith('term')?'Terminé':'À faire'}:x))}

 async function saveItem(data:any){const id=crypto.randomUUID();if(modal==='classe')setClasses([...classes,{id,...data}]);if(modal==='eleve')setEleves([...eleves,{id,...data}]);if(modal==='note')setNotes([...notes,{id,...data,valeur:Number(data.valeur),sur:Number(data.sur),coefficient:Number(data.coefficient)}]);if(modal==='devoir')setDevoirs([...devoirs,{id,...data}]);if(modal==='document'){if(data.source==='pc'){if(!user)throw new Error('Connectez-vous d’abord.');const file:File|undefined=data.fichier;if(!file)throw new Error('Choisissez un fichier.');const path=`${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const {error}=await supabase.storage.from('documents-pedago').upload(path,file,{contentType:file.type||undefined});if(error)throw error;const clean={...data};delete clean.fichier;setDocs([...docs,{id,...clean,fichierNom:file.name,storagePath:path}])}else{if(!data.lien?.trim())throw new Error('Ajoutez un lien.');setDocs([...docs,{id,...data,lien:data.lien.trim()}])}}setModal(null)}

 return <div className={`app-frame theme-${preferences.theme}`} style={style}>
  <header className="app-header"><div className="header-brand"><div className="logo-mark">📘</div><div><strong>{preferences.titreApp}</strong><small>{preferences.sousTitre}</small></div></div><div className="search-box"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."/></div><div className="profile-zone"><button className="icon-button"><Bell size={20}/></button><div className="avatar">{initials}</div><div className="profile-copy"><strong>{preferences.nom}</strong><span>{preferences.fonction}</span></div></div></header>
  <div className="shell"><aside className="sidebar"><div className="nav">{builtin.map(([k,Icon])=><button key={k} onClick={()=>setTab(k)} className={tab===k?'active':''}><Icon size={19}/>{rubriqueNoms[k]}</button>)}{customRubriques.map(r=><button key={r.id} onClick={()=>setTab(`custom:${r.id}`)} className={tab===`custom:${r.id}`?'active':''}><FolderOpen size={19}/>{r.titre}</button>)}</div><div className="sidebar-quote">Enseigner,<br/>c’est croire<br/>en demain !<div className="book-stack">📚</div></div></aside>
  <main className="main">{tab==='dashboard'?<Dashboard preferences={preferences} classes={classes} eleves={eleves} devoirs={devoirs} docs={filteredDocs} moyenne={moyenne} classeNom={classeNom} onTab={setTab} onCreate={setModal} openDocument={openDocument} labels={rubriqueNoms}/>:<><div className="top"><div><h1>{pageTitle}</h1><p>{customActive?.sousTitre??'Votre espace de travail enseignant, simple et centralisé.'}</p></div>{user?<button className="btn secondary" onClick={()=>supabase.auth.signOut()}><LogOut size={15}/> Se déconnecter</button>:<span className="pill">Connexion requise pour les fichiers</span>}</div>
   {tab==='classes'&&<Section title={rubriqueNoms.classes} add={()=>setModal('classe')}><table className="table"><thead><tr><th>Classe</th><th>Niveau</th><th>Élèves</th><th>Actions</th></tr></thead><tbody>{classes.map(c=><tr key={c.id}><td><b>{c.nom}</b></td><td>{c.niveau}</td><td>{eleves.filter(e=>e.classeId===c.id).length}</td><td>{actions(()=>editClasse(c),()=>deleteClasse(c))}</td></tr>)}</tbody></table></Section>}
   {tab==='eleves'&&<Section title={rubriqueNoms.eleves} add={()=>setModal('eleve')}><table className="table"><thead><tr><th>Nom</th><th>Prénom</th><th>Classe</th><th>Actions</th></tr></thead><tbody>{eleves.map(e=><tr key={e.id}><td>{e.nom}</td><td>{e.prenom}</td><td>{classeNom(e.classeId)}</td><td>{actions(()=>editEleve(e),()=>deleteEleve(e))}</td></tr>)}</tbody></table></Section>}
   {tab==='notes'&&<Section title={rubriqueNoms.notes} add={()=>setModal('note')}><table className="table"><thead><tr><th>Élève</th><th>Évaluation</th><th>Note</th><th>Coef.</th><th>Actions</th></tr></thead><tbody>{notes.map(n=><tr key={n.id}><td>{eleveNom(n.eleveId)}</td><td>{n.libelle}</td><td>{n.valeur}/{n.sur}</td><td>{n.coefficient}</td><td>{actions(()=>editNote(n),()=>confirm('Supprimer cette note ?')&&setNotes(notes.filter(x=>x.id!==n.id)))}</td></tr>)}</tbody></table></Section>}
   {tab==='devoirs'&&<Section title={rubriqueNoms.devoirs} add={()=>setModal('devoir')}><table className="table"><thead><tr><th>Titre</th><th>Classe</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{devoirs.map(d=><tr key={d.id}><td>{d.titre}</td><td>{classeNom(d.classeId)}</td><td>{d.date}</td><td><span className={d.statut==='À faire'?'badge warn':'badge'}>{d.statut}</span></td><td>{actions(()=>editDevoir(d),()=>confirm('Supprimer ce devoir ?')&&setDevoirs(devoirs.filter(x=>x.id!==d.id)))}</td></tr>)}</tbody></table></Section>}
   {tab==='documents'&&<section className="panel">{!user&&<div className="auth-box"><strong>Connexion sécurisée</strong><p>Pour téléverser des fichiers privés.</p><div className="auth-row"><input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.com"/><button className="btn" onClick={sendMagicLink}>Recevoir le lien</button></div>{authMessage&&<div className="auth-message">{authMessage}</div>}</div>}<div className="toolbar"><button className="btn" onClick={()=>setModal('document')}><Upload size={16}/> Ajouter un document</button></div><DocTable docs={filteredDocs} open={openDocument} edit={editDocument} del={deleteDocument}/></section>}
   {tab==='bibliotheque'&&<section className="panel"><div className="panel-heading"><h2>{rubriqueNoms.bibliotheque}</h2><button className="btn" onClick={()=>setModal('document')}><Plus size={16}/> Ajouter</button></div><div className="library-grid">{filteredDocs.map((d,i)=><div className="library-card" key={d.id}><button className="library-open" onClick={()=>openDocument(d)}><div className={`item-icon lib-${i%3}`}><BookOpen size={22}/></div><strong>{d.titre}</strong><span>{d.categorie} · {d.niveau}</span></button>{actions(()=>editDocument(d),()=>void deleteDocument(d))}</div>)}</div></section>}
   {tab==='calendrier'&&<Coming title={rubriqueNoms.calendrier} icon={<CalendarDays size={34}/>}/>} {tab==='statistiques'&&<Coming title={rubriqueNoms.statistiques} icon={<BarChart3 size={34}/>}/>} {tab==='parametres'&&<SettingsPanel preferences={preferences} onPreferences={setPreferences} rubriqueNoms={rubriqueNoms} onRubriqueNoms={setRubriqueNoms} customRubriques={customRubriques} onCustomRubriques={setCustomRubriques}/>} {customActive&&<section className="panel"><h2>{customActive.titre}</h2><p className="helper">{customActive.sousTitre}</p><div className="empty">Rubrique personnalisée prête à être utilisée.</div></section>}
  </>}</main></div>{preview&&<DocumentPreview key={preview.id} document={preview} onClose={()=>setPreview(null)}/ >}{modal&&<CrudModal type={modal} classes={classes} eleves={eleves} onClose={()=>setModal(null)} onSave={saveItem}/>}</div>
}

function Dashboard({preferences,classes,eleves,devoirs,docs,moyenne,classeNom,onTab,onCreate,openDocument,labels}:{preferences:Preferences;classes:Classe[];eleves:Eleve[];devoirs:Devoir[];docs:DocumentPedago[];moyenne:number;classeNom:(id:string)=>string;onTab:(t:string)=>void;onCreate:(type:'classe'|'eleve'|'note'|'devoir'|'document')=>void;openDocument:(d:DocumentPedago)=>void;labels:RubriqueNoms}){const pending=devoirs.filter(d=>d.statut==='À faire');return <><section className="welcome-row"><div className="welcome-title"><Sun size={38}/><div><h1>Bienvenue, {preferences.nom} !</h1><p>Votre espace de travail enseignant, simple et centralisé.</p></div></div><blockquote>« {preferences.citation} »</blockquote></section><section className="quick-actions" aria-label="Actions rapides"><div><span className="eyebrow">Pour commencer</span><strong>Que souhaitez-vous faire aujourd’hui&nbsp;?</strong></div><div className="quick-action-buttons"><button className="btn" onClick={()=>onCreate('devoir')}><Plus size={16}/> Créer un devoir</button><button className="btn secondary" onClick={()=>onCreate('eleve')}><UserPlus size={16}/> Ajouter un élève</button><button className="btn secondary" onClick={()=>onCreate('note')}><ClipboardList size={16}/> Saisir des notes</button></div></section><div className="cards"><Stat label={labels.classes} value={classes.length} icon={<GraduationCap size={30}/>} onClick={()=>onTab('classes')}/><Stat label={labels.eleves} value={eleves.length} icon={<Users size={30}/>} onClick={()=>onTab('eleves')}/><Stat label="Devoirs à faire" value={pending.length} icon={<FileText size={30}/>} onClick={()=>onTab('devoirs')}/><Stat label="Moyenne générale" value={moyenne.toFixed(1)} icon={<BarChart3 size={30}/>} onClick={()=>onTab('notes')}/></div><div className="grid2 dashboard-grid"><section className="panel modern-panel"><div className="panel-heading"><h2>Derniers devoirs</h2><button className="text-link" onClick={()=>onTab('devoirs')}>Voir tout</button></div>{pending.length?<div className="list">{pending.slice(0,5).map(d=><div className="item rich-item" key={d.id}><FileText size={20}/><div className="item-body"><strong>{d.titre}</strong><span>{classeNom(d.classeId)} · {d.date}</span></div><span className="status-chip todo">À faire</span></div>)}</div>:<EmptyState icon={<CheckCircle2 size={25}/>} text="Aucun devoir en attente." action="Créer un devoir" onAction={()=>onCreate('devoir')}/>}</section><section className="panel modern-panel"><div className="panel-heading"><h2>{labels.bibliotheque}</h2><button className="text-link" onClick={()=>onTab('bibliotheque')}>Voir tout</button></div>{docs.length?<div className="list">{docs.slice(0,5).map(d=><button className="item rich-item library-row" key={d.id} onClick={()=>openDocument(d)}><BookOpen size={20}/><div className="item-body"><strong>{d.titre}</strong><span>{d.categorie} · {d.niveau}</span></div><ChevronRight size={20}/></button>)}</div>:<EmptyState icon={<Library size={25}/>} text="Votre bibliothèque est encore vide." action="Ajouter un document" onAction={()=>onCreate('document')}/>}</section></div>{eleves.length===0&&<section className="onboarding-tip"><Users size={21}/><div><strong>Ajoutez vos élèves pour commencer.</strong><span>Vous pourrez ensuite leur attribuer des notes et suivre leurs résultats.</span></div><button className="text-link" onClick={()=>onCreate('eleve')}>Ajouter un élève</button></section>}</>}
function EmptyState({icon,text,action,onAction}:{icon:ReactNode;text:string;action:string;onAction:()=>void}){return <div className="dashboard-empty"><div>{icon}</div><p>{text}</p><button className="text-link" onClick={onAction}>{action}</button></div>}
function Stat({label,value,icon,onClick}:{label:string;value:string|number;icon:ReactNode;onClick:()=>void}){return <button className="card" onClick={onClick}><div className="card-icon">{icon}</div><div className="label">{label}</div><div className="value">{value}</div></button>}
function Section({title,add,children}:{title:string;add:()=>void;children:ReactNode}){return <section className="panel"><div className="toolbar"><button className="btn" onClick={add}><Plus size={16}/> Ajouter</button></div><h2>{title}</h2><div className="table-wrap">{children}</div></section>}
function Coming({title,icon}:{title:string;icon:ReactNode}){return <section className="panel coming-soon"><div className="coming-icon">{icon}</div><h2>{title}</h2><p>Cette rubrique est prête à être développée selon vos besoins.</p></section>}
function DocTable({docs,open,edit,del}:{docs:DocumentPedago[];open:(d:DocumentPedago)=>void;edit:(d:DocumentPedago)=>void;del:(d:DocumentPedago)=>void}){return <div className="table-wrap"><table className="table"><thead><tr><th>Document</th><th>Catégorie</th><th>Niveau</th><th>Accès</th><th>Actions</th></tr></thead><tbody>{docs.map(d=><tr key={d.id}><td><b>{d.titre}</b></td><td>{d.categorie}</td><td>{d.niveau}</td><td>{d.storagePath||d.lien?<button className="doc-link doc-button" onClick={()=>open(d)}>{d.source==='drive'?<><ExternalLink size={14}/> Google Drive</>:<><LinkIcon size={14}/> Ouvrir</>}</button>:'—'}</td><td><div className="row-actions"><button className="action-btn edit" onClick={()=>edit(d)}><Pencil size={15}/> Modifier</button><button className="action-btn delete" onClick={()=>void del(d)}><Trash2 size={15}/> Supprimer</button></div></td></tr>)}</tbody></table></div>}


function DocumentPreview({document:doc,onClose}:{document:DocumentPedago;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null)
 const [file,setFile]=useState<{url:string;kind:string}|null>(null)
 const [error,setError]=useState('')
 const [renderError,setRenderError]=useState(false)
 useEffect(()=>{
  const element=dialog.current
  element?.showModal()
  return()=>element?.close()
 },[])
 useEffect(()=>{
  let cancelled=false
  let objectUrl:string|undefined
  async function load(){
   try{
    const {data,error}=await supabase.storage.from('documents-pedago').download(doc.storagePath!)
    if(error)throw error
    if(!data)throw new Error('Fichier introuvable.')
    if(cancelled)return
    const extension=(doc.fichierNom||doc.storagePath||'').split('.').pop()?.toLowerCase()
    const types:Record<string,string>={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',avif:'image/avif',bmp:'image/bmp'}
    const mime=types[extension||'']||data.type.split(';')[0]
    const kind=mime==='application/pdf'?'pdf':['image/png','image/jpeg','image/gif','image/webp','image/avif','image/bmp'].includes(mime)?'image':'other'
    objectUrl=URL.createObjectURL(new Blob([data],{type:kind==='other'?'application/octet-stream':mime}))
    setFile({url:objectUrl,kind})
   }catch{if(!cancelled)setError('Impossible de charger ce document. Vérifiez votre connexion et reconnectez-vous si votre session a expiré.')}
  }
  void load()
  return()=>{cancelled=true;if(objectUrl)URL.revokeObjectURL(objectUrl)}
 },[doc.storagePath,doc.fichierNom])
 return <dialog ref={dialog} aria-labelledby="document-preview-title" onCancel={onClose} style={{width:'min(1100px,94vw)',maxWidth:'94vw',height:'90vh',maxHeight:'90vh',padding:20,border:'1px solid #cbd5e1',borderRadius:16,background: 'var(--bg, #fff)',color:'var(--text, #172033)'}}>
  <div style={{display:'flex',flexDirection:'column',height:'100%',gap:16}}>
   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
    <h2 id="document-preview-title" style={{margin:0,overflowWrap:'anywhere'}}>{doc.titre}</h2>
    <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
     {file&&<a className="btn secondary" href={file.url} download={doc.fichierNom||doc.storagePath?.split('/').pop()||doc.titre}>Télécharger</a>}
     <button className="btn" onClick={onClose} autoFocus>Fermer</button>
    </div>
   </div>
   {!file&&!error&&<p role="status">Chargement de l’aperçu…</p>}
   {error&&<p role="alert">{error}</p>}
   {file?.kind==='pdf'&&<object data={file.url} type="application/pdf" aria-label={doc.titre} style={{width:'100%',flex:1,minHeight:0}}><p>Votre navigateur ne peut pas afficher ce PDF. Utilisez le bouton Télécharger.</p></object>}
   {file?.kind==='image'&&!renderError&&<img src={file.url} alt={doc.titre} onError={()=>setRenderError(true)} style={{width:'100%',flex:1,minHeight:0,objectFit:'contain'}}/>}
   {(file?.kind==='other'||renderError)&&<p>Ce format ne dispose pas encore d’un aperçu intégré. Utilisez Télécharger pour l’ouvrir avec votre application habituelle. Pour une lecture directement ici, ajoutez une version PDF.</p>}
  </div>
 </dialog>
}
