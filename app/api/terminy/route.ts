import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(request: Request) {

  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const body = await request.json()

  const termin = await prisma.terminHrania.create({
    data: {
      inscenaciaId: Number(body.inscenaciaId),
      datumCas: new Date(body.datumCas),
      hallId: Number(body.hallId),
      zakladnaCena: Number(body.zakladnaCena),
      typSedenia: body.typSedenia || null
    }
  })

  return NextResponse.json(termin)
}