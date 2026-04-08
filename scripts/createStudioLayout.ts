import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  const hall = await prisma.hall.findFirst({
    where: { nazov: "Štúdio" }
  })

  if (!hall) {
    throw new Error("Štúdio neexistuje")
  }

  const existing = await prisma.hallSeat.count({
    where: { hallId: hall.id }
  })

  if (existing > 0) {
    console.log("Layout štúdia už existuje")
    return
  }

  const seats: Prisma.HallSeatCreateManyInput[] = []

  for (let stol = 1; stol <= 19; stol++) {

    for (let stolicka = 1; stolicka <= 4; stolicka++) {

      seats.push({
        hallId: hall.id,
        stol,
        stolicka,
        typMiesta: "TABLE_SEAT"
      })

    }

  }

  await prisma.hallSeat.createMany({
    data: seats
  })

  console.log(`Vytvorených ${seats.length} miest v štúdiu`)

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })