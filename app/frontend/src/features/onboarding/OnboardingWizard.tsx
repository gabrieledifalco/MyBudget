import { Home, Users, TrendingUp, PiggyBank, Wallet } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import * as profileApi from "@/api/profile.api";
import { useAuth } from "@/features/auth/AuthContext";
import { FamilyMembersManager } from "@/features/profile/FamilyMembersManager";
import { HousingForm } from "@/features/profile/HousingForm";
import { PassiveIncomeManager } from "@/features/profile/PassiveIncomeManager";
import { IncomeManager } from "@/features/income/IncomeManager";
import type { ProfileType } from "@/types/auth";

type Step = "profile" | "family" | "income" | "housing" | "passive";

const STEP_META: Record<Step, { label: string; title: string; subtitle: string; icon: React.ElementType }> = {
  profile:  { label: "Profilo",    title: "Che tipo di profilo gestisci?", subtitle: "Scegli se gestire le tue finanze personali o quelle di tutta la famiglia.", icon: Wallet },
  family:   { label: "Famiglia",   title: "Chi fa parte della tua famiglia?", subtitle: "Aggiungi i componenti del nucleo familiare.", icon: Users },
  income:   { label: "Entrate",    title: "Quali sono le tue entrate?", subtitle: "Inserisci stipendi, redditi e altre fonti di entrata.", icon: TrendingUp },
  housing:  { label: "Abitazione", title: "Come è la tua situazione abitativa?", subtitle: "Casa di proprietà, mutuo o affitto.", icon: Home },
  passive:  { label: "Rendite",    title: "Hai entrate passive?", subtitle: "Affitti, investimenti, pensioni e altre rendite.", icon: PiggyBank },
};

export function OnboardingWizard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState<ProfileType>(
    user?.profileType ?? "INDIVIDUAL",
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [completing, setCompleting] = useState(false);

  const steps: Step[] =
    profileType === "FAMILY"
      ? ["profile", "family", "income", "housing", "passive"]
      : ["profile", "income", "housing", "passive"];

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const meta = STEP_META[step];
  const handleProfileTypeChange = async (value: ProfileType) => {
    setProfileType(value);
    await profileApi.updateProfile({ profileType: value });
  };

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const handleFinish = async () => {
    setCompleting(true);
    try {
      await profileApi.completeOnboarding();
      await refreshUser();
      navigate("/dashboard", { replace: true });
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="onboarding-shell">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "var(--space-xl)" }}>
        <div style={{
          width: 36,
          height: 36,
          background: "linear-gradient(135deg, var(--accent), #818cf8)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Wallet size={18} color="#fff" />
        </div>
        <span style={{ fontSize: 18, fontWeight: 700 }}>My<span style={{ color: "var(--accent)" }}>Budget</span></span>
      </div>

      <div className="onboarding-card">
        {/* Progress bar */}
        <div className="onboarding-progress">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`onboarding-progress__step${i < stepIndex ? " done" : i === stepIndex ? " active" : ""}`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-step-label">
            Passo {stepIndex + 1} di {steps.length} · {meta.label}
          </div>
          <h1 className="onboarding-title">{meta.title}</h1>
          <p className="onboarding-subtitle">{meta.subtitle}</p>
        </div>

        {/* Step content */}
        {step === "profile" && (
          <div className="profile-type-grid">
            <button
              type="button"
              className={`profile-type-card${profileType === "INDIVIDUAL" ? " selected" : ""}`}
              onClick={() => handleProfileTypeChange("INDIVIDUAL")}
            >
              <div className="profile-type-card__icon">
                <Wallet size={24} />
              </div>
              <div className="profile-type-card__title">Individuale</div>
              <div className="profile-type-card__desc">Gestisci le tue finanze personali</div>
            </button>
            <button
              type="button"
              className={`profile-type-card${profileType === "FAMILY" ? " selected" : ""}`}
              onClick={() => handleProfileTypeChange("FAMILY")}
            >
              <div className="profile-type-card__icon">
                <Users size={24} />
              </div>
              <div className="profile-type-card__title">Familiare</div>
              <div className="profile-type-card__desc">Gestisci il budget di tutta la famiglia</div>
            </button>
          </div>
        )}

        {step === "family"  && <FamilyMembersManager />}
        {step === "income"  && <IncomeManager />}
        {step === "housing" && <HousingForm />}
        {step === "passive" && <PassiveIncomeManager />}

        {/* Footer */}
        <div className={`onboarding-footer${stepIndex === 0 ? " onboarding-footer--end" : ""}`}>
          {stepIndex > 0 && (
            <button type="button" className="btn btn--ghost" onClick={goBack}>
              Indietro
            </button>
          )}
          {!isLastStep ? (
            <button type="button" className="btn btn--primary" onClick={goNext}>
              Avanti
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleFinish}
              disabled={completing}
            >
              {completing ? "Caricamento..." : "Vai alla Dashboard →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
