import { PrismaClient, SeatType, UserRole } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Spúšťam seed...")

  // =====================================================
  // USERS
  // =====================================================
  const adminPassword = await bcrypt.hash("123456", 10)
  const controllerPassword = await bcrypt.hash("123456", 10)
  const internalSellerPassword = await bcrypt.hash("123456", 10)
  const externalSellerPassword = await bcrypt.hash("123456", 10)

  await prisma.user.upsert({
    where: { email: "admin@divadlo.sk" },
    update: {},
    create: {
      email: "admin@divadlo.sk",
      password: adminPassword,
      role: UserRole.ADMIN
    }
  })

  await prisma.user.upsert({
    where: { email: "controller@divadlo.sk" },
    update: {},
    create: {
      email: "controller@divadlo.sk",
      password: controllerPassword,
      role: UserRole.CONTROLLER
    }
  })

  await prisma.user.upsert({
    where: { email: "seller@divadlo.sk" },
    update: {},
    create: {
      email: "seller@divadlo.sk",
      password: internalSellerPassword,
      role: UserRole.SELLER_INTERNAL
    }
  })

  await prisma.user.upsert({
    where: { email: "seller@divadlo.sk" },
    update: {},
    create: {
      email: "seller@divadlo.sk",
      password: externalSellerPassword,
      role: UserRole.SELLER_EXTERNAL
    }
  })

  // =====================================================
  // HALLS
  // =====================================================
  const velkaSala = await prisma.hall.upsert({
    where: { nazov: "Veľká sála" },
    update: {},
    create: { nazov: "Veľká sála" }
  })

  const studio = await prisma.hall.upsert({
    where: { nazov: "Štúdio" },
    update: {},
    create: { nazov: "Štúdio" }
  })

  // =====================================================
  // CLEANUP
  // =====================================================
  await prisma.ticket.deleteMany()
  await prisma.order.deleteMany()
  await prisma.reservationSeat.deleteMany()
  await prisma.terminHrania.deleteMany()
  await prisma.hallSeat.deleteMany()
  await prisma.divadelnaInscenacia.deleteMany()

  // =====================================================
  // VEĽKÁ SÁLA
  // =====================================================
  const velkaSalaLayout = [10, 9, 8, 9, 8, 9, 8, 9, 8, 9, 8, 8, 8, 12, 12, 12, 17]

  const velkaSalaSeats: {
    hallId: number
    rad: number | null
    cislo: number | null
    stol: number | null
    stolicka: number | null
    typMiesta: SeatType
  }[] = []

  for (let i = 0; i < velkaSalaLayout.length; i++) {
    const rad = i + 1
    const pocet = velkaSalaLayout[i]

    for (let cislo = 1; cislo <= pocet; cislo++) {
      velkaSalaSeats.push({
        hallId: velkaSala.id,
        rad,
        cislo,
        stol: null,
        stolicka: null,
        typMiesta: SeatType.ROW_SEAT
      })
    }
  }

  await prisma.hallSeat.createMany({
    data: velkaSalaSeats
  })

  // =====================================================
  // ŠTÚDIO – TABLES
  // =====================================================
  const studioTableSeats: {
    hallId: number
    rad: number | null
    cislo: number | null
    stol: number | null
    stolicka: number | null
    typMiesta: SeatType
  }[] = []

  for (let stol = 1; stol <= 19; stol++) {
    for (let stolicka = 1; stolicka <= 4; stolicka++) {
      studioTableSeats.push({
        hallId: studio.id,
        rad: null,
        cislo: null,
        stol,
        stolicka,
        typMiesta: SeatType.TABLE_SEAT
      })
    }
  }

  await prisma.hallSeat.createMany({
    data: studioTableSeats
  })

  // =====================================================
  // ŠTÚDIO – ROWS
  // =====================================================
  const studioRowSeats: {
    hallId: number
    rad: number | null
    cislo: number | null
    stol: number | null
    stolicka: number | null
    typMiesta: SeatType
  }[] = []

  for (let rad = 1; rad <= 7; rad++) {
    for (let cislo = 1; cislo <= 12; cislo++) {
      studioRowSeats.push({
        hallId: studio.id,
        rad,
        cislo,
        stol: null,
        stolicka: null,
        typMiesta: SeatType.ROW_SEAT
      })
    }
  }

  await prisma.hallSeat.createMany({
    data: studioRowSeats
  })

  // =====================================================
  // ŠTÚDIO – KIDS
  // =====================================================
  const kidsSeats: {
    hallId: number
    rad: number | null
    cislo: number | null
    stol: number | null
    stolicka: number | null
    typMiesta: SeatType
  }[] = []

  const leftAdults = [
    [1, 2], [2, 4], [3, 6], [4, 8], [5, 10], [6, 11], [7, 12], [8, 13], [9, 28]
  ]

  const leftKids = [
    [1, 1], [2, 3], [3, 5], [4, 7], [5, 9], [8, 27]
  ]

  const rightKids = [
    [1, 14], [2, 16], [3, 18], [4, 20], [5, 22], [8, 29]
  ]

  const rightAdults = [
    [1, 15], [2, 17], [3, 19], [4, 21], [5, 23], [6, 24], [7, 25], [8, 26], [9, 30]
  ]

  for (const [rad, cislo] of leftAdults) {
    kidsSeats.push({
      hallId: studio.id,
      rad,
      cislo,
      stol: null,
      stolicka: null,
      typMiesta: SeatType.CHAIR
    })
  }

  for (const [rad, cislo] of leftKids) {
    kidsSeats.push({
      hallId: studio.id,
      rad,
      cislo,
      stol: null,
      stolicka: null,
      typMiesta: SeatType.CHILD_SEAT
    })
  }

  for (const [rad, cislo] of rightKids) {
    kidsSeats.push({
      hallId: studio.id,
      rad,
      cislo,
      stol: null,
      stolicka: null,
      typMiesta: SeatType.CHILD_SEAT
    })
  }

  for (const [rad, cislo] of rightAdults) {
    kidsSeats.push({
      hallId: studio.id,
      rad,
      cislo,
      stol: null,
      stolicka: null,
      typMiesta: SeatType.CHAIR
    })
  }

  await prisma.hallSeat.createMany({
    data: kidsSeats
  })

  // =====================================================
// INSCEÁCIE (UPGRADE)
// =====================================================
const hamlet = await prisma.divadelnaInscenacia.create({
  data: {
    nazov: "Hamlet",
    anotacia: "Slávna tragédia od Shakespeara",

    obsah: `
Hamlet je nadčasová tragédia o pomste, zrade a vnútornom boji človeka.
Príbeh dánskeho princa odhaľuje temné zákutia ľudskej duše a otázky bytia.
    `,

    credits: `
Réžia: Ján Novák
Scéna: Peter Kováč
Hudba: Martin Hudobník
Kostýmy: Lucia Štýlová
    `,

    dlzkaMinut: 120,
    vekovaKategoria: "15+",
    datumPremiery: new Date("2024-10-01"),
    typ: "DRÁMA",
    viditelna: true,

    coverImage: "/demo/hamlet-cover.jpg",
    heroImage: "/demo/hamlet-hero.jpg",

    trailerUrl: "https://www.youtube.com/watch?v=example",

    galleryImages: [
      "/demo/hamlet-1.jpg",
      "/demo/hamlet-2.jpg",
      "/demo/hamlet-3.jpg"
    ]
  }
})

const rozpravka = await prisma.divadelnaInscenacia.create({
  data: {
    nazov: "Čarovný les",
    anotacia: "Rodinné predstavenie pre deti aj rodičov",

    obsah: `
V čarovnom lese sa odohráva dobrodružný príbeh plný fantázie,
kde sa deti stretnú s kúzelnými bytosťami a naučia sa hodnotu priateľstva.
    `,

    credits: `
Réžia: Eva Rozprávková
Hudba: Deti lesa
Scéna: Fantázia Studio
    `,

    dlzkaMinut: 70,
    vekovaKategoria: "3+",
    datumPremiery: new Date("2025-01-15"),
    typ: "ROZPRÁVKA",
    viditelna: true,

    coverImage: "/demo/les-cover.jpg",
    heroImage: "/demo/les-hero.jpg",

    trailerUrl: null,

    galleryImages: [
      "/demo/les-1.jpg",
      "/demo/les-2.jpg"
    ]
  }
})
  // =====================================================
  // TERMÍNY
  // =====================================================
  await prisma.terminHrania.createMany({
    data: [
      {
        datumCas: new Date(Date.now() + 1000 * 60 * 60 * 24),
        typSedenia: null,
        zakladnaCena: 15,
        zrusene: false,
        inscenaciaId: hamlet.id,
        hallId: velkaSala.id
      },
      {
        datumCas: new Date(Date.now() + 1000 * 60 * 60 * 48),
        typSedenia: "TABLES",
        zakladnaCena: 12,
        zrusene: false,
        inscenaciaId: hamlet.id,
        hallId: studio.id
      },
      {
        datumCas: new Date(Date.now() + 1000 * 60 * 60 * 72),
        typSedenia: "ROWS",
        zakladnaCena: 12,
        zrusene: false,
        inscenaciaId: hamlet.id,
        hallId: studio.id
      },
      {
        datumCas: new Date(Date.now() + 1000 * 60 * 60 * 96),
        typSedenia: "KIDS",
        zakladnaCena: 8,
        zrusene: false,
        inscenaciaId: rozpravka.id,
        hallId: studio.id
      }
    ]
  })

  console.log("✅ Seed hotový")
  console.log("ADMIN: admin@admin.sk / admin123")
  console.log("CONTROLLER: controller@scan.sk / controller123")
  console.log("SELLER_INTERNAL: seller@internal.sk / seller123")
  console.log("SELLER_EXTERNAL: seller@external.sk / external123")
}

main()
  .catch((e) => {
    console.error("❌ Seed chyba:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })