import { useState, type FormEvent } from "react";

import * as authApi from "@/api/auth.api";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const result = await authApi.changePassword(currentPassword, newPassword);
      setInfo(result.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Si è verificato un errore, riprova.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Cambia password</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="field">
            <span>Password attuale</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <label className="field">
            <span>Nuova password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
        </div>

        {error && <p className="form__error">{error}</p>}

        <div className="list-item__actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            Aggiorna password
          </button>
          {info && <span className="page__hint">{info}</span>}
        </div>
      </form>
    </div>
  );
}
