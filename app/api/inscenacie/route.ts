import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET() {
  const inscenacie = await prisma.divadelnaInscenacia.findMany({
    where: {
      viditelna: true
    },
    orderBy: {
      datumPremiery: "desc"
    },
    select: {
      id: true,
      nazov: true,
      anotacia: true,
      coverImage: true,
      typ: true,
      dlzkaMinut: true,
      vekovaKategoria: true,
      datumPremiery: true,
      rezia: true
    }
  })

  return NextResponse.json(inscenacie)
}

export async function POST(request: Request) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const body = await request.json()

  const novaInscenacia = await prisma.divadelnaInscenacia.create({
    data: {
      nazov: body.nazov,
      anotacia: body.anotacia,
      obsah: body.obsah || "",
      rezia: body.rezia || null,
      credits: body.credits || "",

      dlzkaMinut: body.dlzkaMinut,
      vekovaKategoria: body.vekovaKategoria,
      datumPremiery: new Date(body.datumPremiery),
      typ: body.typ,

      coverImage: body.coverImage || "",
      heroImage: body.heroImage || "",
      trailerUrl: body.trailerUrl || "",

      galleryImages: body.galleryImages || [],

      viditelna: body.viditelna ?? true
    }
  })

  return NextResponse.json(novaInscenacia)
}