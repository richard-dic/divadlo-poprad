/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {

  const layout = [
    10,9,8,9,8,9,8,9,8,9,8,8,8,12,12,12,17
  ]

  for (let i = 0; i < layout.length; i++) {

    const rad = i + 1
    const pocet = layout[i]

    for (let cislo = 1; cislo <= pocet; cislo++) {

      await prisma.hallSeat.create({
        data: {
          sala: "Veľká sála",
          rad,
          cislo,
          typMiesta: "NORMAL"
        }
      })

    }

  }

  console.log("Layout veľkej sály bol vytvorený")

}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })