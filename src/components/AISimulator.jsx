import { useState, useRef } from 'react'
import { SETTORI, COSTI_BENCHMARK } from '../data/seedData.js'
import catalogData from '../data/catalogData.json'
import { BrainCircuit, Loader, ChevronDown, ChevronUp, Sparkles, AlertTriangle } from 'lucide-react'

const C = { dark:'#1A2E44', mid:'#2C4A6E', amber:'#C8851C', muted:'#5A7A99', green:'#1B5E20' }

// ── helpers ──────────────────────────────────────────────────────────────────
function buildProjectContext(settore, misureValues, misureCatalog) {
  const lines = misureCatalog
    .filter(m => misureValues[m.cod] !== undefined && misureValues[m.cod] !== '')
    .map(m => {
      const val = misureValues[m.cod]
      const onto = m.disc ? (catalogData.mapping_onto[m.disc] || '—') : '—'
      return `- ${m.cod} (${m.nome}): ${val} ${m.udm||''} [Disciplina: ${m.disc||'—'}, CodiceOntologia: ${onto}]`
    })
    .join('\n')

  const incidenze = (catalogData.incidenze[settore] || [])
    .map(i => `  ${i.cod} (${i.nome}): tipica ${(i.typ*100).toFixed(0)}% su macro (range ${(i.min*100).toFixed(0)}%–${(i.max*100).toFixed(0)}%)`)
    .join('\n')

  const benchmark = COSTI_BENCHMARK[settore]
  const benchStr = benchmark?.tot
    ? `€${benchmark.mech}/mq MECH + €${benchmark.elec}/mq ELEC = €${benchmark.tot}/mq totale. Nota: ${benchmark.note}`
    : benchmark?.note || 'No benchmark €/mq disponibile per questo settore'

  return `
SETTORE: ${settore} (${SETTORI.find(s=>s.cod===settore)?.nome || settore})

MISURE PROGETTO INSERITE (schema EAV normalizzato — Catalogo Integrato v3.0):
${lines || '(nessuna misura inserita)'}

BENCHMARK COSTI STORICI AEDE:
${benchStr}

INCIDENZE SUB-DISCIPLINE TIPICHE (% su macro-famiglia):
${incidenze || '(non disponibili per questo settore)'}
`.trim()
}

function ResultBlock({ title, children, color = C.mid }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ border:`1px solid ${color}33`, borderRadius:8, overflow:'hidden', marginBottom:14 }}>
      <div onClick={() => setOpen(o=>!o)}
        style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'10px 14px', background:`${color}11`, cursor:'pointer'
        }}>
        <span style={{ fontSize:12, fontWeight:700, color }}>{title}</span>
        {open ? <ChevronUp size={14} color={color}/> : <ChevronDown size={14} color={color}/>}
      </div>
      {open && <div style={{ padding:'12px 14px' }}>{children}</div>}
    </div>
  )
}

function ParsedAIResult({ text }) {
  // Render markdown-like sections from Claude's response
  const lines = text.split('\n')
  return (
    <div style={{ fontSize:13, color:C.dark, lineHeight:1.7 }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return (
          <div key={i} style={{ fontSize:14, fontWeight:700, color:C.mid, marginTop:14, marginBottom:4, borderBottom:'1px solid #DEE6EF', paddingBottom:4 }}>
            {line.replace('## ','')}
          </div>
        )
        if (line.startsWith('### ')) return (
          <div key={i} style={{ fontSize:13, fontWeight:700, color:C.amber, marginTop:10, marginBottom:3 }}>
            {line.replace('### ','')}
          </div>
        )
        if (line.startsWith('- ') || line.startsWith('• ')) return (
          <div key={i} style={{ paddingLeft:14, position:'relative', marginBottom:3 }}>
            <span style={{ position:'absolute', left:2, color:C.amber }}>•</span>
            {line.replace(/^[•-] /,'')}
          </div>
        )
        if (line.startsWith('**') && line.endsWith('**')) return (
          <div key={i} style={{ fontWeight:700, color:C.dark, marginBottom:3 }}>{line.replace(/\*\*/g,'')}</div>
        )
        if (line.trim() === '') return <div key={i} style={{ height:8 }} />
        // inline bold
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <div key={i} style={{ marginBottom:2 }}>
            {parts.map((p,j) => p.startsWith('**')
              ? <strong key={j}>{p.replace(/\*\*/g,'')}</strong>
              : p
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AISimulator() {
  const [settore, setSettore] = useState('ALB')
  const [misureValues, setMisureValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [streamText, setStreamText] = useState('')
  const abortRef = useRef(null)

  const misureCatalog = catalogData.misure[settore] || []

  const handleSettore = (s) => {
    setSettore(s)
    setMisureValues({})
    setResult(null)
    setStreamText('')
    setError(null)
  }

  const setVal = (cod, val) => setMisureValues(prev => ({ ...prev, [cod]: val }))

  const filledCount = Object.values(misureValues).filter(v => v !== '' && v !== undefined).length
  const p1Count = misureCatalog.filter(m => m.prio === 1 && misureValues[m.cod] !== undefined && misureValues[m.cod] !== '').length
  const p1Total = misureCatalog.filter(m => m.prio === 1).length

  const runSimulation = async () => {
    setLoading(true)
    setResult(null)
    setStreamText('')
    setError(null)

    const ctx = buildProjectContext(settore, misureValues, misureCatalog)

    const systemPrompt = `Sei un esperto estimatore di impianti MEP (Meccanici, Elettrici, Telecom, Sicurezza) per il settore AEC, con oltre 20 anni di esperienza in Italia. 
Lavori per AEDE Engineering e usi il Catalogo Integrato Normalizzato v3.0 come base di riferimento (Engineering Ontology + Catalogo Misure + Incidenze storiche).
Rispondi sempre in italiano. Usa dati concreti, range di costo realistici in €, e giustifica sempre con i dati forniti.
Struttura la risposta con sezioni chiare usando ## per i titoli principali.`

    const userPrompt = `Simula la stima dei costi impiantistici per un nuovo progetto con queste caratteristiche:

${ctx}

Fornisci:
## Stima Costi per Disciplina
Per ogni macro-famiglia presente (MECH, ELEC, TLC, DL): importo stimato in €, range min-max, incidenza % e razionale basato sui dati inseriti.

## Breakdown Sub-Discipline
Usa le incidenze tipiche per stimare ogni sub-disciplina (MECH_HVAC, MECH_IDRAU, ecc.) con importi in €.

## Analisi dei Driver di Costo
Quali misure inserite impattano maggiormente la stima? Perché? Riferimento al CodiceOntologia dove rilevante.

## Completezza Dati e Affidabilità
Quali misure mancanti abbassano l'affidabilità? Confidence level della stima (Alta/Media/Bassa). Raccomandazioni per migliorare.

## Confronto con Benchmark AEDE
Come si posiziona questa stima rispetto ai benchmark storici? Eventuali anomalie da investigare.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1800,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error.message)

      const text = data.content?.map(b => b.text || '').join('') || ''
      setResult(text)
      setStreamText('')
    } catch (e) {
      setError(e.message || 'Errore chiamata AI')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding:32 }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, color:C.amber, fontWeight:700, letterSpacing:2, marginBottom:4 }}>AI SIMULATOR — BEDROCK-COMPATIBLE</div>
        <h1 style={{ fontSize:22, fontWeight:700, color:C.dark }}>Simulazione Nuovo Progetto</h1>
        <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>
          Inserisci le misure del progetto → AI stima i costi impiantistici usando Catalogo v3.0 + incidenze storiche
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:24, alignItems:'start' }}>
        {/* Left: input form */}
        <div>
          {/* Settore */}
          <div style={{ background:'#fff', border:'1px solid #DEE6EF', borderRadius:10, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.dark, marginBottom:10 }}>1. Seleziona Settore</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {SETTORI.map(s => (
                <button key={s.cod} onClick={()=>handleSettore(s.cod)}
                  style={{
                    padding:'5px 11px', borderRadius:5, border:'1px solid',
                    borderColor: settore===s.cod ? s.color : '#DEE6EF',
                    background: settore===s.cod ? s.color : '#fff',
                    color: settore===s.cod ? '#fff' : C.muted,
                    fontSize:11, fontWeight:600, cursor:'pointer'
                  }}>
                  {s.cod}
                </button>
              ))}
            </div>
            <div style={{ marginTop:8, fontSize:11, color:C.muted }}>
              {SETTORI.find(s=>s.cod===settore)?.nome}
            </div>
          </div>

          {/* Measures input */}
          <div style={{ background:'#fff', border:'1px solid #DEE6EF', borderRadius:10, overflow:'hidden', marginBottom:16 }}>
            <div style={{
              padding:'12px 16px', background:'#F4F6F9', borderBottom:'1px solid #DEE6EF',
              display:'flex', justifyContent:'space-between', alignItems:'center'
            }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.dark }}>2. Misure Progetto</span>
              <span style={{ fontSize:11, color:C.muted }}>{filledCount}/{misureCatalog.length} inserite</span>
            </div>
            <div style={{ maxHeight:420, overflowY:'auto', padding:'8px 0' }}>
              {misureCatalog.map(m => {
                const isP1 = m.prio === 1
                return (
                  <div key={m.cod} style={{
                    padding:'7px 14px', borderBottom:'1px solid #F4F6F9',
                    background: misureValues[m.cod] ? '#F0FDF4' : '#fff'
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{
                          fontSize:9, fontWeight:700, padding:'1px 5px',
                          borderRadius:3, background: isP1?C.amber+'22':'#EEF2F7',
                          color: isP1?C.amber:C.muted
                        }}>P{m.prio}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:C.dark }}>{m.cod}</span>
                      </div>
                      <span style={{ fontSize:9, color:C.muted }}>{m.udm}</span>
                    </div>
                    <div style={{ fontSize:10, color:C.muted, marginBottom:4 }}>{m.nome}</div>

                    {m.tipo === 'CAT' && m.valori ? (
                      <select
                        value={misureValues[m.cod] || ''}
                        onChange={e => setVal(m.cod, e.target.value)}
                        style={{
                          width:'100%', padding:'4px 7px', border:'1px solid #DEE6EF',
                          borderRadius:4, fontSize:11, background:'#fff'
                        }}>
                        <option value="">— seleziona —</option>
                        {m.valori.split('|').map(v=><option key={v} value={v.trim()}>{v.trim()}</option>)}
                      </select>
                    ) : m.tipo === 'BOOL' ? (
                      <div style={{ display:'flex', gap:6 }}>
                        {['Sì','No'].map(v => (
                          <button key={v} onClick={() => setVal(m.cod, v)}
                            style={{
                              flex:1, padding:'3px 0', border:'1px solid',
                              borderColor: misureValues[m.cod]===v ? C.green : '#DEE6EF',
                              background: misureValues[m.cod]===v ? '#E8F5E9' : '#fff',
                              color: misureValues[m.cod]===v ? C.green : C.muted,
                              borderRadius:4, fontSize:11, fontWeight:600, cursor:'pointer'
                            }}>{v}</button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={misureValues[m.cod] || ''}
                        onChange={e => setVal(m.cod, e.target.value)}
                        placeholder={`es. ${m.cod==='N_CAMERE'?'80':m.cod==='SUP_MQ'?'3500':m.cod==='KW_RISC'?'280':'—'}`}
                        style={{
                          width:'100%', padding:'4px 7px', border:'1px solid #DEE6EF',
                          borderRadius:4, fontSize:11, background:'#fff'
                        }}
                      />
                    )}
                    {m.disc && (
                      <div style={{ fontSize:9, color:'#6A1B9A', marginTop:2 }}>
                        {m.disc} → {catalogData.mapping_onto[m.disc]||'—'}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* P1 completeness warning */}
          {p1Total > 0 && p1Count < p1Total && (
            <div style={{
              display:'flex', gap:8, padding:'10px 12px', background:'#FFF8E1',
              border:'1px solid #C8851C', borderRadius:6, marginBottom:12
            }}>
              <AlertTriangle size={14} color={C.amber} style={{marginTop:1, flexShrink:0}} />
              <span style={{ fontSize:11, color:C.dark }}>
                Mancano <strong>{p1Total - p1Count}</strong> misure obbligatorie (P1). La stima avrà affidabilità ridotta.
              </span>
            </div>
          )}

          {/* Run button */}
          <button
            onClick={runSimulation}
            disabled={loading || filledCount === 0}
            style={{
              width:'100%', padding:'12px', background: filledCount>0 ? C.amber : '#DEE6EF',
              color: filledCount>0 ? '#fff' : C.muted,
              border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor: filledCount>0?'pointer':'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'opacity 0.2s'
            }}>
            {loading ? <><Loader size={16} style={{animation:'spin 1s linear infinite'}} /> Elaborazione AI...</>
                      : <><Sparkles size={16} /> Avvia Simulazione AI</>}
          </button>
          <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
        </div>

        {/* Right: AI result */}
        <div>
          {!result && !loading && !error && (
            <div style={{
              background:'#fff', border:'1px solid #DEE6EF', borderRadius:10,
              padding:40, textAlign:'center', color:C.muted
            }}>
              <BrainCircuit size={48} color='#DEE6EF' style={{margin:'0 auto 16px'}} />
              <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>AI Simulator pronto</div>
              <div style={{ fontSize:13 }}>
                Seleziona il settore, inserisci le misure del progetto<br/>e avvia la simulazione per ottenere la stima costi AI.
              </div>
              <div style={{
                marginTop:20, background:'#F4F6F9', borderRadius:8, padding:16, textAlign:'left'
              }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.dark, marginBottom:8 }}>Come funziona:</div>
                {[
                  '1. Le misure inserite vengono normalizzate con CodiceOntologia (Catalogo v3.0)',
                  '2. L\'AI usa le incidenze storiche per stimare ogni sub-disciplina',
                  '3. Il risultato viene confrontato con i benchmark AEDE per settore',
                  '4. Vengono identificati i driver di costo principali e le misure mancanti',
                ].map((s,i) => (
                  <div key={i} style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{s}</div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{
              background:'#fff', border:'1px solid #DEE6EF', borderRadius:10, padding:32, textAlign:'center'
            }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                <Loader size={32} color={C.amber} style={{animation:'spin 1s linear infinite'}} />
              </div>
              <div style={{ fontSize:14, fontWeight:600, color:C.dark, marginBottom:8 }}>AI in elaborazione...</div>
              <div style={{ fontSize:12, color:C.muted }}>
                Analisi misure → Applicazione incidenze → Stima per disciplina → Benchmark AEDE
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background:'#FFF1F2', border:'1px solid #F87171', borderRadius:10, padding:24
            }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#B91C1C', marginBottom:6 }}>Errore AI</div>
              <div style={{ fontSize:12, color:'#7F1D1D' }}>{error}</div>
              <div style={{ fontSize:11, color:'#9CA3AF', marginTop:8 }}>
                Verifica la connessione e riprova. Per l'ambiente Vercel, l'API key Anthropic deve essere configurata come variabile d'ambiente VITE_ANTHROPIC_API_KEY.
              </div>
            </div>
          )}

          {result && (
            <div>
              {/* Result header */}
              <div style={{
                background:C.dark, borderRadius:'10px 10px 0 0', padding:'14px 18px',
                display:'flex', alignItems:'center', gap:10
              }}>
                <Sparkles size={16} color={C.amber} />
                <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>
                  Stima AI — {SETTORI.find(s=>s.cod===settore)?.nome}
                </span>
                <span style={{ marginLeft:'auto', fontSize:10, color:'#8A9BB0' }}>
                  {filledCount} misure · Catalogo v3.0 · claude-sonnet-4
                </span>
              </div>
              <div style={{
                background:'#fff', border:'1px solid #DEE6EF', borderRadius:'0 0 10px 10px',
                borderTop:'none', padding:20, maxHeight:600, overflowY:'auto'
              }}>
                <ParsedAIResult text={result} />
              </div>

              {/* Incidenze reference */}
              <div style={{
                background:'#fff', border:'1px solid #DEE6EF', borderRadius:10,
                marginTop:16, overflow:'hidden'
              }}>
                <div style={{ padding:'10px 14px', background:'#F4F6F9', borderBottom:'1px solid #DEE6EF' }}>
                  <span style={{ fontSize:11, fontWeight:700, color:C.dark }}>
                    Incidenze di Riferimento — Foglio 10_INCIDENZE (settore {settore})
                  </span>
                </div>
                <div style={{ padding:'12px 14px', display:'flex', flexWrap:'wrap', gap:8 }}>
                  {(catalogData.incidenze[settore]||[]).map(inc => (
                    <div key={inc.cod} style={{
                      background:'#EEF2F7', borderRadius:6, padding:'6px 10px',
                      fontSize:11, color:C.dark
                    }}>
                      <strong style={{color:C.mid}}>{inc.cod}</strong>
                      <span style={{ color:C.muted, marginLeft:6 }}>
                        typ {(inc.typ*100).toFixed(0)}% ({(inc.min*100).toFixed(0)}–{(inc.max*100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                  {!(catalogData.incidenze[settore]||[]).length && (
                    <span style={{ fontSize:12, color:C.muted }}>Incidenze non disponibili per questo settore</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
