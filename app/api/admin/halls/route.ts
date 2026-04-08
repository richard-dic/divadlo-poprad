import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET() {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const halls = await prisma.hall.findMany({
    orderBy: {
      nazov: "asc"
    }
  })

  return NextResponse.json(halls)
}