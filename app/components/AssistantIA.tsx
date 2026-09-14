'use client'

import {useCallback,useEffect,useMemo,useState} from 'react'
import {BookOpenText,Check,Copy,Mail,MessageCircleMore,PenLine,Send,Sparkles} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'

type ToolId='chat'|'correction'|'fiche'|'email'
const tools=[
 {id:'chat' as const,title:'Discuter',short:'Poser une question',description:'Comprendre un sujet, trouver une idée ou préparer une activité.',placeholder:'Exemple : explique simplement le schéma narratif à un élève de collège…',action:'Obtenir une réponse',icon:MessageCircleMore},
 {id:'correction' as const,title:'Corriger un texte',short:'Améliorer un texte',description:'Corriger la langue tout en conservant le sens et le ton.',placeholder:'Collez le texte à corriger ici…',action:'Corriger le texte',icon:PenLine},
 {id:'fiche' as const,title:'Créer une fiche',short:'Préparer une révision',description:'Transformer un sujet en fiche claire avec exercices.',placeholder:'Exemple : les figures de style, niveau tronc commun…',action:'Créer la fiche',icon:BookOpenText},
 {id:'email' as const,title:'Rédiger un e-mail',short:'Préparer un message',description:'Obtenir un e-mail poli, naturel et prêt à adapter.',placeholder:'Exemple : prévenir les parents d’une réunion mardi à 18 h…',action:"Rédiger l’e-mail",icon:Mail},
]

declare global{interface Document{modelContext?:{registerTool:(tool:Record<string,unknown>,options?:{signal?:AbortSignal})=>void|Promise<void>}}}

export default function AssistantIA(){
 const [active,setActive]=useState<ToolId>('chat'),[input,setInput]=useState(''),[result,setResult]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(false),[copied,setCopied]=useState(false)
 const current=useMemo(()=>tools.find(tool=>tool.id===active)??tools[0],[active]),Icon=current.icon
 useEffect(()=>{fetch('/api/assistant').then(response=>response.json()).then(data=>setReady(data.ready===true)).catch(()=>setReady(false))},[])
 const generate=useCallback(async(tool:ToolId,text:string)=>{
  const clean=text.trim();if(!clean)throw new Error('Écrivez votre demande avant de continuer.')
  setBusy(true);setError('');setResult('')
  try{
   const {data}=await supabase.auth.getSession()
   if(!data.session)throw new Error('Connectez-vous d’abord dans « Mes documents », puis revenez ici.')
   const response=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({tool,input:clean})})
   const answer=await response.json().catch(()=>({error:'La réponse a été interrompue.'}))
   if(!response.ok||!answer.result)throw new Error(answer.error||'Impossible de créer le résultat.')
   setResult(answer.result);return{result:answer.result}
  }catch(reason){const message=reason instanceof Error?reason.message:'Une erreur est survenue.';setError(message);throw reason}
  finally{setBusy(false)}
 },[])
 useEffect(()=>{
  const context=document.modelContext;if(!context?.registerTool)return
  const lifecycle=new AbortController()
  try{void Promise.resolve(context.registerTool({name:'utiliser_assistant_prof',title:'Utiliser l’assistant IA',description:'Lance un des quatre outils visibles de Mon Espace Prof.',inputSchema:{type:'object',properties:{tool:{type:'string',enum:['chat','correction','fiche','email']},input:{type:'string',minLength:1,maxLength:6000}},required:['tool','input'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:async(value:unknown)=>{const request=value as{tool?:ToolId;input?:string};if(!request.tool||!tools.some(tool=>tool.id===request.tool)||!request.input?.trim())throw new Error('Demande invalide.');setActive(request.tool);setInput(request.input);return generate(request.tool,request.input)}},{signal:lifecycle.signal})).catch(()=>undefined)}catch{}
  return()=>lifecycle.abort()
 },[generate])
 function switchTool(id:ToolId){setActive(id);setInput('');setResult('');setError('');setCopied(false)}
 async function copy(){await navigator.clipboard.writeText(result);setCopied(true);window.setTimeout(()=>setCopied(false),1800)}
 return <section className="ai-page">
  <div className="ai-intro"><div className="ai-mark"><Sparkles size={24}/></div><div><h2>Assistant IA</h2><p>Quatre outils simples pour préparer votre travail plus rapidement.</p></div><span className={ready?'ai-status ready':'ai-status'}>{ready?'Service prêt':'Activation nécessaire'}</span></div>
  <div className="ai-privacy"><strong>Avant de commencer :</strong> le texte est envoyé à OpenAI uniquement lorsque vous cliquez sur le bouton. Ne saisissez pas de mot de passe ni de donnée médicale ou très sensible.</div>
  <div className="ai-layout"><nav className="ai-tools" aria-label="Outils de l’assistant">{tools.map(tool=>{const ToolIcon=tool.icon;return <button key={tool.id} className={active===tool.id?'active':''} onClick={()=>switchTool(tool.id)}><span><ToolIcon size={20}/></span><div><strong>{tool.title}</strong><small>{tool.short}</small></div></button>})}</nav>
   <div className="ai-workspace panel"><div className="ai-heading"><div><Icon size={25}/></div><span><h3>{current.title}</h3><p>{current.description}</p></span></div><label className="ai-label" htmlFor="ai-request">Votre demande</label><textarea id="ai-request" className="input ai-textarea" maxLength={6000} value={input} onChange={event=>setInput(event.target.value)} placeholder={current.placeholder}/><div className="ai-actions"><small>{input.length.toLocaleString('fr-FR')} / 6 000 caractères</small><button className="btn" disabled={!ready||busy||!input.trim()} onClick={()=>void generate(active,input)}>{busy?<><span className="ai-spinner"/>Préparation…</>:<>{current.action}<Send size={16}/></>}</button></div></div>
  </div>
  <section className="panel ai-result"><div className="panel-heading"><div><h2>Votre résultat</h2>{!result&&!busy&&<p className="helper">Il apparaîtra ici, prêt à être relu et copié.</p>}</div>{result&&<button className="btn secondary" onClick={copy}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Copié':'Copier'}</button>}</div>{busy&&<div className="ai-loading" role="status"><i/><i/><i/></div>}{error&&<div className="ai-error" role="alert">{error}</div>}{result&&<div className="ai-output" aria-live="polite">{result}</div>}</section>
 </section>
}
