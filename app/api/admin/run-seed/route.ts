import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SeatType } from "@prisma/client"

export async function GET() {
  try {
    // najprv vyčisti existujúce miesta
    await prisma.hallSeat.deleteMany()

    // vytvor alebo nájdi sály
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

    return NextResponse.json({
      success: true,
      message: "Sály a miesta boli úspešne vytvorené",
      halls: {
        velkaSalaId: velkaSala.id,
        studioId: studio.id
      },
      counts: {
        velkaSala: velkaSalaSeats.length,
        studioTables: studioTableSeats.length,
        studioRows: studioRowSeats.length,
        studioKids: kidsSeats.length
      }
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { success: false, error: "Seed zlyhal" },
      { status: 500 }
    )
  }
}