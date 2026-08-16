-- CreateTable
CREATE TABLE "UsageCounter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UsageCounter_pkey" PRIMARY KEY ("id")
);
