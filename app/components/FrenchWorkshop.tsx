'use client'

import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from 'react'

type Classe = { id:string; nom:string; niveau:string }
type Eleve = { id:string; nom:string; classeId:string }
type Document = { id:string; titre:string; type:string; contenu:string; niveau:string; updatedAt:string }
type Note = { id:string; eleveId:string; competence:string; valeur:number; sur:number }
type Atelier = 'accueil'|'classes'|'lecons'|'exercices'|'controles'|'suivi'|'bibliotheque'|'corrections'

const key = 'mon-atelier-francais-v1'
const uid = () => crypto.randomUUID()
const stamp = () => new Date().toLocaleDateString('fr-MA',{day:'2-digit',month:'long',year:'numeric'})

function download(name:string, content:string, type='text/html;charset=utf-8') {
  const blob = new Blob([content], {type})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download=name; a.click()
  URL.revokeObjectURL(url)
}
function printable(title:string, body:string) {
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>'+title+'</title><style>body{font-family:Arial,sans-serif;color:#111;margin:30px;line-height:1.55}h1{font-size:22px;border-bottom:2px solid #222;padding-bottom:8px}h2{font-size:17px;margin-top:24px}.meta{font-size:13px}.answer{height:50px;border-bottom:1px dotted #444;margin:8px 0}.points{float:right;border:1px solid #222;padding:1px 7px;font-size:12px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #222;padding:7px;text-align:left}@media print{button{display:none}}</style></head><body><h1>'+title+'</h1>'+body+'</body></html>'
}
function saveFile(doc:Document) { download(doc.titre.replace(/[^\w-]+/g,'-')+'.html', printable(doc.titre, doc.contenu)) }

export default function FrenchWorkshop(){
 const [tab,setTab]=useState<Atelier>('accueil')
 const [classes,setClasses]=useState<Classe[]>([])
 const [eleves,setEleves]=useState<Eleve[]>([])
 const [documents,setDocuments]=useState<Document[]>([])
 const [notes,setNotes]=useState<Note[]>([])
 const [active,setActive]=useState<Document|null>(null)
 const [message,setMessage]=useState('')
 const [form,setForm]=useState({niveau:'Tronc commun',notion:'Le discours direct et indirect',duree:'55 minutes',difficultes:'Vocabulaire limité et phrases longues'})
 const [exercise,setExercise]=useState({niveau:'Collège',theme:'Le discours direct et indirect',format:'Transformation de phrases',difficulty:'Progressif'})
 const [control,setControl]=useState({niveau:'Tronc commun',competence:'Compréhension et langue',questions:4,difficulty:'Intermédiaire',writing:true})

 useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw){const s=JSON.parse(raw);setClasses(s.classes||[]);setEleves(s.eleves||[]);setDocuments(s.documents||[]);setNotes(s.notes||[])}}catch{}},[])
 useEffect(()=>{localStorage.setItem(key,JSON.stringify({classes,eleves,documents,notes}))},[classes,eleves,documents,notes])
 const recent=[...documents].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5)
 const average=useMemo(()=>notes.length?notes.reduce((n,x)=>n+x.valeur/x.sur*20,0)/notes.length:0,[notes])

 function addDoc(type:string,titre:string,contenu:string,niveau:string){
  const doc={id:uid(),type,titre,contenu,niveau,updatedAt:new Date().toISOString()}
  setDocuments(current=>[doc,...current]); setActive(doc); setTab('bibliotheque'); setMessage('Document créé et sauvegardé automatiquement.')
 }
 function createLesson(){
  const {niveau,notion,duree,difficultes}=form
  addDoc('Leçon','Leçon — '+notion,
   '<p class="meta"><b>Niveau :</b> '+niveau+' &nbsp; <b>Durée :</b> '+duree+'</p><h2>Objectif</h2><p>Identifier et employer correctement : <b>'+notion+'</b>.</p><h2>Mise en situation</h2><p>Présenter une situation proche du vécu des élèves, puis faire formuler une première observation.</p><h2>Support d’observation</h2><p>Support à adapter par le professeur. Aucun extrait littéraire ni citation n’est inventé.</p><h2>Découverte guidée</h2><ol><li>Que remarquez-vous ?</li><li>Quels mots ou indices vous aident ?</li><li>Comment reformuler la règle ?</li></ol><h2>Règle courte</h2><p>À compléter ou ajuster avec les observations de la classe.</p><h2>Exercices progressifs</h2><ol><li>Repérer.</li><li>Transformer.</li><li>Réemployer dans une phrase personnelle.</li></ol><h2>Activité orale / jeu</h2><p>Défi en binômes : une minute pour expliquer la règle avec un exemple.</p><h2>Trace écrite</h2><p>Je retiens : …</p><h2>Déroulement</h2><table><tr><th>Temps</th><th>Étape</th></tr><tr><td>10 min</td><td>Mise en situation</td></tr><tr><td>15 min</td><td>Observation et découverte</td></tr><tr><td>15 min</td><td>Règle et exercices</td></tr><tr><td>15 min</td><td>Réemploi et trace écrite</td></tr></table><h2>Adaptation</h2><p>Difficultés signalées : '+difficultes+'. Prévoir des consignes courtes et un exemple résolu.</p><hr><h2>Corrigé séparé</h2><p>À compléter après validation des exercices choisis.</p>',niveau)
 }
 function regenerate(part:string){
  if(!active)return
  const replacement='<h2>'+part+'</h2><p>Nouvelle proposition à relire et adapter au niveau de la classe.</p>'
  const updated={...active,contenu:active.contenu.replace(new RegExp('<h2>'+part+'[\\s\\S]*?(?=<h2|<hr|$)','i'),replacement),updatedAt:new Date().toISOString()}
  setActive(updated);setDocuments(ds=>ds.map(d=>d.id===updated.id?updated:d));setMessage('La partie « '+part+' » a été régénérée. Le reste du document est conservé.')
 }
 function createExercise(){
  const q = exercise.format==='Vrai ou faux justifié' ? '<ol><li>Affirmation 1. Vrai ou faux ? Justifiez.<div class="answer"></div></li><li>Affirmation 2. Vrai ou faux ? Justifiez.<div class="answer"></div></li></ol>' :
   '<ol><li>Consigne 1 : '+exercise.format+'.<div class="answer"></div></li><li>Consigne 2 : '+exercise.format+'.<div class="answer"></div></li><li>Consigne 3 : réemploi personnel.<div class="answer"></div></li></ol>'
  addDoc('Exercice','Exercices — '+exercise.theme,'<p class="meta"><b>Niveau :</b> '+exercise.niveau+' · <b>Difficulté :</b> '+exercise.difficulty+'</p><h2>'+exercise.theme+'</h2><p>Lis attentivement chaque consigne. Réponds avec des phrases complètes lorsque cela est demandé.</p>'+q+'<hr><h2>Corrigé</h2><p>À compléter et vérifier par le professeur avant impression.</p>',exercise.niveau)
 }
 function questions(version:string){
  const count=Math.max(2,Math.min(6,Number(control.questions)))
  const available=20-(control.writing?6:0)
  const each=Math.floor(available/count)
  const values=Array.from({length:count},(_,i)=>i===count-1?available-each*(count-1):each)
  const total=values.reduce((a,b)=>a+b,0)+(control.writing?6:0)
  return '<p class="meta"><b>Niveau :</b> '+control.niveau+' · <b>Compétence :</b> '+control.competence+' · <b>Version :</b> '+version+' · <b>Barème :</b> '+total+'/20</p><p><b>Nom et prénom :</b> _________________________________ &nbsp; <b>Classe :</b> __________</p><h2>Consignes</h2><p>Lis toutes les questions. Soigne la présentation et justifie lorsque cela est demandé.</p>'+values.map((p,i)=>'<h2>Question '+(i+1)+' <span class="points">'+p+' pts</span></h2><p>'+(['Repère un élément utile dans le support fourni par le professeur.','Transforme ou reformule en respectant la notion étudiée.','Explique ton choix avec une phrase complète.','Réemploie la notion dans une situation nouvelle.'][i]||'Réponds à la consigne.')+'</p><div class="answer"></div><div class="answer"></div>').join('')+(control.writing?'<h2>Production écrite <span class="points">6 pts</span></h2><p>Rédige un court paragraphe organisé en respectant le sujet donné par le professeur.</p><div class="answer"></div><div class="answer"></div><div class="answer"></div>':'')+'<hr><h2>Corrigé et barème</h2><p>Corrigé à compléter et valider par le professeur. Total vérifié : <b>'+total+'/20</b>.</p>'
 }
 function createControls(){
  addDoc('Contrôle','Contrôle A — '+control.competence,questions('A'),control.niveau)
  setTimeout(()=>addDoc('Contrôle','Contrôle B — '+control.competence,questions('B'),control.niveau),0)
 }
 function backup(){download('sauvegarde-mon-atelier-francais.json',JSON.stringify({classes,eleves,documents,notes},null,2),'application/json')}
 function restore(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(String(reader.result));setClasses(data.classes||[]);setEleves(data.eleves||[]);setDocuments(data.documents||[]);setNotes(data.notes||[]);setMessage('Sauvegarde restaurée.')}catch{setMessage('Ce fichier de sauvegarde est invalide.')}};reader.readAsText(file)}
 const nav:[Atelier,string][]=[['accueil','Accueil'],['classes','Mes classes'],['lecons','Préparer une leçon'],['exercices','Créer des exercices'],['controles','Préparer un contrôle'],['corrections','Corriger des copies'],['bibliotheque','Ma bibliothèque'],['suivi','Suivre les progrès']]
 return <div className="atelier">
  <header><div><b>Mon Atelier de Français</b><span>Outil personnel du professeur</span></div><div className="save">● Sauvegarde automatique</div></header>
  <div className="layout"><aside>{nav.map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}<hr/><button onClick={backup}>Télécharger une sauvegarde</button><label className="restore">Restaurer<input type="file" accept="application/json" onChange={restore}/></label></aside>
  <main>{message&&<div className="notice">{message}<button onClick={()=>setMessage('')}>×</button></div>}
   {tab==='accueil'&&<><section className="hero"><div><p className="eyebrow">TABLEAU DE BORD</p><h1>Bonjour ! Préparons un cours clair et vivant.</h1><p>Vos données restent dans ce navigateur tant que vous n’activez pas une synchronisation.</p></div><div className="quick"><b>Accès rapide</b><button onClick={()=>setTab('lecons')}>Nouvelle leçon</button><button onClick={()=>setTab('controles')}>Nouveau contrôle</button></div></section><div className="cards"><Metric label="Classes" value={classes.length}/><Metric label="Élèves" value={eleves.length}/><Metric label="Documents" value={documents.length}/><Metric label="Moyenne /20" value={average.toFixed(1)}/></div><Panel title="Derniers documents">{recent.length?recent.map(d=><button className="row" key={d.id} onClick={()=>{setActive(d);setTab('bibliotheque')}}><span>{d.type}</span><b>{d.titre}</b><small>{d.niveau}</small></button>):<Empty text="Aucun document pour l’instant. Commencez par une leçon ou un exercice."/ >}</Panel></>}
   {tab==='classes'&&<Classes classes={classes} setClasses={setClasses} eleves={eleves} setEleves={setEleves}/>}
   {tab==='lecons'&&<Panel title="Préparer une leçon"><p className="hint">La leçon reste entièrement modifiable. Importez votre texte lorsqu’un support littéraire précis est nécessaire.</p><FormRow label="Niveau"><select value={form.niveau} onChange={e=>setForm({...form,niveau:e.target.value})}><option>Collège</option><option>Tronc commun</option><option>1re année baccalauréat</option></select></FormRow><FormRow label="Notion"><input value={form.notion} onChange={e=>setForm({...form,notion:e.target.value})}/></FormRow><FormRow label="Durée"><input value={form.duree} onChange={e=>setForm({...form,duree:e.target.value})}/></FormRow><FormRow label="Difficultés"><textarea value={form.difficultes} onChange={e=>setForm({...form,difficultes:e.target.value})}/></FormRow><button className="primary" onClick={createLesson}>Créer la leçon modifiable</button></Panel>}
   {tab==='exercices'&&<Panel title="Créer des exercices"><FormRow label="Niveau"><input value={exercise.niveau} onChange={e=>setExercise({...exercise,niveau:e.target.value})}/></FormRow><FormRow label="Thème"><input value={exercise.theme} onChange={e=>setExercise({...exercise,theme:e.target.value})}/></FormRow><FormRow label="Format"><select value={exercise.format} onChange={e=>setExercise({...exercise,format:e.target.value})}>{['Transformation de phrases','Classement','Phrases à compléter','Vrai ou faux justifié','Devinettes','Association','Recherche d’erreurs','Rédaction courte'].map(x=><option key={x}>{x}</option>)}</select></FormRow><FormRow label="Difficulté"><select value={exercise.difficulty} onChange={e=>setExercise({...exercise,difficulty:e.target.value})}><option>Guidé</option><option>Progressif</option><option>Défi</option></select></FormRow><button className="primary" onClick={createExercise}>Créer l’exercice</button></Panel>}
   {tab==='controles'&&<Panel title="Préparer un contrôle imprimable"><p className="hint">Deux versions équivalentes et leurs corrigés sont créés. Le total du barème est vérifié sur 20.</p><FormRow label="Niveau"><input value={control.niveau} onChange={e=>setControl({...control,niveau:e.target.value})}/></FormRow><FormRow label="Compétence"><input value={control.competence} onChange={e=>setControl({...control,competence:e.target.value})}/></FormRow><FormRow label="Questions"><input type="number" min="2" max="6" value={control.questions} onChange={e=>setControl({...control,questions:Number(e.target.value)})}/></FormRow><FormRow label="Production écrite"><input type="checkbox" checked={control.writing} onChange={e=>setControl({...control,writing:e.target.checked})}/></FormRow><button className="primary" onClick={createControls}>Créer les versions A et B</button></Panel>}
   {tab==='bibliotheque'&&<><Panel title="Bibliothèque et documents">{documents.length?<div className="doclist">{documents.map(d=><button className="doc" key={d.id} onClick={()=>setActive(d)}><span>{d.type}</span><b>{d.titre}</b><small>{d.niveau} · {new Date(d.updatedAt).toLocaleDateString('fr-MA')}</small></button>)}</div>:<Empty text="Vos leçons, exercices et contrôles apparaîtront ici."/ >}</Panel>{active&&<section className="editor"><div className="editorhead"><div><p className="eyebrow">{active.type}</p><input value={active.titre} onChange={e=>{const u={...active,titre:e.target.value};setActive(u);setDocuments(ds=>ds.map(d=>d.id===u.id?u:d))}}/></div><div><select onChange={e=>regenerate(e.target.value)} defaultValue=""><option value="" disabled>Régénérer une partie</option>{['Mise en situation','Découverte guidée','Règle courte','Exercices progressifs','Activité orale / jeu','Trace écrite'].map(x=><option key={x}>{x}</option>)}</select><button onClick={()=>saveFile(active)}>Télécharger DOC compatible</button><button className="primary" onClick={()=>{const w=window.open('','_blank');if(w){w.document.write(printable(active.titre,active.contenu));w.document.close();w.print()}}}>Imprimer / PDF</button></div></div><div className="warning">Vérifiez le contenu avant impression. Aucun extrait, citation ou numéro de page littéraire n’est inventé.</div><div className="editable" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{__html:active.contenu}} onInput={e=>{const u={...active,contenu:e.currentTarget.innerHTML,updatedAt:new Date().toISOString()};setActive(u);setDocuments(ds=>ds.map(d=>d.id===u.id?u:d))}}/></section>}</>}
   {tab==='suivi'&&<Progress classes={classes} eleves={eleves} notes={notes} setNotes={setNotes}/>}
   {tab==='corrections'&&<Panel title="Corriger des copies"><p className="hint">La correction assistée de copies photographiées sera ajoutée après choix du service de reconnaissance. Pour protéger les données, les noms pourront être masqués avant tout envoi externe.</p><div className="coming"><b>Étape prévue :</b> import PDF/images, recadrage, transcription avec passages incertains, puis proposition de note modifiable selon votre barème.</div></Panel>}
  </main></div></div>
}
function Metric({label,value}:{label:string,value:string|number}){return <div className="metric"><span>{label}</span><b>{value}</b></div>}
function Panel({title,children}:{title:string,children:ReactNode}){return <section className="panel"><h2>{title}</h2>{children}</section>}
function Empty({text}:{text:string}){return <p className="empty">{text}</p>}
function FormRow({label,children}:{label:string,children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
function Classes({classes,setClasses,eleves,setEleves}:{classes:Classe[],setClasses:(x:Classe[])=>void,eleves:Eleve[],setEleves:(x:Eleve[])=>void}){
 const [name,setName]=useState('');const [level,setLevel]=useState('Tronc commun');const [student,setStudent]=useState('');const [classId,setClassId]=useState('')
 return <><Panel title="Mes classes"><div className="inline"><input placeholder="Nom de la classe" value={name} onChange={e=>setName(e.target.value)}/><select value={level} onChange={e=>setLevel(e.target.value)}><option>Collège</option><option>Tronc commun</option><option>1re année baccalauréat</option></select><button className="primary" onClick={()=>{if(name.trim()){setClasses([...classes,{id:uid(),nom:name,niveau:level}]);setName('')}}}>Ajouter</button></div>{classes.map(c=><div className="row" key={c.id}><b>{c.nom}</b><span>{c.niveau}</span><small>{eleves.filter(e=>e.classeId===c.id).length} élèves</small><button onClick={()=>{if(confirm('Supprimer cette classe et ses élèves ?')){setClasses(classes.filter(x=>x.id!==c.id));setEleves(eleves.filter(x=>x.classeId!==c.id))}}}>Supprimer</button></div>)}</Panel><Panel title="Élèves"><div className="inline"><input placeholder="Nom et prénom" value={student} onChange={e=>setStudent(e.target.value)}/><select value={classId} onChange={e=>setClassId(e.target.value)}><option value="">Choisir une classe</option>{classes.map(c=><option value={c.id} key={c.id}>{c.nom}</option>)}</select><button className="primary" onClick={()=>{if(student.trim()&&classId){setEleves([...eleves,{id:uid(),nom:student,classeId}]);setStudent('')}}}>Ajouter</button></div>{eleves.map(e=><div className="row" key={e.id}><b>{e.nom}</b><span>{classes.find(c=>c.id===e.classeId)?.nom||'—'}</span><button onClick={()=>setEleves(eleves.filter(x=>x.id!==e.id))}>Supprimer</button></div>)}</Panel></>
}
function Progress({classes,eleves,notes,setNotes}:{classes:Classe[],eleves:Eleve[],notes:Note[],setNotes:(x:Note[])=>void}){const [e,setE]=useState('');const [c,setC]=useState('Grammaire');const [v,setV]=useState('');return <Panel title="Suivre les progrès"><div className="inline"><select value={e} onChange={x=>setE(x.target.value)}><option value="">Élève</option>{eleves.map(x=><option value={x.id} key={x.id}>{x.nom} — {classes.find(k=>k.id===x.classeId)?.nom}</option>)}</select><input value={c} onChange={x=>setC(x.target.value)} placeholder="Compétence"/><input type="number" min="0" max="20" value={v} onChange={x=>setV(x.target.value)} placeholder="Note /20"/><button className="primary" onClick={()=>{if(e&&v)setNotes([...notes,{id:uid(),eleveId:e,competence:c,valeur:Number(v),sur:20}])}}>Enregistrer</button></div>{notes.length?<table><thead><tr><th>Élève</th><th>Compétence</th><th>Résultat</th><th></th></tr></thead><tbody>{notes.map(n=><tr key={n.id}><td>{eleves.find(e=>e.id===n.eleveId)?.nom||'Élève supprimé'}</td><td>{n.competence}</td><td>{n.valeur}/{n.sur}</td><td><button onClick={()=>setNotes(notes.filter(x=>x.id!==n.id))}>Supprimer</button></td></tr>)}</tbody></table>:<Empty text="Enregistrez les premiers résultats pour repérer les difficultés récurrentes."/ >}</Panel>}