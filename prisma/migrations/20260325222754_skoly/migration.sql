-- CreateTable
CREATE TABLE "SchoolInquiry" (
    "id" SERIAL NOT NULL,
    "meno" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "skola" TEXT NOT NULL,
    "funkcia" TEXT NOT NULL,
    "zaujem" TEXT NOT NULL,
    "poznamka" TEXT,
    "vybavene" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolInquiry_pkey" PRIMARY KEY ("id")
);
