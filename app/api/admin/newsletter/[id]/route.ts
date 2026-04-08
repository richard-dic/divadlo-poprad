import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

// DELETE
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const { id } = await context.params

  await prisma.newsletterSubscriber.delete({
    where: {
      id: Number(id)
    }
  })

  return NextResponse.json({ success: true })
}

// UPDATE
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const { id } = await context.params
  const { name, birthDate, email } = await req.json()

  const updated = await prisma.newsletterSubscriber.update({
    where: { id: Number(id) },
    data: {
      name: name || null,
      email,
      birthDate: birthDate ? new Date(birthDate) : null
    }
  })

  return NextResponse.json(updated)
}