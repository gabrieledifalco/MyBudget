import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { X } from "lucide-react";

import * as expenseApi from "@/api/expense.api";
import * as incomeApi from "@/api/income.api";
import * as profileApi from "@/api/profile.api";
import { useAuth } from "@/features/auth/AuthContext";
import { PersonalHabits } from "@/features/profile/PersonalHabits";
import { useFetch } from "@/hooks/useFetch";
import type {
  EmploymentType,
  FamilyMember,
  FamilyRole,
  Income,
} from "@/types/domain";

const ROLE_LABELS: Record<FamilyRole, string> = {
  SELF: "Io",
  SPOUSE: "Coniuge",
  CHILD: "Figlio",
  PARENT: "Genitore",
  OTHER: "Altro",
};

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  EMPLOYEE: "Lavoratore dipendente",
  FREELANCER: "Libero professionista",
  VAT: "Partita IVA",
  RETIRED: "Pensionato",
  OTHER: "Altro",
};

const emptyForm = {
  firstName: "",
  lastName: "",
  role: "" as FamilyRole | "",
  producesIncome: false,
};

const emptyIncomeForm = {
  employmentType: "EMPLOYEE" as EmploymentType,
  netMonthly: "",
  grossAnnual: "",
  monthlyPaymentsCount: "12",
};

// Popup: link existing income or create new one for a family member
interface IncomeModalProps {
  memberId: string;
  memberName: string;
  incomes: Income[];
  onClose: () => void;
  onSaved: () => void;
}

function IncomeModal({
  memberId,
  memberName,
  incomes,
  onClose,
  onSaved,
}: IncomeModalProps) {
  const unlinked = incomes.filter(
    (i) => !i.memberId || i.memberId === memberId,
  );
  const alreadyLinked = incomes.filter((i) => i.memberId === memberId);
  const [tab, setTab] = useState<"link" | "new">(
    unlinked.length > 0 ? "link" : "new",
  );
  const [selectedId, setSelectedId] = useState<string>(unlinked[0]?.id ?? "");
  const [form, setForm] = useState(emptyIncomeForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleLink = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await incomeApi.updateIncome(selectedId, { memberId });
      onSaved();
      onClose();
    } catch {
      setError("Errore durante il collegamento.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await incomeApi.createIncome({
        employmentType: form.employmentType,
        netMonthly: Number(form.netMonthly),
        grossAnnual: Number(form.grossAnnual),
        monthlyPaymentsCount: Number(form.monthlyPaymentsCount) || 12,
        memberId,
      } as Omit<Income, "id">);
      onSaved();
      onClose();
    } catch {
      setError("Errore durante la creazione.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="modal">
        <div className="modal__header">
          <div>
            <h2 className="modal__title">Reddito di {memberName}</h2>
            <p className="modal__subtitle">
              Collega o inserisci l'entrata imputata a questo membro
            </p>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm modal__close"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {alreadyLinked.length > 0 && (
          <div style={{ marginBottom: "var(--space)" }}>
            <p
              className="page__hint"
              style={{ textAlign: "left", marginBottom: 4 }}
            >
              Entrate già collegate:
            </p>
            {alreadyLinked.map((inc) => (
              <div
                key={inc.id}
                className="list-item"
                style={{ marginBottom: 4 }}
              >
                <div className="list-item__main">
                  <span className="list-item__title">
                    {EMPLOYMENT_LABELS[inc.employmentType]}
                  </span>
                  <span className="list-item__meta">
                    Netto €{inc.netMonthly}/mese · Lordo €{inc.grossAnnual}/anno
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={async () => {
                    await incomeApi.updateIncome(inc.id, {
                      memberId: undefined,
                    });
                    onSaved();
                  }}
                >
                  Scollega
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="tabs" style={{ marginBottom: "var(--space)" }}>
          <button
            type="button"
            className={`tab${tab === "link" ? " active" : ""}`}
            onClick={() => setTab("link")}
            disabled={unlinked.length === 0}
          >
            Collega esistente
          </button>
          <button
            type="button"
            className={`tab${tab === "new" ? " active" : ""}`}
            onClick={() => setTab("new")}
          >
            Crea nuova
          </button>
        </div>

        {tab === "link" && (
          <div>
            {unlinked.length === 0 ? (
              <p className="empty-state">
                Nessuna entrata disponibile da collegare.
              </p>
            ) : (
              <>
                <label className="field">
                  <span className="field__label">Entrata da collegare</span>
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    {unlinked.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        {EMPLOYMENT_LABELS[inc.employmentType]} — €
                        {inc.netMonthly}/mese
                      </option>
                    ))}
                  </select>
                </label>
                {error && <p className="form__error">{error}</p>}
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={submitting || !selectedId}
                  onClick={handleLink}
                  style={{ marginTop: "var(--space)" }}
                >
                  {submitting ? "Collegamento…" : "Collega"}
                </button>
              </>
            )}
          </div>
        )}

        {tab === "new" && (
          <form className="form" onSubmit={handleCreate}>
            <div className="form-row">
              <label className="field">
                <span className="field__label">Tipo impiego</span>
                <select
                  value={form.employmentType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employmentType: e.target.value as EmploymentType,
                    })
                  }
                >
                  {Object.entries(EMPLOYMENT_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">Netto mensile (€)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="2000"
                  value={form.netMonthly}
                  onChange={(e) =>
                    setForm({ ...form, netMonthly: e.target.value })
                  }
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span className="field__label">Lordo annuo (€)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="32000"
                  value={form.grossAnnual}
                  onChange={(e) =>
                    setForm({ ...form, grossAnnual: e.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">N° mensilità</span>
                <select
                  value={form.monthlyPaymentsCount}
                  onChange={(e) =>
                    setForm({ ...form, monthlyPaymentsCount: e.target.value })
                  }
                >
                  {[12, 13, 14].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && <p className="form__error">{error}</p>}
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? "Salvataggio…" : "Crea entrata"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function FamilyMembersManager() {
  const { user } = useAuth();
  const {
    data: members,
    loading,
    error,
    reload,
  } = useFetch(profileApi.listFamilyMembers, []);
  const { data: incomes, reload: reloadIncomes } = useFetch(
    incomeApi.listIncomes,
    [],
  );
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoAddAttempted, setAutoAddAttempted] = useState(false);
  const [orderedMembers, setOrderedMembers] = useState<FamilyMember[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [habitsOpenId, setHabitsOpenId] = useState<string | null>(null);
  const [incomeModalMember, setIncomeModalMember] =
    useState<FamilyMember | null>(null);
  const { data: categories } = useFetch(expenseApi.listCategories, []);
  const { data: expenses, reload: reloadExpenses } = useFetch(
    expenseApi.listExpenses,
    [],
  );

  useEffect(() => {
    if (members) setOrderedMembers(members);
  }, [members]);

  // Auto-add the registering user as first SELF member
  useEffect(() => {
    if (!user || !members || loading || autoAddAttempted) return;
    if (members.length > 0) return;

    setAutoAddAttempted(true);
    profileApi
      .createFamilyMember({
        firstName: user.firstName,
        lastName: user.lastName,
        role: "SELF",
        producesIncome: true,
      })
      .then(() => reload());
  }, [user, members, loading, autoAddAttempted, reload]);

  // Pre-fill form with user data when SELF is selected
  const handleRoleChange = (role: FamilyRole) => {
    if (role === "SELF" && user && !editingId) {
      setForm((f) => ({
        ...f,
        role,
        firstName: user.firstName,
        lastName: user.lastName,
      }));
    } else {
      setForm((f) => ({ ...f, role }));
    }
  };

  const startEdit = (member: FamilyMember) => {
    setEditingId(member.id);
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      producesIncome: member.producesIncome,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.role) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await profileApi.updateFamilyMember(editingId, {
          ...form,
          role: form.role,
        });
      } else {
        await profileApi.createFamilyMember({ ...form, role: form.role });
      }
      resetForm();
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleProducesIncomeChange = (checked: boolean) => {
    setForm((f) => ({ ...f, producesIncome: checked }));
  };

  const handleDelete = async (id: string) => {
    await profileApi.deleteFamilyMember(id);
    if (editingId === id) resetForm();
    reload();
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const current = [...orderedMembers];
    const fromIndex = current.findIndex((m) => m.id === draggedId);
    const toIndex = current.findIndex((m) => m.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setOrderedMembers(current);
    setDraggedId(null);
    profileApi
      .reorderFamilyMembers(current.map((m) => m.id))
      .then(() => reload());
  };

  return (
    <div className="card">
      <h2>Nucleo familiare</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="field">
            <span>Nome</span>
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Cognome</span>
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Ruolo</span>
            <select
              value={form.role}
              onChange={(e) => handleRoleChange(e.target.value as FamilyRole)}
              required
            >
              <option value="" disabled>
                Seleziona un ruolo
              </option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={form.producesIncome}
            onChange={(e) => handleProducesIncomeChange(e.target.checked)}
          />
          <span>Produce reddito</span>
        </label>

        <div className="list-item__actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            {editingId ? "Salva modifiche" : "Aggiungi membro"}
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

      {loading && <p className="page__hint">Caricamento…</p>}
      {error && <p className="form__error">{error}</p>}
      {members && members.length === 0 && (
        <p className="empty-state">Nessun membro registrato.</p>
      )}
      {members && members.length > 1 && (
        <p className="page__hint">Trascina i membri per riordinarli.</p>
      )}
      <div className="list">
        {orderedMembers.map((member) => (
          <div className="list-item-group" key={member.id}>
            <div
              className="list-item"
              draggable
              onDragStart={() => setDraggedId(member.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(member.id)}
              style={{ cursor: "grab" }}
            >
              <div className="list-item__main">
                <span className="list-item__title">
                  ⋮⋮ {member.firstName} {member.lastName}
                </span>
                <span className="list-item__meta">
                  {ROLE_LABELS[member.role]}
                  {member.producesIncome ? " · Produce reddito" : ""}
                  {incomes &&
                  incomes.filter((i) => i.memberId === member.id).length > 0
                    ? ` · ${incomes.filter((i) => i.memberId === member.id).length} entrata/e collegate`
                    : ""}
                </span>
              </div>
              <div className="list-item__actions">
                {member.producesIncome && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setIncomeModalMember(member)}
                  >
                    Entrate
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() =>
                    setHabitsOpenId(
                      habitsOpenId === member.id ? null : member.id,
                    )
                  }
                >
                  Spese personali
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => startEdit(member)}
                >
                  Modifica
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(member.id)}
                >
                  Rimuovi
                </button>
              </div>
            </div>
            {habitsOpenId === member.id && categories && expenses && (
              <PersonalHabits
                memberId={member.id}
                categories={categories}
                expenses={expenses}
                onChange={reloadExpenses}
              />
            )}
          </div>
        ))}
      </div>

      {incomeModalMember && incomes && (
        <IncomeModal
          memberId={incomeModalMember.id}
          memberName={`${incomeModalMember.firstName} ${incomeModalMember.lastName}`}
          incomes={incomes}
          onClose={() => setIncomeModalMember(null)}
          onSaved={() => {
            reloadIncomes();
            reload();
          }}
        />
      )}
    </div>
  );
}
