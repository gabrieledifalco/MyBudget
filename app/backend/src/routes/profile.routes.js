import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import * as profileController from "../controllers/profile.controller.js";

// Profilo finanziario, nucleo familiare, abitazione, rendite
export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get("/", profileController.getProfile);
profileRouter.patch("/", profileController.updateProfile);
profileRouter.post(
  "/onboarding/complete",
  profileController.completeOnboarding,
);

profileRouter.get("/family-members", profileController.listFamilyMembers);
profileRouter.post("/family-members", profileController.createFamilyMember);
profileRouter.patch(
  "/family-members/reorder",
  profileController.reorderFamilyMembers,
);
profileRouter.patch(
  "/family-members/:id",
  profileController.updateFamilyMember,
);
profileRouter.delete(
  "/family-members/:id",
  profileController.deleteFamilyMember,
);

profileRouter.get("/housing", profileController.getHousing);
profileRouter.put("/housing", profileController.upsertHousing);

profileRouter.get("/passive-incomes", profileController.listPassiveIncomes);
profileRouter.post("/passive-incomes", profileController.createPassiveIncome);
profileRouter.patch(
  "/passive-incomes/:id",
  profileController.updatePassiveIncome,
);
profileRouter.delete(
  "/passive-incomes/:id",
  profileController.deletePassiveIncome,
);
