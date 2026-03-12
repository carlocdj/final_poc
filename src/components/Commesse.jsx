import { useState } from 'react'
import { DEMO_COMMESSE, SETTORI, CDE_STATE_COLOR, calcFsxPaths } from '../data/seedData.js'
import { FolderOpen, ChevronRight, ExternalLink, Copy } from 'lucide-react'

const C = { dark:'#1A2E44', mid:'#2C4A6E', amber:'#C8851C', muted:'#5A7A99' }

function FsxPathChip({ path, label }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
      <span style={{ fontSize:10, color:C.muted, minWidth:52 }}>{label}</span>
      <code style={{
        fontSize:10, background:'#EEF2F7', padding:'2px 8px', borderRadius:4,
        color:'#1565C0', fontFamily:'monospace', flex:1, overflow:'hidden',
        textOverflow:'ellipsis', whiteSpace:'nowrap'
      }}>{path}</code>
      <button
        onClick={() => { navigator.clipboard?.writeText(path); setCopied(true); setTimeout(()=>setCopied(false),1500) }}
        style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}
        title="Copia path">
        <Copy size={12} color={copied?'#1B5E20':C.muted} />
      </button>
    </div>
  )
}

export default function Commesse({ onOpenLotto }) {
  const [expanded, setExpanded] = useState({})
  const [filterSett, setFilterSett] = useState('ALL')

  const shown = filterSett === 'ALL'
    ? DEMO_COMMESSE
    : DEMO_COMMESSE.filter(c => c.settore === filterSett)

  return (
    <div style={{ padding:32 }}>
      <div style={{ marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontSize:11, color:C.amber, fontWeight:700, letterSpacing:2, marginBottom:4 }}>SP LIST: COMMESSE + LOTTI</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:C.dark }}>Gestione Commesse</h1>
          <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>
            SP è il Source of Truth · Ogni record ha i path FSx calcolati · Il PM non naviga mai FSx direttamente
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['ALL',...SETTORI.map(s=>s.cod)].map(cod => {
            const sett = SETTORI.find(s=>s.cod===cod)
            return (
              <button key={cod}
                onClick={() => setFilterSett(cod)}
                style={{
                  padding:'5px 12px', borderRadius:5, border:'1px solid #DEE6EF',
                  background: filterSett===cod ? (sett?.color||C.dark) : '#fff',
                  color: filterSett===cod ? '#fff' : C.muted,
                  fontSize:11, fontWeight:600, cursor:'pointer'
                }}>
                {cod}
              </button>
            )
          })}
        </div>
      </div>

      {shown.map(c => {
        const sett = SETTORI.find(s => s.cod===c.settore) || { color:'#666', bg:'#f5f5f5', nome:c.settore }
        const rootPaths = calcFsxPaths(c.settore, c.cod, 'LOT-XX')
        const exp = expanded[c.id]

        return (
          <div key={c.id} style={{
            background:'#fff', border:'1px solid #DEE6EF', borderRadius:10,
            marginBottom:16, overflow:'hidden'
          }}>
            {/* Commessa header */}
            <div
              onClick={() => setExpanded(e => ({ ...e, [c.id]: !exp }))}
              style={{
                display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                cursor:'pointer', background: exp ? '#F4F6F9' : '#fff',
                borderBottom: exp ? '1px solid #DEE6EF' : 'none'
              }}>
              <div style={{
                width:44, height:44, borderRadius:8, background:sett.color,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'
              }}>
                <span style={{ fontSize:9, color:'rgba(255,255,255,0.75)', fontWeight:700, lineHeight:1 }}>{c.settore}</span>
                <FolderOpen size={14} color="#fff" style={{ marginTop:1 }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.dark }}>{c.cod}</span>
                  <span style={{ fontSize:12, color:C.muted }}>—</span>
                  <span style={{ fontSize:13, color:C.dark }}>{c.nome}</span>
                </div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                  PM: {c.pm} · {c.cliente} · Budget: <strong style={{color:C.amber}}>€{c.budgetEUR.toLocaleString('it-IT')}</strong>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:11, color:C.muted }}>{c.lotti.length} {c.lotti.length===1?'lotto':'lotti'}</span>
                <ChevronRight size={16} color={C.muted}
                  style={{ transform: exp ? 'rotate(90deg)' : 'none', transition:'transform 0.2s' }} />
              </div>
            </div>

            {exp && (
              <div style={{ padding:'16px 20px 20px' }}>
                {/* FSx Paths commessa */}
                <div style={{ background:'#F4F6F9', borderRadius:8, padding:'12px 14px', marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.mid, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                    <span>🗂</span> FSx Paths — Commessa Root
                  </div>
                  <FsxPathChip path={rootPaths.root} label="ROOT" />
                  <FsxPathChip path={rootPaths.econ} label="ECON" />
                  <FsxPathChip path={rootPaths.ekb}  label="EKB" />
                </div>

                {/* Lotti */}
                <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:10, textTransform:'uppercase', letterSpacing:0.8 }}>
                  Lotti
                </div>
                {c.lotti.map(l => {
                  const paths = calcFsxPaths(c.settore, c.cod, l.cod)
                  const st = CDE_STATE_COLOR[l.statoCDE] || CDE_STATE_COLOR.WIP
                  return (
                    <div key={l.id} style={{
                      border:'1px solid #DEE6EF', borderRadius:8, padding:'14px 16px', marginBottom:12,
                      borderLeft:`3px solid ${sett.color}`
                    }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                            <span style={{ fontSize:13, fontWeight:700, color:C.dark }}>{l.cod}</span>
                            <span style={{
                              fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4,
                              background:st.bg, color:st.text, border:`1px solid ${st.border}`
                            }}>{l.statoCDE}</span>
                          </div>
                          <div style={{ fontSize:12, color:C.muted }}>{l.desc}</div>
                          <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                            {l.discipline.map(d => (
                              <span key={d} style={{
                                fontSize:10, background:'#EEF2F7', border:'1px solid #DEE6EF',
                                borderRadius:4, padding:'2px 7px', color:C.mid, fontWeight:600
                              }}>{d}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>Completezza dati</div>
                          <div style={{
                            fontSize:18, fontWeight:700,
                            color: l.completezza>=70?'#1B5E20':l.completezza>=40?C.amber:'#C62828'
                          }}>{l.completezza}%</div>
                          {/* Progress bar */}
                          <div style={{ width:80, height:4, background:'#DEE6EF', borderRadius:2, marginTop:4 }}>
                            <div style={{
                              width:`${l.completezza}%`, height:4, borderRadius:2,
                              background: l.completezza>=70?'#1B5E20':l.completezza>=40?C.amber:'#C62828'
                            }}/>
                          </div>
                        </div>
                      </div>

                      {/* FSx paths per lotto */}
                      <div style={{ background:'#F4F6F9', borderRadius:6, padding:'10px 12px', marginBottom:10 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:C.mid, marginBottom:6 }}>FSx Paths — Lotto</div>
                        <FsxPathChip path={paths.wip}  label="WIP" />
                        <FsxPathChip path={paths.bim}  label="BIM" />
                        <FsxPathChip path={paths.doc}  label="DOC" />
                        <FsxPathChip path={paths.issued} label="ISSUED" />
                        <FsxPathChip path={paths.delivered} label="DELIVERY" />
                      </div>

                      <button
                        onClick={() => onOpenLotto(c, l)}
                        style={{
                          display:'flex', alignItems:'center', gap:6,
                          background:sett.color, color:'#fff', border:'none',
                          borderRadius:5, padding:'6px 14px', fontSize:12, fontWeight:600,
                          cursor:'pointer'
                        }}>
                        <ExternalLink size={13} />
                        Apri dettaglio lotto
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
