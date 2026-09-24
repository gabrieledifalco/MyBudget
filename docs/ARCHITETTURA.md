# Architettura e convenzioni del repo

Monolite applicativo con **frontend e backend fisicamente separati** in due workspace npm.
Nessun file sorgente è condiviso tra i due: chi lavora sul FE tocca solo `frontend/`,
chi lavora sul BE solo `backend/`. I conflitti git restano quindi circoscritti.

```
MyBudget/
├── package.json          # workspace root: script di avvio combinati
├── backend/              # API REST Node.js (JavaScript ESM)
│   ├── prisma/           # schema dati + seed categorie
│   └── src/
│       ├── config/       # env, client Prisma
│       ├── routes/       # definizione endpoint, uno per modulo
│       ├── controllers/  # parsing richiesta + risposta HTTP
│       ├── services/     # logica di dominio (calcoli, regole)
│       ├── validators/   # schemi Zod di input
│       ├── middleware/   # auth, gestione errori, 404
│       └── utils/        # helper condivisi (frequenze, errori)
├── frontend/             # SPA React + TypeScript (Vite)
│   └── src/
│       ├── api/          # chiamate HTTP tipizzate verso /api
│       ├── components/   # UI riusabile (layout, ui, charts)
│       ├── features/     # una cartella per modulo funzionale
│       ├── pages/        # una pagina per rotta
│       ├── hooks/        # hook riusabili
│       ├── types/        # tipi di dominio condivisi nel FE
│       └── styles/       # token e stili globali
└── docs/                 # documentazione tecnica
```

## Contratto fra i due lati

Il frontend chiama **sempre** `/api/...`. In sviluppo il proxy Vite inoltra a
`http://localhost:4000`; in produzione il backend può servire `frontend/dist`
dalla stessa origin. Cambiare porta non richiede modifiche al codice FE.

## Moduli (allineati al README funzionale)

| Modulo | Backend | Frontend |
|---|---|---|
| Autenticazione | `routes/auth.routes.js` | `features/auth`, `pages/LoginPage` |
| Profilo finanziario | `routes/profile.routes.js` | `features/profile` |
| Entrate | `routes/income.routes.js` | `features/income` |
| Spese e finanziamenti | `routes/expense.routes.js` | `features/expenses` |
| Dashboard / KPI | `routes/dashboard.routes.js` | `features/dashboard` |
| Overview e health score | `routes/insights.routes.js` | `features/insights` |
| Simulatore | `routes/simulation.routes.js` | `features/simulator` |

Solo `auth` è già implementato end-to-end; gli altri router rispondono `501`
e vanno completati seguendo lo stesso schema route → controller → service.

## Convenzioni per evitare conflitti

- Un modulo = un file per layer. Non aggiungere endpoint di moduli diversi nello stesso file.
- `routes/index.js` e `App.tsx` sono gli unici punti di registrazione condivisi:
  toccarli con una riga sola, in fondo alla lista.
- Branch per modulo: `feat/spese`, `feat/dashboard`, …
- I calcoli finanziari stanno nei service del backend, mai duplicati nel FE.

## Avvio

```bash
npm install
cp backend/.env.example backend/.env
npm run db:migrate --workspace backend   # crea lo schema SQLite
npm run db:seed --workspace backend      # categorie predefinite
npm run dev                              # avvia BE (4000) e FE (5173)
```
