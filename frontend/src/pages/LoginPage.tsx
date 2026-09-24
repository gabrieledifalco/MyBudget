import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import * as authApi from "@/api/auth.api";
import { useAuth } from "@/features/auth/AuthContext";
import type { ProfileType } from "@/types/auth";

type Mode = "login" | "register" | "forgot" | "reset";

export function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [profileType, setProfileType] = useState<ProfileType>("INDIVIDUAL");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const from =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ??
      "/dashboard";
    return <Navigate to={from} replace />;
  }

  const switchMode = (next: Mode) => {
    setError(null);
    setInfo(null);
    setMode(next);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email, password });
        navigate("/dashboard", { replace: true });
      } else if (mode === "register") {
        await register({ firstName, lastName, email, password, profileType });
        navigate("/dashboard", { replace: true });
      } else if (mode === "forgot") {
        const result = await authApi.forgotPassword(email);
        setInfo(
          result.debug_token
            ? `${result.message} Token (solo in sviluppo): ${result.debug_token}`
            : result.message,
        );
        if (result.debug_token) setResetToken(result.debug_token);
      } else {
        const result = await authApi.resetPassword(resetToken, password);
        setInfo(result.message);
        setMode("login");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Si è verificato un errore, riprova.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<Mode, string> = {
    login: "Accedi",
    register: "Crea il tuo profilo",
    forgot: "Recupera password",
    reset: "Imposta una nuova password",
  };

  return (
    <section className="page page--auth">
      <div className="card card--auth">
        <h1>{titles[mode]}</h1>
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

          {mode !== "reset" && (
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          )}

          {mode === "reset" && (
            <label className="field">
              <span>Codice ricevuto via email</span>
              <input
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </label>
          )}

          {mode !== "forgot" && (
            <label className="field">
              <span>{mode === "reset" ? "Nuova password" : "Password"}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
          )}

          {error && <p className="form__error">{error}</p>}
          {info && <p className="page__hint">{info}</p>}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            {mode === "login" && "Accedi"}
            {mode === "register" && "Registrati"}
            {mode === "forgot" && "Invia istruzioni"}
            {mode === "reset" && "Reimposta password"}
          </button>
        </form>

        {mode === "login" && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => switchMode("forgot")}
          >
            Password dimenticata?
          </button>
        )}

        {mode === "forgot" && resetToken && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => switchMode("reset")}
          >
            Ho già il codice, reimposta la password
          </button>
        )}

        {(mode === "login" || mode === "register") && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login"
              ? "Non hai un account? Registrati"
              : "Hai già un account? Accedi"}
          </button>
        )}

        {(mode === "forgot" || mode === "reset") && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => switchMode("login")}
          >
            Torna al login
          </button>
        )}
      </div>
    </section>
  );
}
