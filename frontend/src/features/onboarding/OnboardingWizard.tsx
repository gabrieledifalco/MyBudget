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

const STEP_LABELS: Record<Step, string> = {
  profile: "Tipologia profilo",
  family: "Nucleo familiare",
  income: "Profilazione reddituale",
  housing: "Situazione abitativa",
  passive: "Entrate passive",
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
    <section className="page page--auth">
      <div className="card card--onboarding">
        <p className="page__hint">
          Passo {stepIndex + 1} di {steps.length} · {STEP_LABELS[step]}
        </p>
        <h1>Completa il tuo profilo</h1>
        <p className="page__hint">
          Prima di accedere alla Dashboard raccogliamo qualche informazione per
          personalizzare l'analisi finanziaria.
        </p>

        {step === "profile" && (
          <div className="card">
            <h2>Che tipo di profilo vuoi gestire?</h2>
            <div className="form-row">
              <label className="field">
                <span>Tipologia profilo</span>
                <select
                  value={profileType}
                  onChange={(e) =>
                    handleProfileTypeChange(e.target.value as ProfileType)
                  }
                >
                  <option value="INDIVIDUAL">Individuale</option>
                  <option value="FAMILY">Familiare</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {step === "family" && <FamilyMembersManager />}
        {step === "income" && <IncomeManager />}
        {step === "housing" && <HousingForm />}
        {step === "passive" && <PassiveIncomeManager />}

        <div className="list-item__actions" style={{ marginTop: 16 }}>
          {stepIndex > 0 && (
            <button type="button" className="btn btn--ghost" onClick={goBack}>
              Indietro
            </button>
          )}
          {!isLastStep && (
            <button type="button" className="btn btn--primary" onClick={goNext}>
              Avanti
            </button>
          )}
          {isLastStep && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleFinish}
              disabled={completing}
            >
              Vai alla Dashboard
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
