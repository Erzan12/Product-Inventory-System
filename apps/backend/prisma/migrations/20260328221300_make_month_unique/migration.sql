/*
  Warnings:

  - A unique constraint covering the columns `[month]` on the table `InventorySnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InventorySnapshot_month_key" ON "InventorySnapshot"("month");
