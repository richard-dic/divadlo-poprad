import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET() {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER"])

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

  return NextResponse.json(
    terminy.map((t) => ({
      id: t.id,
      nazov: t.inscenacia.nazov,
      datumCas: t.datumCas,
      hall: t.hall.nazov
    }))
  )
}