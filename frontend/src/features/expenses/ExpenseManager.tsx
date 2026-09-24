import { Camera, Paperclip, X } from "lucide-react";
import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { createWorker } from "tesseract.js";

import * as expenseApi from "@/api/expense.api";
import * as profileApi from "@/api/profile.api";
import { useAuth } from "@/features/auth/AuthContext";
import { useCurrency } from "@/features/settings/CurrencyContext";
import { useFetch } from "@/hooks/useFetch";
import type {
  Expense,
  ExpenseKind,
  Frequency,
  UtilityLevel,
} from "@/types/domain";

const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: "Giornaliera",
  WEEKLY: "Settimanale",
  MONTHLY: "Mensile",
  YEARLY: "Annuale",
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  name: "",
  description: "",
  kind: "VARIABLE" as ExpenseKind,
  categoryId: "",
  memberId: "",
  amount: "",
  frequency: "MONTHLY" as Frequency,
  utility: "3",
  isRecurring: true,
  date: today,
  startDate: "",
  endDate: "",
};

function fmtDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("it-IT");
}

// ── Receipt modal ──────────────────────────────────────────────────────────────
interface ReceiptModalProps {
  expense: Expense;
  onClose: () => void;
  onSaved: () => void;
}

function extractAmount(text: string): string {
  const patterns = [
    /(?:totale|total|tot\.?)\D{0,6}(\d{1,6}[.,]\d{2})/gi,
    /€\s*(\d{1,6}[.,]\d{2})/g,
    /(\d{1,6}[.,]\d{2})\s*€/g,
    /(\d{1,6}[.,]\d{2})/g,
  ];
  const found: number[] = [];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) {
      const n = parseFloat(m[1].replace(",", "."));
      if (!isNaN(n) && n > 0 && n < 100000) found.push(n);
    }
    if (found.length) break;
  }
  if (!found.length) return "";
  return String(Math.max(...found));
}

function extractDescription(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3 && !/^\d/.test(l));
  return (lines[0] ?? "").slice(0, 60);
}

function ReceiptModal({ expense, onClose, onSaved }: ReceiptModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocring, setOcring] = useState(false);
  const [description, setDescription] = useState(expense.description ?? "");
  const [amount, setAmount] = useState(String(expense.amount));
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (f: File) => {
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
      setOcring(true);
      try {
        const worker = await createWorker("ita");
        const { data } = await worker.recognize(f);
        await worker.terminate();
        const extracted = extractAmount(data.text);
        const desc = extractDescription(data.text);
        if (extracted) setAmount(extracted);
        if (desc && !expense.description) setDescription(desc);
      } catch {
        // OCR failed silently — user can fill in manually
      } finally {
        setOcring(false);
      }
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleApply = async () => {
    if (!file && !expense.receiptUrl) return;
    setSaving(true);
    setError(null);
    try {
      await expenseApi.updateExpense(expense.id, {
        description: description || undefined,
        amount: Number(amount) || expense.amount,
      });
      if (file) await expenseApi.uploadReceipt(expense.id, file);
      onSaved();
      onClose();
    } catch {
      setError("Errore durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="modal">
        <div className="modal__header">
          <div>
            <h2 className="modal__title">Scontrino</h2>
            <p className="modal__subtitle">{expense.name}</p>
          </div>
          <button type="button" className="btn btn--ghost btn--sm modal__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {expense.receiptUrl && (
          <div style={{ marginBottom: "var(--space)" }}>
            <p className="page__hint" style={{ textAlign: "left", marginBottom: 4 }}>Scontrino archiviato</p>
            <img
              src={`http://localhost:4000${expense.receiptUrl}`}
              alt="Scontrino"
              className="receipt-preview"
            />
          </div>
        )}

        <div
          className={`receipt-dropzone${dragOver ? " drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("receipt-input")?.click()}
        >
          {preview ? (
            <img src={preview} alt="Anteprima" className="receipt-preview" />
          ) : (
            <>
              <Camera size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p>Trascina o clicca per caricare lo scontrino</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG, PDF — max 10 MB</p>
            </>
          )}
          <input
            id="receipt-input"
            type="file"
            accept="image/*,application/pdf"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          />
        </div>

        {ocring && (
          <p className="page__hint" style={{ marginTop: "var(--space-sm)" }}>
            Analisi scontrino…
          </p>
        )}

        <div className="form" style={{ marginTop: "var(--space)" }}>
          <label className="field">
            <span className="field__label">Descrizione estratta</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">Importo estratto (€)</span>
            <input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
        </div>

        {error && <p className="form__error" style={{ marginTop: "var(--space-sm)" }}>{error}</p>}

        <div className="list-item__actions" style={{ marginTop: "var(--space)" }}>
          <button
            type="button"
            className="btn btn--primary"
            disabled={saving || ocring}
            onClick={handleApply}
          >
            {saving ? "Salvataggio…" : "Applica"}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ExpenseManager() {
  const { user } = useAuth();
  const { format, symbol } = useCurrency();
  const isFamily = user?.profileType === "FAMILY";
  const { data: categories } = useFetch(expenseApi.listCategories, []);
  const { data: familyMembers } = useFetch(profileApi.listFamilyMembers, []);
  const {
    data: expenses,
    loading,
    error,
    reload,
  } = useFetch(expenseApi.listExpenses, []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receiptExpense, setReceiptExpense] = useState<Expense | null>(null);

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      name: expense.name,
      description: expense.description ?? "",
      kind: expense.kind,
      categoryId: expense.categoryId ?? "",
      memberId: expense.memberId ?? "",
      amount: String(expense.amount),
      frequency: expense.frequency,
      utility: String(expense.utility),
      isRecurring: expense.isRecurring,
      date: expense.date ? expense.date.slice(0, 10) : today,
      startDate: expense.startDate ? expense.startDate.slice(0, 10) : "",
      endDate: expense.endDate ? expense.endDate.slice(0, 10) : "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Partial<Omit<Expense, "id">> = {
        name: form.name,
        description: form.description || undefined,
        kind: form.kind,
        categoryId: form.categoryId || undefined,
        memberId: isFamily && form.memberId ? form.memberId : undefined,
        amount: Number(form.amount),
        frequency: form.frequency,
        utility: Number(form.utility) as UtilityLevel,
        isRecurring: form.isRecurring,
      };

      if (form.isRecurring) {
        if (form.startDate) payload.startDate = form.startDate;
        if (form.endDate) payload.endDate = form.endDate;
      } else {
        payload.date = form.date;
      }

      if (editingId) {
        await expenseApi.updateExpense(editingId, payload);
      } else {
        await expenseApi.createExpense(payload as Omit<Expense, "id">);
      }
      resetForm();
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await expenseApi.deleteExpense(id);
    if (editingId === id) resetForm();
    reload();
  };

  return (
    <>
      <div className="card">
        <h2>{editingId ? "Modifica uscita" : "Nuova uscita"}</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="field">
              <span>Nome</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Categoria</span>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Nessuna</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Tipo</span>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as ExpenseKind })}
              >
                <option value="FIXED">Fissa</option>
                <option value="VARIABLE">Variabile</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Descrizione</span>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          <div className="form-row">
            <label className="field">
              <span>Importo ({symbol})</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Frequenza</span>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
              >
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Utilità (1–5)</span>
              <select
                value={form.utility}
                onChange={(e) => setForm({ ...form, utility: e.target.value })}
              >
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="field field--checkbox">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
            />
            <span>Spesa ricorrente</span>
          </label>

          {form.isRecurring ? (
            <div className="form-row">
              <label className="field">
                <span>Inizio ricorrenza</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Fine ricorrenza</span>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </label>
            </div>
          ) : (
            <label className="field">
              <span>Data</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>
          )}

          {isFamily && (
            <label className="field">
              <span>Imputa a</span>
              <select
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              >
                <option value="">Nucleo familiare (generica)</option>
                {familyMembers?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="list-item__actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {editingId ? "Salva modifiche" : "Aggiungi uscita"}
            </button>
            {editingId && (
              <button type="button" className="btn btn--ghost" onClick={resetForm}>
                Annulla
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Uscite registrate</h2>
        {loading && <p className="page__hint">Caricamento…</p>}
        {error && <p className="form__error">{error}</p>}
        {expenses && expenses.length === 0 && (
          <p className="empty-state">Nessuna uscita registrata.</p>
        )}
        <div className="list">
          {expenses?.map((expense) => (
            <div className="list-item" key={expense.id}>
              <div className="list-item__main">
                <span className="list-item__title">
                  {expense.name}{" "}
                  {expense.receiptUrl && (
                    <Paperclip
                      size={12}
                      style={{ display: "inline", verticalAlign: "middle", color: "var(--text-muted)", marginLeft: 4 }}
                    />
                  )}
                  <span className={`badge badge--utility-${expense.utility}`}>
                    {expense.utility}/5
                  </span>
                </span>
                <span className="list-item__meta">
                  {expense.kind === "FIXED" ? "Fissa" : "Variabile"} ·{" "}
                  {format(expense.amount)} /{" "}
                  {FREQUENCY_LABELS[expense.frequency].toLowerCase()}
                  {expense.isRecurring && expense.startDate && expense.endDate
                    ? ` · dal ${fmtDate(expense.startDate)} al ${fmtDate(expense.endDate)}`
                    : expense.isRecurring && expense.startDate
                      ? ` · dal ${fmtDate(expense.startDate)}`
                      : !expense.isRecurring && expense.date
                        ? ` · ${fmtDate(expense.date)}`
                        : ""}
                  {expense.memberId &&
                    ` · ${familyMembers?.find((m) => m.id === expense.memberId)?.firstName ?? "membro"}`}
                </span>
              </div>
              <div className="list-item__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  title="Scontrino"
                  onClick={() => setReceiptExpense(expense)}
                >
                  <Camera size={14} />
                  Scontrino
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => startEdit(expense)}
                >
                  Modifica
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(expense.id)}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {receiptExpense && (
        <ReceiptModal
          expense={receiptExpense}
          onClose={() => setReceiptExpense(null)}
          onSaved={reload}
        />
      )}
    </>
  );
}
