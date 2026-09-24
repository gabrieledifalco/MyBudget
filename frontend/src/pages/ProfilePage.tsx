import { ChangePasswordForm } from "@/features/profile/ChangePasswordForm";
import { FamilyMembersManager } from "@/features/profile/FamilyMembersManager";
import { HousingForm } from "@/features/profile/HousingForm";
import { PassiveIncomeManager } from "@/features/profile/PassiveIncomeManager";
import { ProfileBasicForm } from "@/features/profile/ProfileBasicForm";
import { CurrencyPreferenceForm } from "@/features/settings/CurrencyPreferenceForm";

export function ProfilePage() {
  return (
    <section className="page">
      <h1>Profilo finanziario</h1>
      <ProfileBasicForm />
      <CurrencyPreferenceForm />
      <ChangePasswordForm />
      <FamilyMembersManager />
      <HousingForm />
      <PassiveIncomeManager />
    </section>
  );
}
