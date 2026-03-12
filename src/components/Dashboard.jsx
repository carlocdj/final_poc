import { DEMO_COMMESSE, SETTORI, CDE_STATE_COLOR } from '../data/seedData.js'
import { FolderOpen, TrendingUp, AlertCircle, CheckCircle, BrainCircuit, HardDrive } from 'lucide-react'

const C = { dark:'#1A2E44', mid:'#2C4A6E', amber:'#C8851C', muted:'#5A7A99', border:'#DEE6EF' }

function KpiCard({ icon: Icon, label, value, sub, color = C.mid }) {
  return (
    <div style={{
      background:'#fff', border:'1px solid #DEE6EF', borderRadius:8,
      padding:'18px 20px', borderTop:`3px solid ${color}`
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:11, color:C.muted, fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:0.8 }}>{label}</div>
          <div style={{ fontSize:28, fontWeight:700, color:color }}>{value}</div>
          {sub && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{sub}</div>}
        </div>
        <div style={{ background:`${color}18`, padding:10, borderRadius:8 }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ onOpenLotto, setView }) {
  const allLotti = DEMO_COMMESSE.flatMap(c => c.lotti.map(l => ({ ...l, commessa: c })))
  const totBudget = DEMO_COMMESSE.reduce((s,c) => s+c.budgetEUR, 0)
  const avgComp   = Math.round(allLotti.reduce((s,l) => s+l.completezza, 0) / allLotti.length)
  const published = allLotti.filter(l => l.statoCDE==='PUBLISHED').length

  return (
    <div style={{ padding:32 }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:11, color:C.amber, fontWeight:700, letterSpacing:2, marginBottom:4 }}>
          AEDE ENGINEERING — DIGITAL INTELLIGENCE POC
        </div>
        <h1 style={{ fontSize:24, fontWeight:700, color:C.dark }}>Dashboard Overview</h1>
        <p style={{ color:C.muted, fontSize:14, marginTop:4 }}>
          {new Date().toLocaleDateString('it-IT', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <KpiCard icon={FolderOpen}   label="Commesse attive" value={DEMO_COMMESSE.length}  sub="Tutti i settori"     color={C.mid}      />
        <KpiCard icon={TrendingUp}   label="Budget totale"   value={`€${(totBudget/1e6).toFixed(1)}M`} sub="Portafoglio corrente" color={C.amber} />
        <KpiCard icon={CheckCircle}  label="Completezza dati" value={`${avgComp}%`}         sub="Media misure inserite" color="#1B5E20"   />
        <KpiCard icon={HardDrive}    label="Path FSx attivi" value={allLotti.length * 4}    sub="Link calcolati SP"  color="#6A1B9A"    />
      </div>

      {/* Projects grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20, marginBottom:28 }}>
        {DEMO_COMMESSE.map(c => {
          const sett = SETTORI.find(s => s.cod===c.settore) || { color:'#666', bg:'#f5f5f5' }
          return (
            <div key={c.id} style={{
              background:'#fff', border:'1px solid #DEE6EF', borderRadius:10,
              overflow:'hidden'
            }}>
              <div style={{ background:sett.color, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)', fontWeight:600, letterSpacing:1 }}>{c.settore}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginTop:2 }}>{c.cod}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'4px 10px' }}>
                  <span style={{ fontSize:11, color:'#fff', fontWeight:600 }}>
                    {c.stato.replace('_',' ')}
                  </span>
                </div>
              </div>
              <div style={{ padding:18 }}>
                <div style={{ fontSize:14, fontWeight:600, color:C.dark, marginBottom:4 }}>{c.nome}</div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>PM: {c.pm} · {c.cliente}</div>

                <div style={{ display:'flex', gap:12, marginBottom:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>Budget</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.amber }}>
                      €{c.budgetEUR.toLocaleString('it-IT')}
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>Lotti</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.dark }}>{c.lotti.length}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>Completezza</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1B5E20' }}>
                      {Math.round(c.lotti.reduce((s,l)=>s+l.completezza,0)/c.lotti.length)}%
                    </div>
                  </div>
                </div>

                {/* Lotti */}
                {c.lotti.map(l => {
                  const st = CDE_STATE_COLOR[l.statoCDE] || CDE_STATE_COLOR.WIP
                  return (
                    <button key={l.id}
                      onClick={() => onOpenLotto(c, l)}
                      style={{
                        display:'flex', alignItems:'center', width:'100%', gap:10,
                        padding:'8px 12px', background:'#F4F6F9', border:'1px solid #DEE6EF',
                        borderRadius:6, cursor:'pointer', marginBottom:6, textAlign:'left',
                        transition:'border-color 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor=sett.color}
                      onMouseOut={e  => e.currentTarget.style.borderColor='#DEE6EF'}
                    >
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:C.dark }}>{l.cod}</div>
                        <div style={{ fontSize:11, color:C.muted }}>{l.desc}</div>
                      </div>
                      <span style={{
                        fontSize:10, fontWeight:700, padding:'2px 8px',
                        borderRadius:4, border:`1px solid ${st.border}`,
                        background:st.bg, color:st.text, whiteSpace:'nowrap'
                      }}>{l.statoCDE}</span>
                      <div style={{
                        fontSize:11, fontWeight:700,
                        color: l.completezza>=70?'#1B5E20':l.completezza>=40?C.amber:'#C62828'
                      }}>{l.completezza}%</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{
        background:C.dark, borderRadius:10, padding:'20px 24px',
        display:'flex', alignItems:'center', justifyContent:'space-between'
      }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:4 }}>
            AI Simulator disponibile
          </div>
          <div style={{ fontSize:12, color:'#8A9BB0' }}>
            Stima i costi di un nuovo progetto usando le feature del Catalogo Integrato + incidenze storiche
          </div>
        </div>
        <button
          onClick={() => setView('ai')}
          style={{
            background:C.amber, color:'#fff', border:'none', borderRadius:6,
            padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer',
            display:'flex', alignItems:'center', gap:8
          }}>
          <BrainCircuit size={16} />
          Avvia simulazione
        </button>
      </div>
    </div>
  )
}
