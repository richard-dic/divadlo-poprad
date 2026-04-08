import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  try {
    const body = await req.json()

    const inscenaciaId = Number(body.inscenaciaId)
    const hallId = Number(body.hallId)
    const datumCasRaw = String(body.datumCas || "")
    const zakladnaCena = Number(body.zakladnaCena)
    const typSedenia = body.typSedenia ? String(body.typSedenia) : null

    if (!inscenaciaId || !hallId || !datumCasRaw || !zakladnaCena) {
      return NextResponse.json(
        { error: "Chýbajú údaje" },
        { status: 400 }
      )
    }

    const datumCas = new Date(datumCasRaw)

    if (Number.isNaN(datumCas.getTime())) {
      return NextResponse.json(
        { error: "Neplatný dátum" },
        { status: 400 }
      )
    }

    const hall = await prisma.hall.findUnique({
      where: { id: hallId }
    })

    if (!hall) {
      return NextResponse.json(
        { error: "Sála neexistuje" },
        { status: 404 }
      )
    }

    if (hall.nazov === "Štúdio" && !typSedenia) {
      return NextResponse.json(
        { error: "Typ sedenia je povinný pre Štúdio" },
        { status: 400 }
      )
    }

    const item = await prisma.terminHrania.create({
      data: {
        inscenaciaId,
        hallId,
        datumCas,
        zakladnaCena,
        typSedenia: hall.nazov === "Štúdio" ? typSedenia : null
      }
    })

    return NextResponse.json(item)
  } catch (e) {
    console.error(e)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const terminy = await prisma.terminHrania.findMany({
    include: {
      inscenacia: true,
      hall: true
    },
    orderBy: {
      datumCas: "asc"
    }
  })

  return NextResponse.json(terminy)
}