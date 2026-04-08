import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const { id: idParam } = await params
  const id = Number(idParam)

  if (!id) {
    return NextResponse.json(
      { error: "Neplatné ID" },
      { status: 400 }
    )
  }

  const item = await prisma.divadelnaInscenacia.findUnique({
    where: { id },
    include: {
      terminy: {
        include: {
          hall: true
        },
        orderBy: {
          datumCas: "asc"
        }
      }
    }
  })

  if (!item) {
    return NextResponse.json(
      { error: "Inscenácia neexistuje" },
      { status: 404 }
    )
  }

  return NextResponse.json(item)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const { id: idParam } = await params
  const id = Number(idParam)

  if (!id) {
    return NextResponse.json(
      { error: "Neplatné ID" },
      { status: 400 }
    )
  }

  const body = await req.json()

  const nazov = String(body.nazov || "").trim()
  const anotacia = String(body.anotacia || "").trim()
  const obsah = String(body.obsah || "").trim()
  const rezia = String(body.rezia || "").trim()
  const credits = String(body.credits || "").trim()
  const dlzkaMinut = Number(body.dlzkaMinut || 0)
  const vekovaKategoria = String(body.vekovaKategoria || "").trim()
  const datumPremieryRaw = String(body.datumPremiery || "").trim()
  const typ = String(body.typ || "").trim()
  const viditelna = Boolean(body.viditelna)

  const coverImage = String(body.coverImage || "").trim()
  const heroImage = String(body.heroImage || "").trim()
  const trailerUrl = String(body.trailerUrl || "").trim()

  const galleryImages = Array.isArray(body.galleryImages)
    ? body.galleryImages.map((img: unknown) => String(img).trim()).filter(Boolean)
    : []

  if (
    !nazov ||
    !anotacia ||
    !obsah ||
    !credits ||
    !dlzkaMinut ||
    !vekovaKategoria ||
    !datumPremieryRaw ||
    !typ ||
    !coverImage
  ) {
    return NextResponse.json(
      { error: "Chýbajú povinné údaje" },
      { status: 400 }
    )
  }

  const datumPremiery = new Date(datumPremieryRaw)

  if (Number.isNaN(datumPremiery.getTime())) {
    return NextResponse.json(
      { error: "Neplatný dátum premiéry" },
      { status: 400 }
    )
  }

  const updated = await prisma.divadelnaInscenacia.update({
    where: { id },
    data: {
      nazov,
      anotacia,
      obsah,
      rezia: rezia || null,
      credits,
      dlzkaMinut,
      vekovaKategoria,
      datumPremiery,
      typ,
      viditelna,
      coverImage,
      heroImage: heroImage || null,
      trailerUrl: trailerUrl || null,
      galleryImages
    }
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const { id: idParam } = await params
  const id = Number(idParam)

  if (!id) {
    return NextResponse.json(
      { error: "Neplatné ID" },
      { status: 400 }
    )
  }

  const existing = await prisma.divadelnaInscenacia.findUnique({
    where: { id },
    include: {
      terminy: true
    }
  })

  if (!existing) {
    return NextResponse.json(
      { error: "Inscenácia neexistuje" },
      { status: 404 }
    )
  }

  if (existing.terminy.length > 0) {
    return NextResponse.json(
      { error: "Inscenáciu nie je možné zmazať, lebo má priradené termíny." },
      { status: 400 }
    )
  }

  await prisma.divadelnaInscenacia.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}