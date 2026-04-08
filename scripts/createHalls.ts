import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  const existing = await prisma.hall.count()

  if (existing > 0) {
    console.log("Sály už existujú.")
    return
  }

  await prisma.hall.createMany({
    data: [
      { nazov: "Veľká sála" },
      { nazov: "Štúdio" }
    ]
  })

  console.log("Sály boli vytvorené")

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })