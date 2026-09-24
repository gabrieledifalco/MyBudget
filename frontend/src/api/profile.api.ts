import { api } from "./client";
import type { User } from "@/types/auth";
import type {
  FamilyMember,
  FullProfile,
  Housing,
  PassiveIncome,
} from "@/types/domain";

export async function getProfile(): Promise<FullProfile> {
  const { data } = await api.get<FullProfile>("/profile");
  return data;
}

export async function updateProfile(
  payload: Partial<Pick<User, "firstName" | "lastName" | "profileType">>,
): Promise<User> {
  const { data } = await api.patch<User>("/profile", payload);
  return data;
}

export async function completeOnboarding(): Promise<User> {
  const { data } = await api.post<User>("/profile/onboarding/complete");
  return data;
}

export async function listFamilyMembers(): Promise<FamilyMember[]> {
  const { data } = await api.get<FamilyMember[]>("/profile/family-members");
  return data;
}

export async function createFamilyMember(
  payload: Omit<FamilyMember, "id">,
): Promise<FamilyMember> {
  const { data } = await api.post<FamilyMember>(
    "/profile/family-members",
    payload,
  );
  return data;
}

export async function updateFamilyMember(
  id: string,
  payload: Partial<Omit<FamilyMember, "id">>,
): Promise<FamilyMember> {
  const { data } = await api.patch<FamilyMember>(
    `/profile/family-members/${id}`,
    payload,
  );
  return data;
}

export async function deleteFamilyMember(id: string): Promise<void> {
  await api.delete(`/profile/family-members/${id}`);
}

export async function getHousing(): Promise<Housing | null> {
  const { data } = await api.get<Housing | null>("/profile/housing");
  return data;
}

export async function upsertHousing(
  payload: Omit<Housing, "id">,
): Promise<Housing> {
  const { data } = await api.put<Housing>("/profile/housing", payload);
  return data;
}

export async function listPassiveIncomes(): Promise<PassiveIncome[]> {
  const { data } = await api.get<PassiveIncome[]>("/profile/passive-incomes");
  return data;
}

export async function createPassiveIncome(
  payload: Omit<PassiveIncome, "id">,
): Promise<PassiveIncome> {
  const { data } = await api.post<PassiveIncome>(
    "/profile/passive-incomes",
    payload,
  );
  return data;
}

export async function updatePassiveIncome(
  id: string,
  payload: Partial<Omit<PassiveIncome, "id">>,
): Promise<PassiveIncome> {
  const { data } = await api.patch<PassiveIncome>(
    `/profile/passive-incomes/${id}`,
    payload,
  );
  return data;
}

export async function deletePassiveIncome(id: string): Promise<void> {
  await api.delete(`/profile/passive-incomes/${id}`);
}
