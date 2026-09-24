import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
// zodOutputFormat richiede uno schema zod v4. Il resto del backend usa l'API v3
// classica di zod 3.25, che espone la v4 su questo sottopercorso.
import { z } from "zod/v4";

import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { httpError } from "../utils/httpError.js";

// Schema dell'output del modello. Non include categoryId: il modello sceglie
// per *nome*, e la risoluzione all'id reale avviene qui sotto, così non può
// restituire un id inesistente.
const classificationSchema = z.object({
  name: z.string(),
  amount: z.number().nullable(),
  categoryName: z.string().nullable(),
  kind: z.enum(["FIXED", "VARIABLE"]),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  utility: z.number().int().min(1).max(5),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
});

const SYSTEM_PROMPT = `Sei il classificatore di spese di MyBudget, un'app di finanza personale italiana.

Ricevi la descrizione di una spesa scritta dall'utente, oppure il testo grezzo estratto via OCR da uno scontrino. Devi proporre i campi strutturati che l'utente dovrebbe altrimenti compilare a mano.

CATEGORIA
Scegli esclusivamente tra i nomi di categoria forniti nel messaggio. Se nessuno è pertinente, restituisci null: non inventare categorie e non forzare "Altro" quando il dato non è chiaro.

TIPO
FIXED: importo stabile e prevedibile che si ripete (affitto, mutuo, abbonamenti, assicurazioni, rate).
VARIABLE: importo o frequenza che cambiano (spesa alimentare, ristoranti, carburante, tempo libero).

FREQUENZA
Deducila dal testo. Se l'utente non la indica, scegli la più plausibile per quel tipo di spesa: le utenze sono mensili, il bollo auto annuale, il caffè al bar giornaliero.

UTILITÀ (1-5) — è il campo più importante
5 Essenziale: senza questa spesa la vita quotidiana si interrompe. Casa, utenze, alimentari di base, cure mediche.
4 Utile: sostiene salute, lavoro o istruzione. Trasporto per lavoro, sport, formazione, assicurazioni obbligatorie.
3 Moderatamente utile: utile ma sostituibile con alternative meno costose.
2 Poco utile: comfort o abitudine. Delivery, abbonamenti di intrattenimento, colazione al bar.
1 Superflua: nessun beneficio o beneficio negativo. Fumo, gioco d'azzardo, acquisti d'impulso.

IMPORTO
Estrai l'importo se presente. Su uno scontrino scegli il TOTALE, mai i parziali o il resto. Se non c'è un importo riconoscibile, restituisci null.

CONFIDENZA
Rifletti quanto il testo è effettivamente interpretabile. Una descrizione opaca come "xyz 20" merita una confidenza bassa e categoryName null. Non gonfiare la confidenza per sembrare utile.

MOTIVAZIONE
Una frase breve e neutra che spieghi la scelta dell'utilità. Descrivi il criterio, non giudicare l'utente: "abitudine ricorrente a basso beneficio", non "dovresti smettere".`;

let client = null;

function getClient() {
  if (!env.anthropicApiKey) {
    throw httpError(503, "Classificazione non disponibile: ANTHROPIC_API_KEY non configurata");
  }
  client ??= new Anthropic({ apiKey: env.anthropicApiKey });
  return client;
}

/** True se l'endpoint è utilizzabile: il frontend lo usa per mostrare o nascondere il campo. */
export function isEnabled() {
  return Boolean(env.anthropicApiKey);
}

export async function classify({ text, source = "MANUAL_INPUT" }) {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, macroArea: true },
    orderBy: { name: "asc" },
  });

  const categoryList = categories.map((c) => `- ${c.name} (${c.macroArea})`).join("\n");
  const origin =
    source === "RECEIPT_OCR"
      ? "Il testo seguente proviene dall'OCR di uno scontrino e può contenere errori di lettura, righe di intestazione e importi parziali."
      : "Il testo seguente è la descrizione scritta direttamente dall'utente.";

  let response;
  try {
    response = await getClient().messages.parse({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      // Classificazione breve: effort basso tiene bassa la latenza nel form.
      output_config: {
        effort: "low",
        format: zodOutputFormat(classificationSchema),
      },
      messages: [
        {
          role: "user",
          content: `Categorie disponibili:\n${categoryList}\n\n${origin}\n\n---\n${text}\n---`,
        },
      ],
    });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      throw httpError(502, `Il classificatore non ha risposto (${err.status})`);
    }
    throw err;
  }

  if (response.stop_reason === "refusal") {
    throw httpError(422, "Il classificatore ha rifiutato di elaborare questo testo");
  }

  const parsed = response.parsed_output;
  if (!parsed) throw httpError(502, "Risposta del classificatore non interpretabile");

  // Il nome proposto dal modello viene risolto contro le categorie reali.
  // Confronto case-insensitive; se non combacia, il campo resta vuoto.
  const match = categories.find(
    (c) => c.name.toLowerCase() === (parsed.categoryName ?? "").toLowerCase(),
  );

  return {
    name: parsed.name,
    amount: parsed.amount,
    categoryId: match?.id ?? null,
    categoryName: match?.name ?? null,
    kind: parsed.kind,
    frequency: parsed.frequency,
    utility: parsed.utility,
    reasoning: parsed.reasoning,
    confidence: parsed.confidence,
  };
}
