import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  if (!id) {
    return NextResponse.json(
      { error: "Neplatné ID" },
      { status: 400 }
    )
  }

  const inscenacia = await prisma.divadelnaInscenacia.findUnique({
    where: { id },
    include: {
      terminy: {
        where: { zrusene: false },
        include: { hall: true },
        orderBy: { datumCas: "asc" }
      }
    }
  })

  if (!inscenacia || !inscenacia.viditelna) {
    return NextResponse.json(
      { error: "Inscenácia neexistuje" },
      { status: 404 }
    )
  }

  return NextResponse.json(inscenacia)
}