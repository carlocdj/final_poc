# AEDE Digital Intelligence — POC Vercel

POC per la gestione progetti normalizzata basata su **AEDE_Catalogo_Integrato_v3_Normalizzato.xlsx**.

## Struttura viste

| Vista | Descrizione | Fogli catalogo |
|-------|-------------|----------------|
| Dashboard | KPI overview + accesso rapido progetti | 0, 3, 8 |
| Commesse | Lista SP COMMESSE + LOTTI con path FSx calcolati | 7, 8 |
| FSx Explorer | Struttura CDE ISO 19650 navigabile | 5, 6 |
| AI Simulator | Stima costi da misure → Claude API | 9, 10 |
| Catalogo Ref. | Tutti gli 11 fogli del workbook | tutti |

## Setup locale

```bash
npm install
cp .env.example .env.local
# Inserisci la tua API key Anthropic in .env.local
npm run dev
```

## Deploy su Vercel

1. Push su GitHub
2. Importa il repo su vercel.com
3. **Settings > Environment Variables** → aggiungi `VITE_ANTHROPIC_API_KEY`
4. Deploy

## Note architetturali

- **FSx paths**: calcolati dinamicamente da `calcFsxPaths(settore, commessa, lotto)` in `seedData.js`
- **AI Simulator**: chiama `api.anthropic.com/v1/messages` direttamente dal browser usando il modello `claude-sonnet-4-20250514`
- **Dati catalogo**: `src/data/catalogData.json` — estratto da `Catalogo_Integrato_v2__1_.xlsx` (misure, incidenze, discipline, mapping ontologia)
- **CodiceOntologia**: chiave primaria condivisa, visualizzata ovunque (discipline → tabelle misure → AI output)

## Prossimi step post-POC

- [ ] Integrazione reale con SharePoint tramite Microsoft Graph API
- [ ] Backend proxy per API key sicura (Vercel Edge Functions)
- [ ] Connessione ad Amazon Bedrock Knowledge Base (post-validazione)
- [ ] Autenticazione Azure AD / SSO
