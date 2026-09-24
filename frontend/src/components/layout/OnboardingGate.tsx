import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";

/** README: "L'utente non può accedere alla Dashboard senza aver completato la profilazione." */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
