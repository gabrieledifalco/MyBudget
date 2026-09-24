import { prisma } from "../config/prisma.js";
import { httpError } from "../utils/httpError.js";

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function getFullProfile(userId) {
  const [user, familyMembers, housing, passiveIncomes] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.familyMember.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    }),
    prisma.housing.findUnique({ where: { userId } }),
    prisma.passiveIncome.findMany({ where: { userId } }),
  ]);

  if (!user) throw httpError(404, "Utente non trovato");

  return { user: publicUser(user), familyMembers, housing, passiveIncomes };
}

export async function updateUser(userId, data) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return publicUser(user);
}

export async function completeOnboarding(userId) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { onboardingComplete: true },
  });
  return publicUser(user);
}

export function listFamilyMembers(userId) {
  return prisma.familyMember.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });
}

export async function createFamilyMember(userId, data) {
  const last = await prisma.familyMember.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
  });
  return prisma.familyMember.create({
    data: { ...data, userId, order: (last?.order ?? -1) + 1 },
  });
}

export async function reorderFamilyMembers(userId, orderedIds) {
  const members = await prisma.familyMember.findMany({ where: { userId } });
  const ownedIds = new Set(members.map((m) => m.id));
  if (
    orderedIds.length !== members.length ||
    !orderedIds.every((id) => ownedIds.has(id))
  ) {
    throw httpError(400, "L'elenco dei membri non è valido");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.familyMember.update({ where: { id }, data: { order: index } }),
    ),
  );

  return listFamilyMembers(userId);
}

async function findOwnedFamilyMember(userId, id) {
  const member = await prisma.familyMember.findFirst({ where: { id, userId } });
  if (!member) throw httpError(404, "Membro della famiglia non trovato");
  return member;
}

export async function updateFamilyMember(userId, id, data) {
  await findOwnedFamilyMember(userId, id);
  return prisma.familyMember.update({ where: { id }, data });
}

export async function deleteFamilyMember(userId, id) {
  await findOwnedFamilyMember(userId, id);
  await prisma.familyMember.delete({ where: { id } });
}

export function getHousing(userId) {
  return prisma.housing.findUnique({ where: { userId } });
}

export function upsertHousing(userId, data) {
  return prisma.housing.upsert({
    where: { userId },
    update: data,
    create: { ...data, userId },
  });
}

export function listPassiveIncomes(userId) {
  return prisma.passiveIncome.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export function createPassiveIncome(userId, data) {
  return prisma.passiveIncome.create({ data: { ...data, userId } });
}

async function findOwnedPassiveIncome(userId, id) {
  const item = await prisma.passiveIncome.findFirst({ where: { id, userId } });
  if (!item) throw httpError(404, "Rendita non trovata");
  return item;
}

export async function updatePassiveIncome(userId, id, data) {
  await findOwnedPassiveIncome(userId, id);
  return prisma.passiveIncome.update({ where: { id }, data });
}

export async function deletePassiveIncome(userId, id) {
  await findOwnedPassiveIncome(userId, id);
  await prisma.passiveIncome.delete({ where: { id } });
}
