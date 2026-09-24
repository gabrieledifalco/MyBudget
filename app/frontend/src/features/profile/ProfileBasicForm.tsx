import { useEffect, useState, type FormEvent } from "react";

import * as profileApi from "@/api/profile.api";
import { useAuth } from "@/features/auth/AuthContext";
import type { ProfileType } from "@/types/auth";

export function ProfileBasicForm() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [profileType, setProfileType] = useState<ProfileType>(
    user?.profileType ?? "INDIVIDUAL",
  );
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setProfileType(user.profileType);
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    try {
      await profileApi.updateProfile({ firstName, lastName, profileType });
      setSaved(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Dati anagrafici</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="field">
            <span>Nome</span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Cognome</span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input value={user?.email ?? ""} disabled />
          </label>
        </div>

        <label className="field">
          <span>Tipologia profilo</span>
          <select
            value={profileType}
            onChange={(e) => setProfileType(e.target.value as ProfileType)}
          >
            <option value="INDIVIDUAL">Individuale</option>
            <option value="FAMILY">Familiare</option>
          </select>
        </label>

        <div className="list-item__actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            Salva
          </button>
          {saved && <span className="page__hint">Profilo aggiornato.</span>}
        </div>
      </form>
    </div>
  );
}
