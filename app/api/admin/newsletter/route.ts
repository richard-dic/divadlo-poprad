import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET() {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) return auth

  const data = await prisma.newsletterSubscriber.findMany({
    orderBy: {
      createdAt: "desc"
    }
  })

  return NextResponse.json(data)
}