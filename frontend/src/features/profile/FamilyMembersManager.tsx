import { useState, type FormEvent } from "react";

import * as profileApi from "@/api/profile.api";
import { useFetch } from "@/hooks/useFetch";
import type { FamilyMember, FamilyRole } from "@/types/domain";

const ROLE_LABELS: Record<FamilyRole, string> = {
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
  const {
    data: members,
    loading,
    error,
    reload,
  } = useFetch(profileApi.listFamilyMembers, []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      <div className="list">
        {members?.map((member) => (
          <div className="list-item" key={member.id}>
            <div className="list-item__main">
              <span className="list-item__title">
                {member.firstName} {member.lastName}
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
        ))}
      </div>
    </div>
  );
}
