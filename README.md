---

# User Journey

## Primo Accesso

L'applicazione deve guidare l'utente attraverso una procedura iniziale obbligatoria di configurazione.

### Step 1 - Registrazione

L'utente deve:

- Creare il proprio account.
- Inserire email e password.
- Confermare i dati di accesso.

---

### Step 2 - Profilazione Finanziaria

Dopo la registrazione l'utente deve completare il proprio profilo finanziario.

Informazioni richieste:

- Nome
- Cognome
- Tipologia profilo

Tipologie:

- Individuale
- Familiare

---

### Step 3 - Configurazione Nucleo Familiare

Se viene selezionata la modalità familiare, l'utente deve poter aggiungere i componenti del nucleo.

Per ogni membro:

- Nome
- Cognome
- Ruolo familiare
- Produce reddito (Sì/No)

Ruoli disponibili:

- Coniuge
- Figlio
- Genitore
- Altro

---

### Step 4 - Inserimento Redditi

Per ogni membro che produce reddito devono essere registrate le seguenti informazioni:

- Reddito netto mensile
- Numero mensilità annuali
- Tredicesima
- Quattordicesima
- Bonus annuali

L'applicazione deve considerare che il reddito può variare nel tempo.

Pertanto ogni mese deve essere possibile:

- Aggiornare il reddito netto.
- Registrare bonus straordinari.
- Indicare variazioni salariali.
- Mantenere lo storico dei redditi.

---

### Step 5 - Inserimento Spese

L'utente deve poter registrare:

- Spese familiari generiche.
- Spese associate ad un singolo componente.

Ogni spesa deve prevedere:

- Descrizione
- Categoria
- Importo
- Frequenza
- Proprietario della spesa

Valori possibili:

- Famiglia
- Singolo membro del nucleo familiare

---

### Fine Onboarding

Al termine della configurazione iniziale l'utente viene reindirizzato alla Dashboard.

---

# Dashboard UX

La Dashboard rappresenta la schermata principale dell'applicazione e deve mostrare immediatamente la situazione finanziaria complessiva.

L'obiettivo è permettere all'utente di comprendere in pochi secondi il proprio stato economico.

---

## Priorità di Visualizzazione

### 1. Grafico Principale

In primo piano deve essere visualizzato un grafico che metta in evidenza:

- Entrate
- Uscite
- Risparmio

Visualizzazioni disponibili:

- Giornaliera
- Mensile
- Annuale

---

### 2. KPI Principali

Immediatamente sotto il grafico devono essere evidenziati:

#### Entrate

- Entrate giornaliere
- Entrate mensili
- Entrate annuali

#### Uscite

- Uscite giornaliere
- Uscite mensili
- Uscite annuali

#### Capacità di Risparmio

- Risparmio giornaliero
- Risparmio mensile
- Risparmio annuale

Formula:

```text
Risparmio = Entrate - Uscite
```

---

### 3. Dettaglio Spese

Visualizzazione delle spese aggregate per:

- Casa
- Auto
- Famiglia
- Tempo libero
- Sport
- Investimenti
- Altro

Possibilità di filtrare:

- Mese
- Anno
- Membro familiare

---

### 4. Insight Rapidi

Sezione dedicata agli avvisi automatici.

Esempi:

- Stai spendendo il 25% in più rispetto al mese scorso.
- Le spese superflue incidono per il 18% sulle uscite mensili.
- Eliminando il fumo potresti risparmiare 2.190 € all'anno.
- Il tuo tasso di risparmio è inferiore al target impostato.

---

# Regole di Business

## Redditi

- Un membro può avere più fonti di reddito.
- I redditi devono essere storicizzati mese per mese.
- I redditi possono essere modificati nel tempo.
- Bonus e mensilità aggiuntive devono essere conteggiate nel totale annuale.

-