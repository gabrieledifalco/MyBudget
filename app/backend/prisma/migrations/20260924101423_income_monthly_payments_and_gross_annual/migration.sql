/*
  Warnings:

  - You are about to drop the column `grossMonthly` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `grossMonthly` on the `IncomeHistory` table. All the data in the column will be lost.
  - Added the required column `grossAnnual` to the `IncomeHistory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Income" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "netMonthly" REAL NOT NULL DEFAULT 0,
    "grossAnnual" REAL NOT NULL DEFAULT 0,
    "monthlyPaymentsCount" INTEGER NOT NULL DEFAULT 12,
    "thirteenthSalary" REAL,
    "fourteenthSalary" REAL,
    "annualBonus" REAL,
    "taxRate" REAL,
    "taxFrequency" TEXT,
    "taxSetAside" REAL,
    "memberId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Income" ("annualBonus", "createdAt", "employmentType", "fourteenthSalary", "id", "memberId", "netMonthly", "taxFrequency", "taxRate", "taxSetAside", "thirteenthSalary", "updatedAt", "userId") SELECT "annualBonus", "createdAt", "employmentType", "fourteenthSalary", "id", "memberId", "netMonthly", "taxFrequency", "taxRate", "taxSetAside", "thirteenthSalary", "updatedAt", "userId" FROM "Income";
DROP TABLE "Income";
ALTER TABLE "new_Income" RENAME TO "Income";
CREATE INDEX "Income_userId_idx" ON "Income"("userId");
CREATE TABLE "new_IncomeHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incomeId" TEXT NOT NULL,
    "netMonthly" REAL NOT NULL,
    "grossAnnual" REAL NOT NULL,
    "monthlyPaymentsCount" INTEGER NOT NULL DEFAULT 12,
    "thirteenthSalary" REAL,
    "fourteenthSalary" REAL,
    "annualBonus" REAL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IncomeHistory_incomeId_fkey" FOREIGN KEY ("incomeId") REFERENCES "Income" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IncomeHistory" ("annualBonus", "fourteenthSalary", "id", "incomeId", "netMonthly", "recordedAt", "thirteenthSalary") SELECT "annualBonus", "fourteenthSalary", "id", "incomeId", "netMonthly", "recordedAt", "thirteenthSalary" FROM "IncomeHistory";
DROP TABLE "IncomeHistory";
ALTER TABLE "new_IncomeHistory" RENAME TO "IncomeHistory";
CREATE INDEX "IncomeHistory_incomeId_idx" ON "IncomeHistory"("incomeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
