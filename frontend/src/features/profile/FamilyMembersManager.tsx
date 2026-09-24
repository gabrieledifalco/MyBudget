import { useEffect, useState, type DragEvent, type FormEvent } from "react";

import * as expenseApi from "@/api/expense.api";
import * as profileApi from "@/api/profile.api";
import { useAuth } from "@/features/auth/AuthContext";
import { PersonalHabits } from "@/features/profile/PersonalHabits";
import { useFetch } from "@/hooks/useFetch";
import type { FamilyMember, FamilyRole } from "@/types/domain";

const ROLE_LABELS: Record<FamilyRole, string> = {
  SELF: "Io",
  SPOUSE: "Coniuge",
  CHILD: "Figlio",
  PARENT: "Genitore",
  OTHER: "Altro",
};

const emptyForm = {
  firstName: "",
  lastName: "",
  role: "SPOUSE" as FamilyRole,
  producesIncome: false,
};

export function FamilyMembersManager() {
  const { user } = useAuth();
  const {
    data: members,
    loading,
    error,
    reload,
  } = useFetch(profileApi.listFamilyMembers, []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoAddAttempted, setAutoAddAttempted] = useState(false);
  const [autoAdded, setAutoAdded] = useState(false);
  const [orderedMembers, setOrderedMembers] = useState<FamilyMember[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [habitsOpenId, setHabitsOpenId] = useState<string | null>(null);
  const { data: categories } = useFetch(expenseApi.listCategories, []);
  const { data: expenses, reload: reloadExpenses } = useFetch(
    expenseApi.listExpenses,
    [],
  );

  useEffect(() => {
    if (members) setOrderedMembers(members);
  }, [members]);

  // Il primo membro del nucleo è sempre chi si è registrato: lo aggiungiamo in
  // automatico usando i dati raccolti in fase di registrazione, senza chiedere
  // conferma (è palese che sia lui/lei ad aver installato l'app).
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
      .then(() => {
        setAutoAdded(true);
        reload();
      });
  }, [user, members, loading, autoAddAttempted, reload]);

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
    setSubmitting(true);
    try {
      if (editingId) {
        await profileApi.updateFamilyMember(editingId, form);
      } else {
        await profileApi.createFamilyMember(form);
      }
      resetForm();
      reload();
    } finally {
      setSubmitting(false);
    }
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
      {autoAdded && user && (
        <p className="page__hint">
          Ti abbiamo aggiunto automaticamente come primo membro del nucleo
          familiare ({user.firstName} {user.lastName}), usando i dati della tua
          registrazione. Puoi modificarne il ruolo o rimuoverlo qui sotto.
        </p>
      )}
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
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as FamilyRole })
              }
            >
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
            onChange={(e) =>
              setForm({ ...form, producesIncome: e.target.checked })
            }
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
                  {ROLE_LABELS[member.role]}{" "}
                  {member.producesIncome ? "· Produce reddito" : ""}
                </span>
              </div>
              <div className="list-item__actions">
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
    </div>
  );
}
