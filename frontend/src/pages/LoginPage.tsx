import { AlertCircle, ArrowLeft, CheckCircle, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import * as authApi from "@/api/auth.api";
import { useAuth } from "@/features/auth/AuthContext";
import type { ProfileType } from "@/types/auth";

type Mode = "login" | "register" | "forgot" | "reset";

const TITLES: Record<Mode, string> = {
  login: "Accedi",
  register: "Crea il tuo account",
  forgot: "Recupera password",
  reset: "Nuova password",
};

const SUBTITLES: Record<Mode, string> = {
  login: "Accedi per gestire le tue finanze",
  register: "Inizia a tenere sotto controllo le tue finanze",
  forgot: "Ti invieremo le istruzioni via email",
  reset: "Scegli una nuova password sicura",
};

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
  const [profileType] = useState<ProfileType>("INDIVIDUAL");
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
        navigate("/onboarding", { replace: true });
      } else if (mode === "forgot") {
        const result = await authApi.forgotPassword(email);
        setInfo(
          result.debug_token
            ? `Istruzioni inviate. Token di sviluppo: ${result.debug_token}`
            : result.message,
        );
        if (result.debug_token) setResetToken(result.debug_token);
      } else {
        await authApi.resetPassword(resetToken, password);
        setInfo("Password aggiornata con successo.");
        setTimeout(() => switchMode("login"), 1500);
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

  return (
    <div className="page--auth">
      {/* Panel sinistra: form */}
      <div className="auth-panel">
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-card__logo">
            <div className="auth-card__logo-icon">
              <Wallet size={22} />
            </div>
            <div className="auth-card__logo-text">
              My<span>Budget</span>
            </div>
          </div>

          {/* Back button per forgot/reset */}
          {(mode === "forgot" || mode === "reset") && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              style={{ marginBottom: "var(--space)" }}
              onClick={() => switchMode("login")}
            >
              <ArrowLeft size={14} />
              Torna al login
            </button>
          )}

          <h1 className="auth-card__title">{TITLES[mode]}</h1>
          <p className="auth-card__subtitle">{SUBTITLES[mode]}</p>

          <form className="form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="form-row">
                <label className="field">
                  <span className="field__label">Nome</span>
                  <input
                    placeholder="Mario"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Cognome</span>
                  <input
                    placeholder="Rossi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </label>
              </div>
            )}

            {mode === "reset" && (
              <label className="field">
                <span className="field__label">Codice di reset</span>
                <input
                  placeholder="Incolla il codice ricevuto"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </label>
            )}

            {mode !== "reset" && (
              <label className="field">
                <span className="field__label">Email</span>
                <input
                  type="email"
                  placeholder="mario.rossi@email.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            )}

            {mode !== "forgot" && (
              <label className="field">
                <span className="field__label">
                  {mode === "reset" ? "Nuova password" : "Password"}
                </span>
                <input
                  type="password"
                  placeholder={
                    mode === "register" ? "Almeno 8 caratteri" : "••••••••"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
            )}

            {mode === "login" && (
              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ border: "none", padding: "0" }}
                  onClick={() => switchMode("forgot")}
                >
                  Password dimenticata?
                </button>
              </div>
            )}

            {error && (
              <p className="form__error">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            {info && (
              <p className="form__info">
                <CheckCircle size={14} />
                {info}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={submitting}
            >
              {submitting ? (
                "Caricamento..."
              ) : (
                <>
                  {mode === "login" && "Accedi"}
                  {mode === "register" && "Crea account"}
                  {mode === "forgot" && "Invia istruzioni"}
                  {mode === "reset" && "Aggiorna password"}
                </>
              )}
            </button>
          </form>

          {/* Switch login/register */}
          {(mode === "login" || mode === "register") && (
            <div className="auth-switch">
              {mode === "login"
                ? "Non hai un account? "
                : "Hai già un account? "}
              <button
                type="button"
                onClick={() =>
                  switchMode(mode === "login" ? "register" : "login")
                }
              >
                {mode === "login" ? "Registrati" : "Accedi"}
              </button>
            </div>
          )}

          {/* Link reset se ho già il token */}
          {mode === "forgot" && resetToken && (
            <div className="auth-switch">
              <button type="button" onClick={() => switchMode("reset")}>
                Ho già il codice → reimposta password
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Panel destra: hero (solo desktop) */}
      <div className="auth-hero">
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 360,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, var(--accent), #818cf8)",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-lg)",
            }}
          >
            <Wallet size={36} color="#fff" />
          </div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "var(--space-sm)",
            }}
          >
            Le tue finanze,
            <br />
            sempre sotto controllo
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            Dashboard intuitiva · Analisi automatica · Simulatore di risparmio
          </p>

          {/* Feature bullets */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
              marginTop: "var(--space-xl)",
              textAlign: "left",
            }}
          >
            {[
              "Monitora entrate e uscite in tempo reale",
              "Scopri quanto potresti risparmiare",
              "Financial Health Score personalizzato",
            ].map((feat) => (
              <div
                key={feat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  fontSize: 14,
                  color: "var(--text-subtle)",
                }}
              >
                <CheckCircle size={16} color="var(--income)" />
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
