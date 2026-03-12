import { useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Commesse from './components/Commesse.jsx'
import LottoDetail from './components/LottoDetail.jsx'
import AISimulator from './components/AISimulator.jsx'
import FsxExplorer from './components/FsxExplorer.jsx'
import { LayoutDashboard, FolderKanban, HardDrive, BrainCircuit, BookOpen } from 'lucide-react'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'commesse',   label: 'Commesse',        icon: FolderKanban    },
  { id: 'fsx',        label: 'FSx Explorer',    icon: HardDrive       },
  { id: 'ai',         label: 'AI Simulator',    icon: BrainCircuit    },
  { id: 'catalogo',   label: 'Catalogo Ref.',   icon: BookOpen        },
]

export default function App() {
  const [view, setView]       = useState('dashboard')
  const [selectedLotto, setSelectedLotto] = useState(null)

  const openLotto = (commessa, lotto) => {
    setSelectedLotto({ commessa, lotto })
    setView('lotto')
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F4F6F9' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#1A2E44', display:'flex', flexDirection:'column',
        position:'fixed', top:0, left:0, bottom:0, zIndex:100
      }}>
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid #2C4A6E' }}>
          <div style={{ fontSize:10, color:'#C8851C', fontWeight:700, letterSpacing:2, marginBottom:4 }}>
            AEDE ENGINEERING
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.3 }}>
            Digital Intelligence<br/>
            <span style={{ color:'#8A9BB0', fontWeight:400, fontSize:12 }}>POC v1.0</span>
          </div>
        </div>
        <nav style={{ flex:1, padding:'12px 8px' }}>
          {NAV.map(n => {
            const Icon = n.icon
            const active = view === n.id || (n.id==='commesse' && view==='lotto')
            return (
              <button key={n.id}
                onClick={() => { setView(n.id); setSelectedLotto(null) }}
                style={{
                  display:'flex', alignItems:'center', gap:10, width:'100%',
                  padding:'9px 12px', borderRadius:6, border:'none', cursor:'pointer',
                  background: active ? '#2C4A6E' : 'transparent',
                  color: active ? '#fff' : '#8A9BB0',
                  fontSize:13, fontWeight: active ? 600 : 400,
                  marginBottom:2, textAlign:'left', transition:'all 0.15s'
                }}>
                <Icon size={16} />
                {n.label}
                {active && <span style={{
                  marginLeft:'auto', width:4, height:4,
                  borderRadius:'50%', background:'#C8851C'
                }}/>}
              </button>
            )
          })}
        </nav>
        <div style={{ padding:'12px 16px', borderTop:'1px solid #2C4A6E' }}>
          <div style={{ fontSize:10, color:'#5A7A99' }}>Catalogo Integrato</div>
          <div style={{ fontSize:11, color:'#8A9BB0', fontWeight:600 }}>v3.0 — Normalizzato</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:220, flex:1, minHeight:'100vh' }}>
        {view === 'dashboard' && <Dashboard onOpenLotto={openLotto} setView={setView} />}
        {view === 'commesse' && <Commesse onOpenLotto={openLotto} />}
        {view === 'lotto'    && selectedLotto && (
          <LottoDetail
            commessa={selectedLotto.commessa}
            lotto={selectedLotto.lotto}
            onBack={() => setView('commesse')}
          />
        )}
        {view === 'fsx'      && <FsxExplorer />}
        {view === 'ai'       && <AISimulator />}
        {view === 'catalogo' && <CatalogoRef />}
      </main>
    </div>
  )
}

function CatalogoRef() {
  return (
    <div style={{ padding:32 }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:'#1A2E44', marginBottom:8 }}>
        Catalogo di Riferimento
      </h1>
      <p style={{ color:'#5A7A99', marginBottom:24, fontSize:14 }}>
        Documento costitutivo: <strong>AEDE_Catalogo_Integrato_v3_Normalizzato.xlsx</strong> — 11 fogli, CodiceOntologia come chiave primaria
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {[
          { n:'0', t:'Indice',             d:'Guida e regola di coerenza',                           c:'#1A2E44' },
          { n:'1', t:'Ontologia Base',     d:'70 sub-discipline, 4 livelli, norme di riferimento',   c:'#2C4A6E' },
          { n:'2', t:'Mapping Discipline', d:'37 righe — Catalogo ↔ CDE ↔ Ontologia',               c:'#C8851C' },
          { n:'3', t:'Catalogo Misure',    d:'71 misure × 6 settori con CodiceOntologia',            c:'#2C4A6E' },
          { n:'4', t:'Disc. Economiche',   d:'MECH/ELEC/TLC/DL + link ontologia',                   c:'#1B5E20' },
          { n:'5', t:'CDE / FSx',          d:'Struttura completa ISO 19650 con CodiciOntologia',     c:'#2C4A6E' },
          { n:'6', t:'Access & Retention', d:'Security groups e policy per area CDE',                c:'#880E4F' },
          { n:'7', t:'SP POC Misure',      d:'Schema EAV lista MISURE_PROGETTO',                     c:'#1B5E20' },
          { n:'8', t:'SP POC FSx Index',   d:'COMMESSE + LOTTI con path FSx calcolati',              c:'#2C4A6E' },
          { n:'9', t:'Feature AI',         d:'Feature importance per modello predittivo',             c:'#6A1B9A' },
          { n:'10',t:'Incidenze %',        d:'Range incidenze sub-discipline per settore',            c:'#C8851C' },
        ].map(sh => (
          <div key={sh.n} style={{
            background:'#fff', border:'1px solid #DEE6EF', borderRadius:8,
            padding:16, borderTop:`3px solid ${sh.c}`
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <span style={{
                background:sh.c, color:'#fff', borderRadius:4,
                padding:'2px 7px', fontSize:11, fontWeight:700
              }}>{sh.n}</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#1A2E44' }}>{sh.t}</span>
            </div>
            <p style={{ fontSize:12, color:'#5A7A99' }}>{sh.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
