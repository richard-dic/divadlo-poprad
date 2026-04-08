-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('ROW_SEAT', 'TABLE_SEAT', 'CHAIR', 'CHILD_SEAT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CONTROLLER', 'SELLER_INTERNAL', 'SELLER_EXTERNAL');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('WEB', 'CONTROLLER', 'EXTERNAL_SELLER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('RESERVED_UNPAID', 'PAID', 'USED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PersonCategory" AS ENUM ('HERECKY_SUBOR', 'UMELECKE_VEDENIE', 'VEDENIE_DIVADLA', 'HOSTIA', 'OBCHODNE_ODDELENIE', 'MARKETINGOVE_ODDELENIE', 'NEFORMALNE_VZDELAVANIE', 'TECHNICKY_USEK', 'ZAZEMIE');

-- CreateTable
CREATE TABLE "DivadelnaInscenacia" (
    "id" SERIAL NOT NULL,
    "nazov" TEXT NOT NULL,
    "anotacia" TEXT NOT NULL,
    "dlzkaMinut" INTEGER NOT NULL,
    "vekovaKategoria" TEXT NOT NULL,
    "datumPremiery" TIMESTAMP(3) NOT NULL,
    "typ" TEXT NOT NULL,
    "viditelna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DivadelnaInscenacia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hall" (
    "id" SERIAL NOT NULL,
    "nazov" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "termin_hrania" (
    "id" SERIAL NOT NULL,
    "datumCas" TIMESTAMP(3) NOT NULL,
    "typSedenia" TEXT,
    "zakladnaCena" DOUBLE PRECISION NOT NULL,
    "zrusene" BOOLEAN NOT NULL DEFAULT false,
    "inscenaciaId" INTEGER NOT NULL,
    "hallId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "termin_hrania_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HallSeat" (
    "id" SERIAL NOT NULL,
    "hallId" INTEGER NOT NULL,
    "rad" INTEGER,
    "cislo" INTEGER,
    "stol" INTEGER,
    "stolicka" INTEGER,
    "typMiesta" "SeatType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HallSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationSeat" (
    "id" SERIAL NOT NULL,
    "terminId" INTEGER NOT NULL,
    "hallSeatId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "initialAmount" DOUBLE PRECISION NOT NULL,
    "remainingAmount" DOUBLE PRECISION NOT NULL,
    "purchasedByEmail" TEXT,
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "message" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCardTransaction" (
    "id" SERIAL NOT NULL,
    "giftCardId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "orderId" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCardTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "status" "OrderStatus" NOT NULL,
    "source" "OrderSource" NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3),
    "terminId" INTEGER NOT NULL,
    "giftCardId" INTEGER,
    "stripePaymentIntentId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "orderId" INTEGER NOT NULL,
    "seatId" INTEGER NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CONTROLLER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "birthDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "roleLabel" TEXT NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "category" "PersonCategory" NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "heroImage" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hall_nazov_key" ON "Hall"("nazov");

-- CreateIndex
CREATE INDEX "ReservationSeat_sessionId_idx" ON "ReservationSeat"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationSeat_terminId_hallSeatId_key" ON "ReservationSeat"("terminId", "hallSeatId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_code_key" ON "Ticket"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- AddForeignKey
ALTER TABLE "termin_hrania" ADD CONSTRAINT "termin_hrania_inscenaciaId_fkey" FOREIGN KEY ("inscenaciaId") REFERENCES "DivadelnaInscenacia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "termin_hrania" ADD CONSTRAINT "termin_hrania_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallSeat" ADD CONSTRAINT "HallSeat_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationSeat" ADD CONSTRAINT "ReservationSeat_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "termin_hrania"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationSeat" ADD CONSTRAINT "ReservationSeat_hallSeatId_fkey" FOREIGN KEY ("hallSeatId") REFERENCES "HallSeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "termin_hrania"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "HallSeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
