// Seed data for POC demo — based on AEDE_Catalogo_Integrato_v3_Normalizzato.xlsx

export const SETTORI = [
  { cod: 'RSA', nome: 'RSA / Sociosanitario', color: '#6B21A8', bg: '#F3E5F5' },
  { cod: 'ALB', nome: 'Alberghiero',           color: '#1D4ED8', bg: '#EFF6FF' },
  { cod: 'SCO', nome: 'Scolastico',            color: '#15803D', bg: '#F0FDF4' },
  { cod: 'CON', nome: 'Condominiale',          color: '#D97706', bg: '#FFFBEB' },
  { cod: 'TLC', nome: 'TLC / Telecom',         color: '#0F766E', bg: '#F0FDFA' },
  { cod: 'DL',  nome: 'DL / Sicurezza',        color: '#9F1239', bg: '#FFF1F2' },
]

export const CDE_STATES = ['WIP', 'SHARED', 'PUBLISHED', 'DELIVERED', 'ARCHIVE']
export const CDE_STATE_COLOR = {
  WIP:       { bg: '#E8F5E9', text: '#1B5E20', border: '#1B5E20' },
  SHARED:    { bg: '#FFF8E1', text: '#E65100', border: '#C8851C' },
  PUBLISHED: { bg: '#E3F2FD', text: '#1565C0', border: '#1565C0' },
  DELIVERED: { bg: '#EDE7F6', text: '#4527A0', border: '#6A1B9A' },
  ARCHIVE:   { bg: '#ECEFF1', text: '#546E7A', border: '#90A4AE' },
}

export const FSX_BASE = '/fsx/PROD'
export const FSX_EKB  = '/fsx/ekb'
export const FSX_ECON = '/fsx/ECONOMICS'

export const calcFsxPaths = (settore, commessa, lotto) => ({
  root:      `${FSX_BASE}/${settore}/${commessa}/`,
  wip:       `${FSX_BASE}/${settore}/${commessa}/${lotto}/WIP/`,
  issued:    `${FSX_BASE}/${settore}/${commessa}/${lotto}/ISSUED/`,
  bim:       `${FSX_BASE}/${settore}/${commessa}/${lotto}/WIP/BIM/`,
  doc:       `${FSX_BASE}/${settore}/${commessa}/${lotto}/WIP/DOC/`,
  delivered: `/fsx/DELIVERIES/${commessa}/${lotto}/`,
  ekb:       `${FSX_EKB}/${settore}/`,
  econ:      `${FSX_ECON}/${settore}/${commessa}/`,
})

export const DEMO_COMMESSE = [
  {
    id: 'C001', cod: 'ALB-2166', nome: 'Hotel Intercity Roma — Ristrutturazione',
    settore: 'ALB', cliente: 'Intercity Hotels SpA', pm: 'M. Bianchi',
    stato: 'IN_CORSO', dataApertura: '2024-03-15', budgetEUR: 4287068,
    lotti: [
      {
        id: 'L001', cod: 'ALB-2166-01', desc: 'Impianti MECH+ELEC — Piano 1-5',
        discipline: ['MECH_HVAC','ELEC_BT','MECH_AFS'], statoCDE: 'PUBLISHED',
        pmLotto: 'R. Conti', dataConsegna: '2024-09-30', completezza: 87,
        misure: [
          { cod:'N_CAMERE',  valore: 110,         fonte:'CONTRATTO' },
          { cod:'N_PL',      valore: 220,         fonte:'CONTRATTO' },
          { cod:'CATEGORIA', valore: '4 STELLE',  fonte:'CONTRATTO' },
          { cod:'KW_RISC',   valore: 380,         fonte:'CONTRATTO' },
          { cod:'KW_RAFF',   valore: 420,         fonte:'CONTRATTO' },
          { cod:'AFS_LIVELLO',valore:'SPRINKLER TOTALE', fonte:'CONTRATTO' },
        ]
      },
      {
        id: 'L002', cod: 'ALB-2166-02', desc: 'Impianti TLC+DL — Tutto edificio',
        discipline: ['TLC_PASS','DL_TVCC','DL_CA'], statoCDE: 'SHARED',
        pmLotto: 'F. Russo', dataConsegna: '2024-11-15', completezza: 62,
        misure: [
          { cod:'N_CAMERE',  valore: 110, fonte:'CONTRATTO' },
          { cod:'TIPO_INT',  valore:'RISTRUTTURAZIONE', fonte:'CONTRATTO' },
        ]
      }
    ]
  },
  {
    id: 'C002', cod: 'RSA-2272', nome: 'Casa di Cura S. Angelo — Nuovo corpo',
    settore: 'RSA', cliente: 'Fondazione S. Angelo', pm: 'A. Ferrari',
    stato: 'IN_CORSO', dataApertura: '2024-01-10', budgetEUR: 2873017,
    lotti: [
      {
        id: 'L003', cod: 'RSA-2272-01', desc: 'Impianti meccanici e gas medicale',
        discipline: ['MECH_HVAC','MECH_GAS','MECH_AFS'], statoCDE: 'WIP',
        pmLotto: 'A. Ferrari', dataConsegna: '2025-03-31', completezza: 45,
        misure: [
          { cod:'N_CAMERE',     valore: 60,    fonte:'OFFERTA' },
          { cod:'N_PL',         valore: 120,   fonte:'OFFERTA' },
          { cod:'KW_RISC',      valore: 290,   fonte:'STIMA'   },
          { cod:'GAS_MEDICALE', valore: 'Sì',  fonte:'CONTRATTO' },
          { cod:'AFS_LIVELLO',  valore:'ATTIVITÀ 72', fonte:'CONTRATTO' },
        ]
      }
    ]
  },
  {
    id: 'C003', cod: 'TLC-0891', nome: 'Rete Fibra FTTH — Lotto Milano Nord',
    settore: 'TLC', cliente: 'NetFast Italia Srl', pm: 'G. Manzoni',
    stato: 'IN_CORSO', dataApertura: '2024-06-01', budgetEUR: 1950000,
    lotti: [
      {
        id: 'L004', cod: 'TLC-0891-01', desc: 'Infrastruttura passiva — Zona A',
        discipline: ['TLC_PASS','TLC_CIVIL'], statoCDE: 'WIP',
        pmLotto: 'G. Manzoni', dataConsegna: '2025-01-31', completezza: 71,
        misure: [
          { cod:'KM_LINEA',  valore: 28,          fonte:'CONTRATTO' },
          { cod:'N_SITI',    valore: 4,            fonte:'CONTRATTO' },
          { cod:'TIPO_POSA', valore:'INTERRATA',   fonte:'CONTRATTO' },
          { cod:'TECNOL',    valore:'GPON XGSPON', fonte:'CONTRATTO' },
        ]
      }
    ]
  },
  {
    id: 'C004', cod: 'SCO-1104', nome: 'Scuola Media Statale — Efficientamento',
    settore: 'SCO', cliente: 'Comune di Bergamo', pm: 'L. Colombo',
    stato: 'IN_CORSO', dataApertura: '2024-09-01', budgetEUR: 820000,
    lotti: [
      {
        id: 'L005', cod: 'SCO-1104-01', desc: 'HVAC + FV + Elettrico',
        discipline: ['MECH_HVAC','ELEC_FV','ELEC_BT'], statoCDE: 'WIP',
        pmLotto: 'L. Colombo', dataConsegna: '2025-06-30', completezza: 33,
        misure: [
          { cod:'TIPO_ED',  valore:'SECONDARIA I GRADO', fonte:'CONTRATTO' },
          { cod:'N_AULE',   valore: 18,  fonte:'CONTRATTO' },
          { cod:'N_ALUNNI', valore: 450, fonte:'CONTRATTO' },
          { cod:'STD_EN',   valore:'NZEB', fonte:'OFFERTA' },
        ]
      }
    ]
  }
]

// Costi storici per benchmark AI (€/mq indicativi per settore)
export const COSTI_BENCHMARK = {
  RSA: { mech: 320, elec: 180, tot: 500, note: 'Alta densità impianti speciali' },
  ALB: { mech: 280, elec: 160, tot: 440, note: 'Varianza alta per categoria hotel' },
  SCO: { mech: 180, elec: 120, tot: 300, note: 'Standard pubblico base' },
  CON: { mech: 140, elec: 90,  tot: 230, note: 'Residenziale standard' },
  TLC: { mech: 0,   elec: 0,   tot: null,note: 'Costi su km/sito, non €/mq' },
  DL:  { mech: 0,   elec: 0,   tot: null,note: 'Costi su varchi/telecamere' },
}
