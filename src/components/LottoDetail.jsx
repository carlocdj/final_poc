import { useState } from 'react'
import { SETTORI, CDE_STATE_COLOR, calcFsxPaths } from '../data/seedData.js'
import catalogData from '../data/catalogData.json'
import { ArrowLeft, Plus, HardDrive, CheckCircle, AlertTriangle } from 'lucide-react'

const C = { dark:'#1A2E44', mid:'#2C4A6E', amber:'#C8851C', muted:'#5A7A99' }

export default function LottoDetail({ commessa, lotto, onBack }) {
  const sett = SETTORI.find(s => s.cod===commessa.settore) || { color:'#666', nome:commessa.settore }
  const paths = calcFsxPaths(commessa.settore, commessa.cod, lotto.cod)
  const st = CDE_STATE_COLOR[lotto.statoCDE] || CDE_STATE_COLOR.WIP

  const [measures, setMeasures]   = useState(lotto.misure || [])
  const [adding, setAdding]       = useState(false)
  const [newCod, setNewCod]       = useState('')
  const [newVal, setNewVal]       = useState('')
  const [newFonte, setNewFonte]   = useState('OFFERTA')

  const availableMisure = (catalogData.misure[commessa.settore] || [])

  const selectedMisura = availableMisure.find(m => m.cod === newCod)

  const addMeasure = () => {
    if (!newCod || !newVal) return
    const m = availableMisure.find(x => x.cod===newCod)
    setMeasures(prev => [...prev, {
      cod: newCod,
      valore: newVal,
      fonte: newFonte,
      udm: m?.udm,
      disc: m?.disc,
    }])
    setNewCod(''); setNewVal(''); setAdding(false)
  }

  // Map disc to ontology
  const getOnto = (disc) => catalogData.mapping_onto[disc] || '—'

  const completezza = Math.round(measures.length / Math.max(availableMisure.length, 1) * 100)

  return (
    <div style={{ padding:32 }}>
      {/* Back + header */}
      <button onClick={onBack} style={{
        display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
        cursor:'pointer', color:C.muted, fontSize:13, marginBottom:20
      }}>
        <ArrowLeft size={14} /> Torna a Commesse
      </button>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <span style={{ fontSize:11, color:C.amber, fontWeight:700, letterSpacing:2 }}>{commessa.settore}</span>
            <span style={{ fontSize:20, fontWeight:700, color:C.dark }}>{lotto.cod}</span>
            <span style={{
              fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:4,
              background:st.bg, color:st.text, border:`1px solid ${st.border}`
            }}>{lotto.statoCDE}</span>
          </div>
          <p style={{ fontSize:14, color:C.muted }}>{lotto.desc}</p>
          <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
            {lotto.discipline.map(d => {
              const onto = getOnto(d)
              return (
                <span key={d} title={`CodiceOntologia: ${onto}`} style={{
                  fontSize:11, background:'#EEF2F7', border:'1px solid #DEE6EF',
                  borderRadius:4, padding:'3px 10px', color:C.mid, fontWeight:600
                }}>{d} <span style={{ color:C.muted, fontSize:9 }}>→ {onto}</span></span>
              )
            })}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:12, color:C.muted, marginBottom:2 }}>Completezza misure</div>
          <div style={{ fontSize:32, fontWeight:700, color: completezza>=70?'#1B5E20':completezza>=40?C.amber:'#C62828' }}>
            {completezza}%
          </div>
          <div style={{ width:120, height:5, background:'#DEE6EF', borderRadius:3, marginTop:4 }}>
            <div style={{
              width:`${completezza}%`, height:5, borderRadius:3,
              background: completezza>=70?'#1B5E20':completezza>=40?C.amber:'#C62828'
            }}/>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:20 }}>
        {/* Left: misure */}
        <div>
          <div style={{ background:'#fff', border:'1px solid #DEE6EF', borderRadius:10, overflow:'hidden' }}>
            <div style={{
              padding:'14px 18px', background:'#F4F6F9',
              borderBottom:'1px solid #DEE6EF', display:'flex', justifyContent:'space-between', alignItems:'center'
            }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.dark }}>
                Misure Progetto — Schema EAV  <span style={{ color:C.muted, fontWeight:400 }}>({measures.length}/{availableMisure.length})</span>
              </span>
              <button
                onClick={() => setAdding(a => !a)}
                style={{
                  display:'flex', alignItems:'center', gap:5, background:sett.color,
                  color:'#fff', border:'none', borderRadius:5, padding:'6px 12px',
                  fontSize:12, fontWeight:600, cursor:'pointer'
                }}>
                <Plus size={13} /> Aggiungi misura
              </button>
            </div>

            {/* Add measure form */}
            {adding && (
              <div style={{ padding:'14px 18px', background:'#FFFBEB', borderBottom:'1px solid #DEE6EF' }}>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:8, alignItems:'end' }}>
                  <div>
                    <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:4 }}>CodMisura</label>
                    <select value={newCod} onChange={e=>setNewCod(e.target.value)} style={{
                      width:'100%', padding:'6px 8px', border:'1px solid #DEE6EF', borderRadius:5,
                      fontSize:12, background:'#fff'
                    }}>
                      <option value="">Seleziona…</option>
                      {availableMisure.map(m => (
                        <option key={m.cod} value={m.cod}>{m.cod} — {m.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:4 }}>
                      Valore {selectedMisura ? `(${selectedMisura.udm})` : ''}
                    </label>
                    {selectedMisura?.tipo === 'CAT' && selectedMisura?.valori ? (
                      <select value={newVal} onChange={e=>setNewVal(e.target.value)} style={{
                        width:'100%', padding:'6px 8px', border:'1px solid #DEE6EF', borderRadius:5, fontSize:12
                      }}>
                        <option value="">—</option>
                        {selectedMisura.valori.split('|').map(v => <option key={v} value={v.trim()}>{v.trim()}</option>)}
                      </select>
                    ) : selectedMisura?.tipo === 'BOOL' ? (
                      <select value={newVal} onChange={e=>setNewVal(e.target.value)} style={{
                        width:'100%', padding:'6px 8px', border:'1px solid #DEE6EF', borderRadius:5, fontSize:12
                      }}>
                        <option value="">—</option>
                        <option value="Sì">Sì</option>
                        <option value="No">No</option>
                      </select>
                    ) : (
                      <input type="text" value={newVal} onChange={e=>setNewVal(e.target.value)}
                        placeholder="Inserisci valore"
                        style={{ width:'100%', padding:'6px 8px', border:'1px solid #DEE6EF', borderRadius:5, fontSize:12 }}
                      />
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:4 }}>Fonte</label>
                    <select value={newFonte} onChange={e=>setNewFonte(e.target.value)} style={{
                      width:'100%', padding:'6px 8px', border:'1px solid #DEE6EF', borderRadius:5, fontSize:12
                    }}>
                      {['OFFERTA','CONTRATTO','ESEGUITO','STIMA'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <button onClick={addMeasure} style={{
                    background:'#1B5E20', color:'#fff', border:'none', borderRadius:5,
                    padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer'
                  }}>
                    <CheckCircle size={14} />
                  </button>
                </div>
                {selectedMisura && (
                  <div style={{ marginTop:8, fontSize:11, color:C.muted }}>
                    Disciplina: <strong>{selectedMisura.disc||'—'}</strong>
                    {selectedMisura.disc && <> → CodiceOntologia: <strong style={{color:'#6A1B9A'}}>{getOnto(selectedMisura.disc)}</strong></>}
                  </div>
                )}
              </div>
            )}

            {/* Measures table */}
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F4F6F9' }}>
                  {['CodMisura','Valore','UDM','Fonte','CodDisciplina','CodiceOntologia'].map(h => (
                    <th key={h} style={{
                      padding:'8px 12px', fontSize:10, fontWeight:700, color:C.muted,
                      textAlign:'left', borderBottom:'1px solid #DEE6EF',
                      textTransform:'uppercase', letterSpacing:0.5
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measures.map((m, i) => {
                  const catM = availableMisure.find(x => x.cod===m.cod)
                  const disc = m.disc || catM?.disc || '—'
                  const onto = disc !== '—' ? getOnto(disc) : '—'
                  const fonteColor = {
                    CONTRATTO:'#1B5E20', ESEGUITO:'#1B5E20', OFFERTA:C.amber, STIMA:'#E65100'
                  }[m.fonte] || C.muted
                  return (
                    <tr key={i} style={{ background: i%2===0?'#fff':'#F8FAFC' }}>
                      <td style={{ padding:'9px 12px', fontSize:12, fontWeight:700, color:C.dark, borderBottom:'1px solid #EEF2F7' }}>
                        {m.cod}
                      </td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:C.dark, borderBottom:'1px solid #EEF2F7' }}>
                        {String(m.valore)}
                      </td>
                      <td style={{ padding:'9px 12px', fontSize:11, color:C.muted, borderBottom:'1px solid #EEF2F7' }}>
                        {m.udm || catM?.udm || '—'}
                      </td>
                      <td style={{ padding:'9px 12px', borderBottom:'1px solid #EEF2F7' }}>
                        <span style={{ fontSize:10, fontWeight:700, color:fonteColor }}>{m.fonte}</span>
                      </td>
                      <td style={{ padding:'9px 12px', fontSize:11, color:C.mid, fontWeight:600, borderBottom:'1px solid #EEF2F7' }}>
                        {disc}
                      </td>
                      <td style={{ padding:'9px 12px', fontSize:10, color:'#6A1B9A', fontFamily:'monospace', borderBottom:'1px solid #EEF2F7' }}>
                        {onto}
                      </td>
                    </tr>
                  )
                })}
                {measures.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding:'24px', textAlign:'center', color:C.muted, fontSize:13 }}>
                      Nessuna misura inserita
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: FSx paths */}
        <div>
          <div style={{ background:'#fff', border:'1px solid #DEE6EF', borderRadius:10, overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'14px 18px', background:'#1A2E44', display:'flex', alignItems:'center', gap:8 }}>
              <HardDrive size={14} color="#C8851C" />
              <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>FSx Path Index</span>
            </div>
            <div style={{ padding:16 }}>
              {[
                { label:'WIP',       path:paths.wip,       color:'#1B5E20', icon:'📁' },
                { label:'BIM',       path:paths.bim,       color:'#1565C0', icon:'🏗' },
                { label:'DOC',       path:paths.doc,       color:'#6A1B9A', icon:'📄' },
                { label:'ISSUED',    path:paths.issued,    color:'#1565C0', icon:'✅' },
                { label:'DELIVERY',  path:paths.delivered, color:'#880E4F', icon:'📦' },
                { label:'EKB (AI)',  path:paths.ekb,       color:'#6A1B9A', icon:'🧠' },
              ].map(({ label, path, color, icon }) => (
                <div key={label} style={{
                  marginBottom:8, padding:'8px 10px', background:'#F4F6F9',
                  borderRadius:6, borderLeft:`3px solid ${color}`
                }}>
                  <div style={{ fontSize:10, fontWeight:700, color:color, marginBottom:2 }}>
                    {icon} {label}
                  </div>
                  <code style={{
                    fontSize:9.5, color:'#1A2E44', fontFamily:'monospace',
                    wordBreak:'break-all', lineHeight:1.4
                  }}>{path}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Discipline → ontology map */}
          <div style={{ background:'#fff', border:'1px solid #DEE6EF', borderRadius:10, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', background:'#F4F6F9', borderBottom:'1px solid #DEE6EF' }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.dark }}>CodiceOntologia Mapping</span>
            </div>
            <div style={{ padding:14 }}>
              {lotto.discipline.map(d => {
                const onto = getOnto(d)
                return (
                  <div key={d} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'6px 0', borderBottom:'1px solid #EEF2F7'
                  }}>
                    <span style={{ fontSize:11, fontWeight:700, color:C.mid }}>{d}</span>
                    <span style={{ fontSize:10, color:'#6A1B9A', fontFamily:'monospace' }}>{onto}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
