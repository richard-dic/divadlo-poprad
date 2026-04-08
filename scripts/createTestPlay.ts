import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  const play = await prisma.divadelnaInscenacia.create({
    data: {
      nazov: "Testovacia inscenácia",
      anotacia: "Test systému predaja lístkov.",
      dlzkaMinut: 90,
      vekovaKategoria: "12+",
      datumPremiery: new Date(),
      typ: "divadlo",
      viditelna: true
    }
  })

  const hall = await prisma.hall.findFirst({
    where: { nazov: "Veľká sála" }
  })

  if (!hall) {
    throw new Error("Sála neexistuje")
  }

  const termin = await prisma.terminHrania.create({
    data: {
      datumCas: new Date(Date.now() + 1000 * 60 * 60 * 24),
      zakladnaCena: 12,
      inscenaciaId: play.id,
      hallId: hall.id
    }
  })

  console.log("Testovacia inscenácia vytvorená")
  console.log("Termin ID:", termin.id)

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })