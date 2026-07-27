-- CreateTable
CREATE TABLE "finance_rates" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stampDutyPercent" DOUBLE PRECISION NOT NULL,
    "regPercent" DOUBLE PRECISION NOT NULL,
    "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "finance_rates_state_key" ON "finance_rates"("state");
