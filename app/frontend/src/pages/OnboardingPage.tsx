import { Navigate } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";

export function OnboardingPage() {
  const { user } = useAuth();

  if (user?.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return <OnboardingWizard />;
}
