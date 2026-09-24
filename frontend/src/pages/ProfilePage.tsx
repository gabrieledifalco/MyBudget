import { FamilyMembersManager } from "@/features/profile/FamilyMembersManager";
import { HousingForm } from "@/features/profile/HousingForm";
import { PassiveIncomeManager } from "@/features/profile/PassiveIncomeManager";
import { ProfileBasicForm } from "@/features/profile/ProfileBasicForm";

export function ProfilePage() {
  return (
    <section className="page">
      <h1>Profilo finanziario</h1>
      <ProfileBasicForm />
      <FamilyMembersManager />
      <HousingForm />
      <PassiveIncomeManager />
    </section>
  );
}
