import { useState, type FormEvent } from "react";

import * as incomeApi from "@/api/income.api";
import * as profileApi from "@/api/profile.api";
import { useAuth } from "@/features/auth/AuthContext";
import { useCurrency } from "@/features/settings/CurrencyContext";
import { useFetch } from "@/hooks/useFetch";
import type { EmploymentType, Income, TaxFrequency } from "@/types/domain";

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  EMPLOYEE: "Lavoratore dipendente",
  FREELANCER: "Libero professionista",
  VAT: "Partita IVA",
  RETIRED: "Pensionato",
  OTHER: "Altro",
};

const emptyForm = {
  employmentType: "EMPLOYEE" as EmploymentType,
  netMonthly: "",
  grossAnnual: "",
  monthlyPaymentsCount: "12",
  thirteenthSalary: "",
  fourteenthSalary: "",
  annualBonus: "",
  taxRate: "",
  taxFrequency: "" as TaxFrequency | "",
  taxSetAside: "",
  memberId: "",
};

const num = (value: string) => (value === "" ? undefined : Number(value));

function IncomeHistory({ incomeId }: { incomeId: string }) {
  const { format } = useCurrency();
  const { data: history, loading } = useFetch(
    () => incomeApi.getIncomeHistory(incomeId),
    [incomeId],
  );

  if (loading) return <p className="page__hint">Caricamento storico…</p>;
  if (!history || history.length === 0)
    return <p className="empty-state">Nessuna variazione storicizzata.</p>;

  return (
    <div className="list" style={{ marginTop: 8 }}>
      {history.map((entry) => (
        <div className="list-item" key={entry.id}>
          <span className="list-item__title">
            {new Date(entry.recordedAt).toLocaleDateString("it-IT")}
          </span>
          <span className="list-item__meta">
            Netto {format(entry.netMonthly)} · Lordo {format(entry.grossAnnual)}
            /anno · {entry.monthlyPaymentsCount} mensilità
          </span>
        </div>
      ))}
    </div>
  );
}

export function IncomeManager() {
  const { user } = useAuth();
  const { format, symbol } = useCurrency();
  const isFamily = user?.profileType === "FAMILY";
  const { data: familyMembers } = useFetch(profileApi.listFamilyMembers, []);
  const {
    data: incomes,
    loading,
    error,
    reload,
  } = useFetch(incomeApi.listIncomes, []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [historyOpenId, setHistoryOpenId] = useState<string | null>(null);
  const showTax =
    form.employmentType === "FREELANCER" || form.employmentType === "VAT";
  const monthlyPaymentsCount = Number(form.monthlyPaymentsCount) || 12;
  const showThirteenth = monthlyPaymentsCount >= 13;
  const showFourteenth = monthlyPaymentsCount >= 14;

  const startEdit = (income: Income) => {
    setEditingId(income.id);
    setForm({
      employmentType: income.employmentType,
      netMonthly: String(income.netMonthly),
      grossAnnual: String(income.grossAnnual),
      monthlyPaymentsCount: String(income.monthlyPaymentsCount),
      thirteenthSalary: income.thirteenthSalary?.toString() ?? "",
      fourteenthSalary: income.fourteenthSalary?.toString() ?? "",
      annualBonus: income.annualBonus?.toString() ?? "",
      taxRate: income.taxRate?.toString() ?? "",
      taxFrequency: income.taxFrequency ?? "",
      taxSetAside: income.taxSetAside?.toString() ?? "",
      memberId: income.memberId ?? "",
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
      const payload = {
        employmentType: form.employmentType,
        netMonthly: Number(form.netMonthly) || 0,
        grossAnnual: Number(form.grossAnnual) || 0,
        monthlyPaymentsCount: Number(form.monthlyPaymentsCount) || 12,
        thirteenthSalary: showThirteenth
          ? num(form.thirteenthSalary)
          : undefined,
        fourteenthSalary: showFourteenth
          ? num(form.fourteenthSalary)
          : undefined,
        annualBonus: num(form.annualBonus),
        taxRate: showTax ? num(form.taxRate) : undefined,
        taxFrequency:
          showTax && form.taxFrequency ? form.taxFrequency : undefined,
        taxSetAside: showTax ? num(form.taxSetAside) : undefined,
        memberId: isFamily && form.memberId ? form.memberId : undefined,
      };

      if (editingId) {
        await incomeApi.updateIncome(editingId, payload);
      } else {
        await incomeApi.createIncome(payload);
      }
      resetForm();
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await incomeApi.deleteIncome(id);
    if (editingId === id) resetForm();
    reload();
  };

  return (
    <>
      <div className="card">
        <h2>{editingId ? "Modifica reddito" : "Nuova entrata da lavoro"}</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="field">
              <span>Tipologia occupazione</span>
              <select
                value={form.employmentType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    employmentType: e.target.value as EmploymentType,
                  })
                }
              >
                {Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Reddito netto mensile</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.netMonthly}
                onChange={(e) =>
                  setForm({ ...form, netMonthly: e.target.value })
                }
                required
              />
            </label>
            <label className="field">
              <span>Reddito lordo annuale</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.grossAnnual}
                onChange={(e) =>
                  setForm({ ...form, grossAnnual: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Numero mensilità annue</span>
              <input
                type="number"
                min={1}
                max={14}
                step="1"
                value={form.monthlyPaymentsCount}
                onChange={(e) =>
                  setForm({ ...form, monthlyPaymentsCount: e.target.value })
                }
              />
            </label>
          </div>

          <div className="form-row">
            {showThirteenth && (
              <label className="field">
                <span>Tredicesima ({symbol})</span>
                <input
                  type="number"
                  min={0}
                  value={form.thirteenthSalary}
                  onChange={(e) =>
                    setForm({ ...form, thirteenthSalary: e.target.value })
                  }
                />
              </label>
            )}
            {showFourteenth && (
              <label className="field">
                <span>Quattordicesima ({symbol})</span>
                <input
                  type="number"
                  min={0}
                  value={form.fourteenthSalary}
                  onChange={(e) =>
                    setForm({ ...form, fourteenthSalary: e.target.value })
                  }
                />
              </label>
            )}
            <label className="field">
              <span>Bonus annuali ({symbol})</span>
              <input
                type="number"
                min={0}
                value={form.annualBonus}
                onChange={(e) =>
                  setForm({ ...form, annualBonus: e.target.value })
                }
              />
            </label>
          </div>

          {showTax && (
            <div className="form-row">
              <label className="field">
                <span>% tassazione</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.taxRate}
                  onChange={(e) =>
                    setForm({ ...form, taxRate: e.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Frequenza pagamento tasse</span>
                <select
                  value={form.taxFrequency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      taxFrequency: e.target.value as TaxFrequency,
                    })
                  }
                >
                  <option value="">-</option>
                  <option value="MONTHLY">Mensile</option>
                  <option value="QUARTERLY">Trimestrale</option>
                  <option value="YEARLY">Annuale</option>
                </select>
              </label>
              <label className="field">
                <span>Importo accantonato ({symbol})</span>
                <input
                  type="number"
                  min={0}
                  value={form.taxSetAside}
                  onChange={(e) =>
                    setForm({ ...form, taxSetAside: e.target.value })
                  }
                />
              </label>
            </div>
          )}

          {isFamily && (
            <label className="field">
              <span>Imputa a</span>
              <select
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              >
                <option value="">Nucleo familiare (generica)</option>
                {familyMembers
                  ?.filter((m) => m.producesIncome)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </option>
                  ))}
              </select>
            </label>
          )}

          <div className="list-item__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {editingId ? "Salva modifiche" : "Aggiungi entrata"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={resetForm}
              >
                Annulla
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Entrate registrate</h2>
        {loading && <p className="page__hint">Caricamento…</p>}
        {error && <p className="form__error">{error}</p>}
        {incomes && incomes.length === 0 && (
          <p className="empty-state">Nessuna entrata registrata.</p>
        )}
        <div className="list">
          {incomes?.map((income) => (
            <div className="list-item-group" key={income.id}>
              <div className="list-item">
                <div className="list-item__main">
                  <span className="list-item__title">
                    {EMPLOYMENT_LABELS[income.employmentType]}
                  </span>
                  <span className="list-item__meta">
                    Netto {format(income.netMonthly)}/mese · Lordo{" "}
                    {format(income.grossAnnual)}/anno ·{" "}
                    {income.monthlyPaymentsCount} mensilità
                    {income.taxRate ? ` · Tasse ${income.taxRate}%` : ""}
                    {income.memberId &&
                      ` · ${familyMembers?.find((m) => m.id === income.memberId)?.firstName ?? "membro"}`}
                  </span>
                </div>
                <div className="list-item__actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() =>
                      setHistoryOpenId(
                        historyOpenId === income.id ? null : income.id,
                      )
                    }
                  >
                    Storico
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => startEdit(income)}
                  >
                    Modifica
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => handleDelete(income.id)}
                  >
                    Elimina
                  </button>
                </div>
              </div>
              {historyOpenId === income.id && (
                <IncomeHistory incomeId={income.id} />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
