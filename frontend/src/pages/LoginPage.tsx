import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";
import type { ProfileType } from "@/types/auth";

type Mode = "login" | "register";

export function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileType, setProfileType] = useState<ProfileType>("INDIVIDUAL");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const from =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ??
      "/dashboard";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ firstName, lastName, email, password, profileType });
      }
      navigate("/dashboard", { replace: true });
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
    <section className="page page--auth">
      <div className="card card--auth">
        <h1>{mode === "login" ? "Accedi" : "Crea il tuo profilo"}</h1>
        <p className="page__hint">
          Gestisci le tue finanze personali o familiari in un unico posto.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
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
                <span>Tipologia profilo</span>
                <select
                  value={profileType}
                  onChange={(e) =>
                    setProfileType(e.target.value as ProfileType)
                  }
                >
                  <option value="INDIVIDUAL">Individuale</option>
                  <option value="FAMILY">Familiare</option>
                </select>
              </label>
            </>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          {error && <p className="form__error">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            {mode === "login" ? "Accedi" : "Registrati"}
          </button>
        </form>

        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setError(null);
            setMode(mode === "login" ? "register" : "login");
          }}
        >
          {mode === "login"
            ? "Non hai un account? Registrati"
            : "Hai già un account? Accedi"}
        </button>
      </div>
    </section>
  );
}
