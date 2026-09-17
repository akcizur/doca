import { useEffect, useMemo, useState } from 'react'
import Prism from 'prismjs'
import { Search, Menu, X, Copy, Check, Play, ChevronDown, Sun, Moon, ExternalLink, AlertTriangle, Terminal, BookOpen, Zap } from 'lucide-react'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'

type Endpoint = {
  id: string; method: string; path: string; title: string; description: string; version: string
  body?: string; curl: string; javascript: string; python: string
}

const endpoints: Endpoint[] = [
  { id:'list-posts', method:'GET', path:'/v2/posts', title:'List posts', description:'Returns a paginated collection of posts.', version:'v2', curl:'curl https://api.example.com/v2/posts', javascript:"const res = await fetch('https://api.example.com/v2/posts', {\n  headers: { Authorization: `Bearer ${API_KEY}` }\n});\nconst data = await res.json();", python:"import requests\n\nresponse = requests.get(\n  'https://api.example.com/v2/posts',\n  headers={'Authorization': f'Bearer {API_KEY}'}\n)\ndata = response.json()" },
  { id:'create-post', method:'POST', path:'/v2/posts', title:'Create a post', description:'Creates a new post and returns the persisted resource.', version:'v2', body:'{\n  "title": "Hello world",\n  "published": true\n}', curl:"curl -X POST https://api.example.com/v2/posts \\\n  -H 'Authorization: Bearer $API_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"title\":\"Hello world\",\"published\":true}'", javascript:"const res = await fetch('https://api.example.com/v2/posts', {\n  method: 'POST',\n  headers: {\n    Authorization: `Bearer ${API_KEY}`,\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({ title: 'Hello world', published: true })\n});", python:"import requests\n\nresponse = requests.post(\n  'https://api.example.com/v2/posts',\n  headers={'Authorization': f'Bearer {API_KEY}'},\n  json={'title': 'Hello world', 'published': True}\n)" },
  { id:'get-user', method:'GET', path:'/v2/users/:id', title:'Retrieve a user', description:'Fetches a single user by their public identifier.', version:'v2', curl:'curl https://api.example.com/v2/users/usr_123', javascript:"const res = await fetch('https://api.example.com/v2/users/usr_123', {\n  headers: { Authorization: `Bearer ${API_KEY}` }\n});", python:"import requests\nrequests.get(\n  'https://api.example.com/v2/users/usr_123',\n  headers={'Authorization': f'Bearer {API_KEY}'}\n)" }
]

const sections = [
  ['introduction','Introduction'], ['authentication','Authentication'], ['endpoints','Endpoints'], ['errors','Errors'], ['changelog','Changelog']
]

function slug(s:string){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') }

function Code({code, language}:{code:string; language:string}){
  const html = Prism.highlight(code, Prism.languages[language] || Prism.languages.markup, language)
  return <pre className="code"><code dangerouslySetInnerHTML={{__html:html}} /></pre>
}

function App(){
  const [mobile,setMobile]=useState(false), [searchOpen,setSearchOpen]=useState(false), [query,setQuery]=useState('')
  const [dark,setDark]=useState(()=>localStorage.getItem('darkdocs-theme')!=='light')
  const [active,setActive]=useState('introduction'), [version,setVersion]=useState('v2'), [open,setOpen]=useState<string|null>('list-posts')
  const [toast,setToast]=useState(''), [apiKey,setApiKey]=useState(()=>localStorage.getItem('darkdocs-api-key')||'')
  useEffect(()=>{document.documentElement.classList.toggle('light',!dark); localStorage.setItem('darkdocs-theme',dark?'dark':'light')},[dark])
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(true)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
  useEffect(()=>{const els=sections.map(([id])=>document.getElementById(id)).filter(Boolean) as HTMLElement[]; const obs=new IntersectionObserver(es=>{const hit=es.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(hit)setActive(hit.target.id)},{rootMargin:'-20% 0px -65% 0px'});els.forEach(e=>obs.observe(e));return()=>obs.disconnect()},[])
  const filtered=endpoints.filter(e=>e.version===version)
  const results=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return sections.map(([id,title])=>({id,title,type:'section'}));return [...sections.map(([id,title])=>({id,title,type:'section'})),...endpoints.map(e=>({id:e.id,title:`${e.method} ${e.path} — ${e.title}`,type:'endpoint'}))].filter(x=>x.title.toLowerCase().includes(q))},[query])
  const notify=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),1800)}
  const copy=async(text:string)=>{await navigator.clipboard.writeText(text);notify('Copied to clipboard')}
  const saveKey=()=>{localStorage.setItem('darkdocs-api-key',apiKey);notify('API key saved locally')}
  const tryRequest=async(e:Endpoint)=>{try{const res=await fetch(`https://api.example.com${e.path.replace(':id','usr_123')}`,{method:e.method,headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:e.method==='POST'?e.body:undefined});notify(`Response ${res.status}`)}catch{notify('Request failed — check Base URL / CORS')}}
  const go=(id:string)=>{setSearchOpen(false);setQuery('');setMobile(false);document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})}
  return <div className="app">
    <header className="topbar"><button className="brand" onClick={()=>go('introduction')}><span className="brandmark">D</span><span>DarkDocs</span><b>Pro</b></button><div className="top-actions"><button className="search-trigger" onClick={()=>setSearchOpen(true)}><Search size={16}/><span>Search documentation...</span><kbd>⌘ K</kbd></button><select aria-label="API version" value={version} onChange={e=>setVersion(e.target.value)}><option>v2</option><option>v1</option></select><button className="icon-btn" onClick={()=>setDark(v=>!v)} aria-label="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button><button className="mobile-btn icon-btn" onClick={()=>setMobile(v=>!v)} aria-label="Menu">{mobile?<X size={19}/>:<Menu size={19}/>}</button></div></header>
    <div className="layout">
      <aside className={`sidebar ${mobile?'show':''}`}><div className="side-title">Documentation</div>{sections.map(([id,title])=><button key={id} className={`nav-item ${active===id?'active':''}`} onClick={()=>go(id)}><span>{title}</span></button>)}<div className="side-bottom"><a href="https://github.com/akcizur/doca" target="_blank" rel="noreferrer">GitHub <ExternalLink size={13}/></a><span>DarkDocs Pro · 1.0</span></div></aside>
      <main className="content">
        <div className="breadcrumbs"><span>Docs</span><span>/</span><span>API Reference</span><span>/</span><b>Introduction</b></div>
        <section id="introduction" className="doc-section hero"><div className="eyebrow"><Zap size={14}/> API DOCUMENTATION</div><h1>Build with a clear, modern API.</h1><p className="lead">DarkDocs Pro is a production-ready documentation shell inspired by the information density and interaction patterns of leading developer platforms.</p><div className="hero-grid"><div className="info-card"><BookOpen size={20}/><h3>Fast to understand</h3><p>Navigation, anchors, examples and endpoint details stay in one predictable flow.</p></div><div className="info-card"><Terminal size={20}/><h3>Test requests</h3><p>Paste a key, edit parameters and execute real fetch requests directly from the reference.</p></div></div></section>
        <section id="authentication" className="doc-section"><div className="section-label">01</div><h2>Authentication <a href="#authentication">#</a></h2><p>Authenticate every request with a bearer token. Keys are stored only in your browser when you explicitly save them.</p><div className="callout"><AlertTriangle size={18}/><div><strong>Security note</strong><span>Never expose production API keys in client-side code or public repositories. The Try it panel is intended for development and internal testing.</span></div></div><div className="key-box"><label>API key</label><div className="key-row"><input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk_live_..." type="password" autoComplete="off"/><button onClick={saveKey}>Save key</button></div></div><Code code={'Authorization: Bearer $API_KEY'} language="bash"/></section>
        <section id="endpoints" className="doc-section"><div className="section-label">02</div><div className="section-head"><div><h2>Endpoints <a href="#endpoints">#</a></h2><p>Reference endpoints for the current API version.</p></div><select value={version} onChange={e=>setVersion(e.target.value)}><option>v2</option><option>v1</option></select></div>{filtered.map(e=><EndpointCard key={e.id} e={e} open={open===e.id} setOpen={()=>setOpen(open===e.id?null:e.id)} copy={copy} tryRequest={tryRequest}/>)}</section>
        <section id="errors" className="doc-section"><div className="section-label">03</div><h2>Errors <a href="#errors">#</a></h2><p>Errors use conventional HTTP status codes and a stable JSON envelope.</p><Code language="javascript" code={'{\n  "error": {\n    "code": "invalid_request",\n    "message": "The request could not be processed.",\n    "request_id": "req_01J8..."\n  }\n}'}/><div className="error-table"><div><b>400</b><span>Invalid request parameters.</span></div><div><b>401</b><span>Missing or invalid credentials.</span></div><div><b>404</b><span>Resource was not found.</span></div><div><b>429</b><span>Rate limit exceeded.</span></div></div></section>
        <section id="changelog" className="doc-section"><div className="section-label">04</div><h2>Changelog <a href="#changelog">#</a></h2><div className="change"><span>Sep 17, 2026</span><div><b>DarkDocs Pro 1.0</b><p>Initial production template with search, endpoint reference, interactive requests, local API-key storage, responsive navigation and GitHub Pages deployment.</p></div></div></section>
        <footer>DarkDocs Pro <span>•</span> Built for developers <span>•</span> Static by default</footer>
      </main>
      <aside className="toc"><div className="toc-title">On this page</div>{sections.map(([id,title])=><button key={id} className={active===id?'active':''} onClick={()=>go(id)}>{title}</button>)}</aside>
    </div>
    {searchOpen&&<div className="overlay" onMouseDown={e=>e.currentTarget===e.target&&setSearchOpen(false)}><div className="search-modal"><div className="search-input"><Search size={18}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search docs..."/><kbd>ESC</kbd></div><div className="results">{results.length?results.map(r=><button key={r.id} onClick={()=>go(r.id)}><span>{r.type==='endpoint'?<Terminal size={15}/>:<BookOpen size={15}/>}</span>{r.title}<b>↵</b></button>):<div className="empty">No matching documentation.</div>}</div></div></div>}
    {toast&&<div className="toast"><Check size={15}/>{toast}</div>}
  </div>
}

function EndpointCard({e,open,setOpen,copy,tryRequest}:{e:Endpoint;open:boolean;setOpen:()=>void;copy:(s:string)=>void;tryRequest:(e:Endpoint)=>void}){
 const [tab,setTab]=useState<'curl'|'javascript'|'python'>('curl'); const [params,setParams]=useState('');
 return <article className={`endpoint ${open?'open':''}`} id={e.id}><button className="endpoint-head" onClick={setOpen}><div className="method">{e.method}</div><div className="path">{e.path}</div><div className="endpoint-title">{e.title}</div><ChevronDown size={17}/></button>{open&&<div className="endpoint-body"><p>{e.description}</p><div className="endpoint-grid"><div><div className="mini-label">REQUEST</div><div className="code-tabs"><div className="tabs">{(['curl','javascript','python'] as const).map(t=><button className={tab===t?'selected':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div><div className="code-wrap"><button className="copy" onClick={()=>copy(e[tab])}><Copy size={14}/> Copy</button><Code code={e[tab]} language={tab==='curl'?'bash':tab}/></div></div>{e.body&&<div className="body-preview"><div className="mini-label">JSON BODY</div><Code code={e.body} language="javascript"/></div>}</div><TryPanel e={e} params={params} setParams={setParams} onTry={tryRequest}/></div></div>}</article>
}

function TryPanel({e,params,setParams,onTry}:{e:Endpoint;params:string;setParams:(s:string)=>void;onTry:(e:Endpoint)=>void}){
 return <div className="try-panel"><div className="try-head"><span><Play size={14}/> Try it</span><em>real fetch</em></div><label>Path parameters<input value={params} onChange={x=>setParams(x.target.value)} placeholder="e.g. id=usr_123"/></label><label>Base URL<input defaultValue="https://api.example.com"/></label><button className="run" onClick={()=>onTry(e)}><Play size={14} fill="currentColor"/> Send request</button><div className="response"><span>Response</span><code>Waiting for request…</code></div></div>
}

export default App
