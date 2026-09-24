# MyBudget

# Financial Planner App
 
## Descrizione
 
Applicazione web monolitica per la gestione delle finanze personali e familiari.
 
L'obiettivo è offrire una visione completa delle entrate e delle uscite dell'utente, consentendo il monitoraggio giornaliero, mensile e annuale della situazione economica e fornendo suggerimenti utili per aumentare la capacità di risparmio.
 
---
 
# Obiettivi
 
L'applicazione deve permettere di:
 
- Monitorare entrate e uscite.
- Analizzare la situazione finanziaria personale o familiare.
- Calcolare il risparmio potenziale.
- Individuare spese superflue.
- Ricevere suggerimenti di ottimizzazione finanziaria.
- Visualizzare l'andamento economico attraverso dashboard e grafici.
 
---
 
# Architettura
 
## Tipo Applicazione
 
Applicazione monolitica composta da:
 
- Frontend Web Responsive
- Backend REST API
- Database Relazionale
 
---
 
# Modulo Profilo Finanziario
 
## Profilo Utente
 
L'utente deve poter configurare il proprio profilo finanziario.
 
### Dati Anagrafici
 
- Nome
- Cognome
- Email
 
### Tipologia Profilo
 
- Individuale
- Familiare
 
---
 
## Nucleo Familiare
 
Possibilità di creare e gestire i membri della famiglia.
 
Per ogni membro:
 
- Nome
- Cognome
- Ruolo familiare
- Produce reddito (Si/No)
 
### Ruoli Disponibili
 
- Coniuge
- Figlio
- Genitore
- Altro
 
---
 
## Situazione Abitativa
 
Tipologia abitazione:
 
- Casa di proprietà
- Casa con mutuo
- Casa in affitto
 
### Informazioni da registrare
 
- Valore immobile
- Rata mutuo
- Canone affitto
- Durata mutuo
 
---
 
## Rendite e Redditi Passivi
 
Possibilità di inserire entrate aggiuntive:
 
- Affitti
- Dividendi
- Fondi
- Investimenti
- Pensioni
- Altre rendite
 
### Campi
 
- Descrizione
- Importo
- Frequenza
- Data inizio
 
---
 
# Modulo Entrate
 
## Entrate da Lavoro
 
### Tipologia Occupazione
 
- Lavoratore Dipendente
- Libero Professionista
- Partita IVA
- Pensionato
- Altro
 
### Informazioni Economiche
 
- Reddito netto mensile
- Reddito lordo mensile
- Tredicesima
- Quattordicesima
- Bonus annuali
 
---
 
## Gestione Tassazione
 
Per professionisti e Partita IVA:
 
- Percentuale tassazione
- Frequenza pagamento tasse
- Importo accantonato
 
---
 
# Modulo Spese
 
## Spese Fisse
 
Categorie predefinite:
 
### Casa
 
- Mutuo
- Affitto
- Bollette
- Condominio
- Internet
- Telefono
 
### Auto
 
- Assicurazione
- Bollo
- Carburante
- Manutenzione
 
### Sport e Benessere
 
- Palestra
- Attività sportive
- Abbonamenti
 
### Famiglia
 
- Scuola
- Mensa
- Attività extrascolastiche
 
---
 
## Finanziamenti
 
Possibilità di aggiungere finanziamenti illimitati.
 
### Campi
 
- Nome
- Descrizione
- Importo totale
- Rata mensile
- Data inizio
- Data fine
 
---
 
## Spese Variabili
 
L'utente può registrare spese ricorrenti.
 
### Esempi
 
- Colazione al bar
- Fumo
- Caffè
- Delivery
- Streaming
- Tempo libero
 
### Campi
 
- Nome
- Descrizione
- Categoria
- Importo
 
### Frequenza
 
- Giornaliera
- Settimanale
- Mensile
 
---
 
## Livello di Utilità
 
Ogni spesa deve avere un indice di utilità.
 
Scala:
 
| Valore | Significato |
|----------|----------|
| 1 | Superflua |
| 2 | Poco utile |
| 3 | Moderatamente utile |
| 4 | Utile |
| 5 | Essenziale |
 
Questo valore verrà utilizzato dal motore di suggerimenti.
 
---
 
# Dashboard
 
La dashboard rappresenta la schermata principale dell'applicazione.
 
---
 
## KPI Principali
 
### Giornalieri
 
- Entrate giornaliere
- Uscite giornaliere
- Saldo giornaliero
 
### Mensili
 
- Entrate mensili
- Uscite mensili
- Risparmio mensile
 
### Annuali
 
- Entrate annuali
- Uscite annuali
- Risparmio annuale
 
---
 
## Grafici
 
### Andamento Entrate/Uscite
 
Visualizzazioni disponibili:
 
- Giornaliera
- Mensile
- Annuale
 
Grafici:
 
- Line Chart
- Bar Chart
 
---
 
## Distribuzione Spese
 
Grafico a torta delle categorie:
 
- Casa
- Auto
- Famiglia
- Investimenti
- Tempo libero
- Altro
 
---
 
## Trend Risparmio
 
Calcolo:
 
```text
Risparmio = Entrate Totali - Uscite Totali
```
 
Visualizzazione dello storico del risparmio.
 
---
 
# Overview Intelligente
 
Sezione dedicata all'analisi automatica delle abitudini finanziarie.
 
---
 
## Analisi Finanziaria
 
L'applicazione deve mostrare:
 
- Stato della situazione economica
- Stabilità finanziaria
- Percentuale di risparmio
- Incidenza delle spese fisse
- Incidenza delle spese variabili
 
---
 
## Suggerimenti Automatici
 
L'app deve generare consigli per migliorare il risparmio.
 
### Esempi
 
- Ridurre le spese con utilità <= 2
- Evidenziare abbonamenti poco utilizzati
- Segnalare categorie in crescita anomala
- Mostrare l'impatto annuale delle spese giornaliere
 
### Caso d'Uso
 
Fumo:
 
```text
Costo giornaliero: 6 €
 
Costo mensile: 180 €
 
Costo annuale: 2.190 €
```
 
---
 
# Simulatore di Risparmio
 
L'utente deve poter effettuare simulazioni.
 
## Esempi
 
### Scenario 1
 
Riduzione di una spesa del 10%
 
### Scenario 2
 
Eliminazione di una spesa
 
### Scenario 3
 
Incremento del reddito
 
---
 
## Output
 
```text
Risparmio attuale: 250 €/mese
 
Eliminazione fumo:
+180 €/mese
 
Nuovo risparmio:
430 €/mese
```
 
---
 
# Financial Health Score
 
L'applicazione deve calcolare un indicatore sintetico della salute finanziaria.
 
## Valore
 
Da 0 a 100
 
## Parametri
 
- Rapporto entrate/spese
- Percentuale di risparmio
- Debiti attivi
- Finanziamenti
- Spese superflue
- Stabilità del reddito
 
### Interpretazione
 
| Score | Stato |
|---------|---------|
| 0-30 | Critico |
| 31-50 | Debole |
| 51-70 | Sufficiente |
| 71-85 | Buono |
| 86-100 | Eccellente |
 
---
 
# Autenticazione
 
Funzionalità richieste:
 
- Registrazione
- Login
- Recupero password
- Modifica profilo
 
---
 
# Requisiti Non Funzionali
 
- UI moderna
- Responsive design
- Mobile First
- Sicurezza dati
- Database persistente
- Performance elevate
- Codice manutenibile
- Modularità interna
 
---