import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { OrderStatus } from "@prisma/client"

export async function GET(req: Request) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get("status")

  let statusFilter: OrderStatus | undefined = undefined

  if (
    statusParam &&
    Object.values(OrderStatus).includes(statusParam as OrderStatus)
  ) {
    statusFilter = statusParam as OrderStatus
  }

  const orders = await prisma.order.findMany({
    where: statusFilter
      ? {
          status: statusFilter
        }
      : undefined,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      termin: {
        include: {
          inscenacia: true
        }
      }
    }
  })

  return NextResponse.json(orders)
}