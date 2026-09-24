import * as profileService from "../services/profile.service.js";
import {
  updateProfileSchema,
  familyMemberSchema,
  updateFamilyMemberSchema,
  housingSchema,
  passiveIncomeSchema,
  updatePassiveIncomeSchema,
} from "../validators/profile.schema.js";
import { asyncHandler } from "../utils/httpError.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json(await profileService.getFullProfile(req.user.id));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = updateProfileSchema.parse(req.body);
  res.json(await profileService.updateUser(req.user.id, data));
});

export const listFamilyMembers = asyncHandler(async (req, res) => {
  res.json(await profileService.listFamilyMembers(req.user.id));
});

export const createFamilyMember = asyncHandler(async (req, res) => {
  const data = familyMemberSchema.parse(req.body);
  res
    .status(201)
    .json(await profileService.createFamilyMember(req.user.id, data));
});

export const updateFamilyMember = asyncHandler(async (req, res) => {
  const data = updateFamilyMemberSchema.parse(req.body);
  res.json(
    await profileService.updateFamilyMember(req.user.id, req.params.id, data),
  );
});

export const deleteFamilyMember = asyncHandler(async (req, res) => {
  await profileService.deleteFamilyMember(req.user.id, req.params.id);
  res.status(204).send();
});

export const getHousing = asyncHandler(async (req, res) => {
  res.json(await profileService.getHousing(req.user.id));
});

export const upsertHousing = asyncHandler(async (req, res) => {
  const data = housingSchema.parse(req.body);
  res.json(await profileService.upsertHousing(req.user.id, data));
});

export const listPassiveIncomes = asyncHandler(async (req, res) => {
  res.json(await profileService.listPassiveIncomes(req.user.id));
});

export const createPassiveIncome = asyncHandler(async (req, res) => {
  const data = passiveIncomeSchema.parse(req.body);
  res
    .status(201)
    .json(await profileService.createPassiveIncome(req.user.id, data));
});

export const updatePassiveIncome = asyncHandler(async (req, res) => {
  const data = updatePassiveIncomeSchema.parse(req.body);
  res.json(
    await profileService.updatePassiveIncome(req.user.id, req.params.id, data),
  );
});

export const deletePassiveIncome = asyncHandler(async (req, res) => {
  await profileService.deletePassiveIncome(req.user.id, req.params.id);
  res.status(204).send();
});
