/*
  Warnings:

  - You are about to drop the column `savingsGoalId` on the `Transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_savingsGoalId_fkey";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "savingsGoalId";
