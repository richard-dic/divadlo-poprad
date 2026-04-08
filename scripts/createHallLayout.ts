import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  const hall = await prisma.hall.findFirst({
    where: { nazov: "Veľká sála" }
  })

  if (!hall) {
    throw new Error("Veľká sála neexistuje")
  }

  const existing = await prisma.hallSeat.count({
    where: { hallId: hall.id }
  })

  if (existing > 0) {
    console.log("Sedadlá pre veľkú sálu už existujú")
    return
  }

  const layout = [
    10,9,8,9,8,9,8,9,8,9,8,8,8,12,12,12,17
  ]

  const seats: Prisma.HallSeatCreateManyInput[] = []

  for (let i = 0; i < layout.length; i++) {

    const rad = i + 1
    const pocet = layout[i]

    for (let cislo = 1; cislo <= pocet; cislo++) {

      seats.push({
        hallId: hall.id,
        rad,
        cislo,
        typMiesta: "ROW_SEAT"
      })

    }

  }

  await prisma.hallSeat.createMany({
    data: seats
  })

  console.log(`Vytvorených ${seats.length} miest vo veľkej sále`)

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })