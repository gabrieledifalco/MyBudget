# SYSTEM ROLE

Agisci come un Senior Product Designer, Software Architect e Full Stack Engineer.

Il tuo compito è progettare e realizzare un'applicazione web monolitica completa (Frontend + Backend + Database) denominata "Financial Planner".

Non generare prototipi parziali.

Genera una soluzione pronta per la produzione seguendo rigorosamente tutti i requisiti presenti in questo documento.

---

# PRODUCT VISION

Financial Planner è un'applicazione dedicata alla gestione finanziaria personale e familiare.

Lo scopo principale dell'applicazione è consentire agli utenti di comprendere immediatamente:

- Quanto guadagnano
- Quanto spendono
- Quanto riescono a risparmiare
- Qual è il loro stato di salute finanziaria

L'app deve essere progettata con una logica "Dashboard First".

L'utente deve riuscire a comprendere la propria situazione finanziaria entro 5 secondi dall'apertura della Dashboard.

---

# OBIETTIVO PRINCIPALE

Consentire una visualizzazione:

- Giornaliera
- Mensile
- Annuale

di:

- Entrate
- Uscite
- Risparmio

e fornire strumenti intelligenti di:

- Analisi finanziaria
- Ottimizzazione delle uscite
- Simulazione di scenari economici
- Monitoraggio salute finanziaria

---

# TIPO DI APPLICAZIONE

Realizzare una applicazione monolitica costituita da:

## Frontend

- Responsive
- Mobile First
- Dashboard interattiva
- UX semplice e intuitiva

## Backend

- REST API
- Business Logic centralizzata
- Autenticazione utenti

## Database

Database relazionale.

Tecnologia preferita:

PostgreSQL

---

# USER JOURNEY

L'utente non può accedere alla Dashboard senza aver completato la profilazione.

---

## STEP 1 - REGISTRAZIONE

Creazione account tramite:

- Nome
- Cognome
- Email
- Password

---

## STEP 2 - SCELTA PROFILO

L'utente deve scegliere:

### Profilo Individuale

Gestione delle proprie finanze personali.

### Profilo Familiare

Gestione di un budget condiviso.

---

## STEP 3 - CONFIGURAZIONE NUCLEO FAMILIARE

Se viene selezionato il profilo familiare:

Permettere l'inserimento di tutti i membri del nucleo.

Per ogni membro:

- Nome
- Cognome
- Ruolo familiare
- Produce reddito (SI/NO)

Ruoli:

- Coniuge
- Figlio
- Genitore
- Altro

---

## STEP 4 - PROFILAZIONE REDDITUALE

Per ogni membro che produce reddito registrare:

- Reddito netto mensile
- Numero mensilità annue
- Tredicesima
- Quattordicesima
- Bonus annuali
- Entrate extra
- Rendite passive

Il sistema deve consentire l'aggiornamento mensile dello stipendio.

Tutte le variazioni devono essere storicizzate.

Mantenere la cronologia completa dei redditi.

---

## STEP 5 - PROFILAZIONE ABITATIVA

Tipologia abitazione:

- Casa di proprietà
- Casa con mutuo
- Casa in affitto

Informazioni richieste:

- Valore immobile
- Mutuo residuo
- Rata mutuo
- Durata mutuo
- Affitto mensile

---

## STEP 6 - ENTRATE PASSIVE

Possibilità di inserire:

- Affitti
- Investimenti
- Dividendi
- Fondi
- Pensioni
- Rendite varie

---

## FINE ONBOARDING

Al termine:

Reindirizzare automaticamente alla Dashboard.

---

# NAVIGAZIONE PRINCIPALE

La navigazione deve essere minimale.

Utilizzare solamente le sezioni essenziali.

---

## MENU SINISTRO

### Entrate

Gestione completa delle fonti di reddito.

Funzionalità:

- Stipendi
- Bonus
- Tredicesima
- Quattordicesima
- Affitti
- Rendite
- Investimenti
- Pensioni

---

## MENU CENTRALE

### Dashboard

Sezione principale dell'applicazione.

Deve essere la schermata predefinita.

Elemento centrale dell'intera esperienza utente.

---

## MENU DESTRO

### Uscite

NON utilizzare la parola "Spese".

Utilizzare sempre il termine "Uscite".

Comprendere:

- Casa
- Auto
- Famiglia
- Finanziamenti
- Tempo libero
- Sport
- Assicurazioni
- Utenze
- Spese occasionali

---

## ANGOLO ALTO DESTRO

### Profilo Utente

Visualizzare icona utente.

Click sull'icona apre:

#### Anagrafica

- Nome
- Cognome
- Email

#### Componenti Famiglia

Gestione nucleo familiare.

#### Profilazione Reddituale

Visualizzare:

- Redditi per componente
- Reddito medio familiare
- Reddito annuale complessivo

---

# DASHBOARD

## REGOLA FONDAMENTALE

La Dashboard è il cuore dell'applicazione.

Il grafico deve occupare la maggior parte dello spazio visibile.

---

## HEADER KPI

Mostrare in primo piano:

### Entrate Totali

### Uscite Totali

### Capacità di Risparmio

Formula:

Risparmio = Entrate - Uscite

### Financial Health Score

Valore da 0 a 100.

---

## GRAFICO PRINCIPALE

Elemento dominante della schermata.

Permettere visualizzazione:

- Giornaliera
- Mensile
- Annuale

Visualizzare contemporaneamente:

- Entrate
- Uscite
- Risparmio

Supportare:

- Line Chart
- Area Chart
- Bar Chart

---

## DETTAGLIO NUMERICO

Subito sotto il grafico.

Visualizzare:

### Entrate

- Giorno
- Mese
- Anno

### Uscite

- Giorno
- Mese
- Anno

### Risparmio

- Giorno
- Mese
- Anno

---

# OVERVIEW INTELLIGENTE

NON creare una pagina separata.

Integrare direttamente nella Dashboard.

---

## ANALISI AUTOMATICA

Mostrare:

- Stabilità finanziaria
- Capacità di risparmio
- Trend finanziario
- Incidenza uscite fisse
- Incidenza uscite variabili

---

## INSIGHT AUTOMATICI

Esempi:

- Spese superflue elevate
- Abbonamenti poco utilizzati
- Categorie fuori controllo
- Possibili opportunità di risparmio

---

# SIMULATORE FINANZIARIO

NON creare una pagina separata.

Posizionare sotto la sezione Overview.

---

## SCENARI SUPPORTATI

### Riduzione Uscita

Esempio:

Ridurre una spesa del 20%.

---

### Eliminazione Uscita

Esempio:

Eliminare totalmente una spesa.

---

### Incremento Reddito

Esempio:

Aumentare stipendio o entrate.

---

## OUTPUT DEL SIMULATORE

Mostrare:

- Nuovo saldo mensile
- Nuovo saldo annuale
- Nuova capacità di risparmio
- Nuovo Financial Health Score

Aggiornamento in tempo reale.

---

# MODULO ENTRATE

Ogni componente può avere multiple fonti di reddito.

Supportare:

- Dipendente
- Libero professionista
- Partita IVA
- Pensionato
- Altro

Dati:

- Reddito netto
- Reddito lordo
- Numero mensilità
- Tredicesima
- Quattordicesima
- Bonus

Tutte le variazioni devono essere storicizzate.

---

# MODULO USCITE

Supportare:

## Uscite Fisse

- Mutuo
- Affitto
- Condominio
- Bollette
- Internet
- Assicurazioni

## Auto

- Bollo
- Carburante
- Manutenzione

## Famiglia

- Scuola
- Mensa
- Attività

## Sport e Benessere

- Palestra
- Attività sportive
- Abbonamenti

## Finanziamenti

Elenco illimitato.

---

# ASSEGNAZIONE USCITE

Ogni uscita deve poter essere associata a:

### Famiglia

Oppure

### Singolo Membro

Ciò deve consentire analisi:

- Individuali
- Familiari

---

# LIVELLO UTILITÀ USCITA

Ogni uscita deve avere un rating.

| Valore | Significato |
|----------|----------|
| 1 | Superflua |
| 2 | Poco utile |
| 3 | Moderata |
| 4 | Utile |
| 5 | Essenziale |

Utilizzare questo indicatore per generare gli insight automatici.

---

# FINANCIAL HEALTH SCORE

Calcolare un punteggio da 0 a 100 basato su:

- Rapporto entrate/uscite
- Capacità di risparmio
- Stabilità redditi
- Finanziamenti attivi
- Debiti
- Incidenza spese superflue

Visualizzazione:

- Critico
- Debole
- Sufficiente
- Buono
- Eccellente

---

# AUTENTICAZIONE

Supportare:

- Registrazione
- Login
- Recupero password
- Gestione profilo

---

# REQUISITI NON FUNZIONALI

- Mobile First
- Responsive Design
- UI moderna
- Elevate performance
- Sicurezza dati
- Architettura manutenibile
- Codice pulito
- Docker Ready
- Open Banking Ready (estensione futura)

---

# DELIVERABLE OBBLIGATORI

Genera:

1. Architettura applicativa completa
2. Schema database PostgreSQL
3. Diagramma ER
4. API REST
5. Modelli dati
6. Backend completo
7. Frontend completo
8. Dashboard completa
9. Simulatore finanziario
10. Financial Health Engine
11. Docker Compose
12. Seed dati demo
13. Documentazione tecnica
14. Documentazione installazione
15. Piano di deploy

NON semplificare i requisiti.

Progetta l'applicazione come se dovesse essere immediatamente sviluppata e messa in produzione.