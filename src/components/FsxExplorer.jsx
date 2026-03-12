import { useState } from 'react'
import { DEMO_COMMESSE, SETTORI, calcFsxPaths } from '../data/seedData.js'
import { Folder, FolderOpen, HardDrive, Copy, ChevronRight, ChevronDown } from 'lucide-react'

const C = { dark:'#1A2E44', mid:'#2C4A6E', amber:'#C8851C', muted:'#5A7A99' }

const CDE_AREAS = [
  { id:'00_admin',    label:'00_admin',    icon:'⚙️',  desc:'Contratti, governance',     color:'#546E7A', state:'ADMIN'     },
  { id:'01_wip',      label:'01_wip',      icon:'✏️',  desc:'Work In Progress',          color:'#1B5E20', state:'WIP'       },
  { id:'02_shared',   label:'02_shared',   icon:'🤝',  desc:'Coordinamento cross-team',  color:'#E65100', state:'SHARED'    },
  { id:'03_published',label:'03_published',icon:'✅',  desc:'Approvato / congelato',     color:'#1565C0', state:'PUBLISHED' },
  { id:'04_delivered',label:'04_delivered',icon:'📦',  desc:'Consegna contrattuale',     color:'#4527A0', state:'DELIVERED' },
  { id:'99_archive',  label:'99_archive',  icon:'🗄',  desc:'Archivio',                  color:'#546E7A', state:'ARCHIVE'   },
]
const SUB_TYPES = ['BIM','DOC','GIS','IMAGES']
const SPECIAL = [
  { path:'/fsx/ekb',       icon:'🧠', desc:'Engineering Knowledge Base — fonte AI/Copilot',  color:'#6A1B9A' },
  { path:'/fsx/templates', icon:'📋', desc:'Template standard (read-only)',                    color:'#2C4A6E' },
  { path:'/fsx/libraries', icon:'📚', desc:'Librerie tecniche condivise (read-only)',           color:'#2C4A6E' },
  { path:'/fsx/legacy_snapshot_YYYYMMDD', icon:'⏪', desc:'Snapshot legacy migrato AS-IS',    color:'#90A4AE' },
]

function TreeNode({ label, icon, children, depth=0, color='#2C4A6E', badge, onCopy }) {
  const [open, setOpen] = useState(depth < 2)
  return (
    <div>
      <div
        onClick={() => setOpen(o=>!o)}
        style={{
          display:'flex', alignItems:'center', gap:6,
          padding:`5px ${8 + depth*16}px`, cursor:'pointer', borderRadius:4,
          ':hover':{ background:'#EEF2F7' }
        }}
        onMouseOver={e=>e.currentTarget.style.background='#EEF2F7'}
        onMouseOut={e=>e.currentTarget.style.background='transparent'}
      >
        {children ? (
          open ? <ChevronDown size={12} color={C.muted}/> : <ChevronRight size={12} color={C.muted}/>
        ) : <span style={{width:12}}/>}
        <span>{icon}</span>
        <code style={{ fontSize:11, color, fontFamily:'monospace', flex:1 }}>{label}</code>
        {badge && (
          <span style={{ fontSize:9, background:color+'22', color, borderRadius:3, padding:'1px 5px', fontWeight:700 }}>
            {badge}
          </span>
        )}
        {onCopy && (
          <button onClick={e=>{e.stopPropagation(); onCopy()}}
            style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
            <Copy size={11} color={C.muted} />
          </button>
        )}
      </div>
      {open && children && <div>{children}</div>}
    </div>
  )
}

function Leaf({ label, icon='📄', depth=0, path }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:`4px ${8+depth*16}px` }}>
      <span style={{ width:12 }}/>
      <span>{icon}</span>
      <code style={{ fontSize:11, color:C.muted, fontFamily:'monospace', flex:1 }}>{label}</code>
      <button onClick={()=>{navigator.clipboard?.writeText(path||label); setCopied(true); setTimeout(()=>setCopied(false),1500)}}
        style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
        <Copy size={11} color={copied?'#1B5E20':C.muted} />
      </button>
    </div>
  )
}

export default function FsxExplorer() {
  const [selectedPath, setSelectedPath] = useState(null)
  const [copied, setCopied] = useState('')

  const copy = (path) => {
    navigator.clipboard?.writeText(path)
    setCopied(path)
    setTimeout(()=>setCopied(''), 1800)
  }

  return (
    <div style={{ padding:32, display:'grid', gridTemplateColumns:'420px 1fr', gap:24, alignItems:'start' }}>
      {/* Tree */}
      <div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:C.amber, fontWeight:700, letterSpacing:2, marginBottom:4 }}>CDE STRUCTURE</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:C.dark }}>FSx Explorer</h1>
          <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>
            Struttura ISO 19650 — generata dinamicamente da COMMESSE e LOTTI in SP
          </p>
        </div>

        <div style={{ background:'#fff', border:'1px solid #DEE6EF', borderRadius:10, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', background:'#1A2E44', display:'flex', alignItems:'center', gap:8 }}>
            <HardDrive size={14} color='#C8851C' />
            <code style={{ fontSize:13, fontWeight:700, color:'#fff', fontFamily:'monospace' }}>/fsx</code>
            <span style={{ fontSize:10, color:'#8A9BB0', marginLeft:'auto' }}>Root FSx — immutable</span>
          </div>
          <div style={{ padding:'8px 0', maxHeight:560, overflowY:'auto' }}>
            {/* Clients tree */}
            <TreeNode label="/fsx/clients/" icon="📁" depth={0} color={C.mid} badge="OPERATIVO">
              {SETTORI.map(sett => (
                <TreeNode key={sett.cod} label={`/clients/${sett.cod}/`} icon="🏢" depth={1} color={sett.color}
                  badge={DEMO_COMMESSE.filter(c=>c.settore===sett.cod).length > 0 ? `${DEMO_COMMESSE.filter(c=>c.settore===sett.cod).length}` : null}
                >
                  {DEMO_COMMESSE.filter(c=>c.settore===sett.cod).map(c => (
                    <TreeNode key={c.id} label={`/${c.cod}/`} icon="📂" depth={2} color={sett.color}>
                      {c.lotti.map(l => (
                        <TreeNode key={l.id} label={`/${l.cod}/`} icon="📂" depth={3} color={C.mid}>
                          {CDE_AREAS.map(area => (
                            <TreeNode key={area.id} label={`/${area.id}/`} icon={area.icon} depth={4} color={area.color}
                              badge={area.state}
                            >
                              {SUB_TYPES.map(sub => (
                                <Leaf key={sub} label={`/${sub}/`} icon={sub==='BIM'?'🏗':sub==='DOC'?'📄':sub==='GIS'?'🗺':'🖼'}
                                  depth={5} path={`${calcFsxPaths(c.settore,c.cod,l.cod).wip}${sub}/`} />
                              ))}
                            </TreeNode>
                          ))}
                        </TreeNode>
                      ))}
                    </TreeNode>
                  ))}
                </TreeNode>
              ))}
            </TreeNode>

            {/* Special folders */}
            {SPECIAL.map(sp => (
              <Leaf key={sp.path} label={sp.path} icon={sp.icon} depth={0}
                path={sp.path} />
            ))}
          </div>
        </div>
      </div>

      {/* Right: info panel */}
      <div>
        {/* ISO 19650 legend */}
        <div style={{ background:'#fff', border:'1px solid #DEE6EF', borderRadius:10, marginBottom:16, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', background:'#F4F6F9', borderBottom:'1px solid #DEE6EF' }}>
            <span style={{ fontSize:13, fontWeight:700, color:C.dark }}>Aree CDE — ISO 19650</span>
          </div>
          <div style={{ padding:16 }}>
            {CDE_AREAS.map(area => (
              <div key={area.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'8px 0',
                borderBottom:'1px solid #EEF2F7'
              }}>
                <span style={{
                  fontSize:10, fontWeight:700, padding:'3px 8px',
                  borderRadius:4, background:area.color+'22', color:area.color,
                  minWidth:80, textAlign:'center'
                }}>{area.state}</span>
                <code style={{ fontSize:11, color:C.mid, fontFamily:'monospace', minWidth:130 }}>{area.label}</code>
                <span style={{ fontSize:12, color:C.muted }}>{area.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Paths calcolati per ogni lotto */}
        <div style={{ background:'#fff', border:'1px solid #DEE6EF', borderRadius:10, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', background:'#F4F6F9', borderBottom:'1px solid #DEE6EF' }}>
            <span style={{ fontSize:13, fontWeight:700, color:C.dark }}>Path Calcolati da SP — Tutti i Lotti</span>
          </div>
          <div style={{ maxHeight:380, overflowY:'auto' }}>
            {DEMO_COMMESSE.map(c => {
              const sett = SETTORI.find(s=>s.cod===c.settore)||{color:'#666'}
              return c.lotti.map(l => {
                const p = calcFsxPaths(c.settore, c.cod, l.cod)
                return (
                  <div key={l.id} style={{ padding:'12px 16px', borderBottom:'1px solid #EEF2F7' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{
                        fontSize:10, fontWeight:700, background:sett.color,
                        color:'#fff', borderRadius:3, padding:'1px 6px'
                      }}>{c.settore}</span>
                      <strong style={{ fontSize:12, color:C.dark }}>{l.cod}</strong>
                    </div>
                    {[['WIP', p.wip],['ISSUED',p.issued],['EKB',p.ekb]].map(([lbl,path]) => (
                      <div key={lbl} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                        <span style={{ fontSize:9, color:C.muted, minWidth:42, fontWeight:700 }}>{lbl}</span>
                        <code style={{
                          fontSize:9.5, color:'#1565C0', fontFamily:'monospace',
                          flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                        }}>{path}</code>
                        <button onClick={()=>copy(path)}
                          style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
                          <Copy size={10} color={copied===path?'#1B5E20':C.muted} />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              })
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
