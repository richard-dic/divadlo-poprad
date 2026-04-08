/*
  Warnings:

  - Added the required column `obsah` to the `DivadelnaInscenacia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DivadelnaInscenacia" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "credits" TEXT,
ADD COLUMN     "galleryImages" TEXT[],
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "obsah" TEXT NOT NULL,
ADD COLUMN     "trailerUrl" TEXT;
