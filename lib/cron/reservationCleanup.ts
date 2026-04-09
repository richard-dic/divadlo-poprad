import cron from "node-cron"
import { prisma } from "@/lib/prisma"

export function startReservationCleanup() {
  cron.schedule("*/30 * * * * *", async () => {
    const now = new Date()
    const orderCutoff = new Date(Date.now() - 15 * 60 * 1000) // 15 min

    try {
      const expiredSeats = await prisma.reservationSeat.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      })

      const expiredOrdersList = await prisma.order.findMany({
        where: {
          status: "RESERVED_UNPAID",
          source: "WEB",
          createdAt: {
            lt: orderCutoff
          }
        },
        select: {
          id: true
        }
      })

      const orderIds = expiredOrdersList.map((o) => o.id)

      let expiredOrders = { count: 0 }

      if (orderIds.length > 0) {
        const deletedTickets = await prisma.ticket.deleteMany({
          where: {
            orderId: {
              in: orderIds
            }
          }
        })

        expiredOrders = await prisma.order.deleteMany({
          where: {
            id: {
              in: orderIds
            }
          }
        })

        console.log(
          `Cleanup → tickets: ${deletedTickets.count}, orders: ${expiredOrders.count}`
        )
      }

      const totalDeleted = expiredSeats.count + expiredOrders.count

      if (totalDeleted > 0) {
        console.log(
          `Cleanup → seats: ${expiredSeats.count}, orders: ${expiredOrders.count}`
        )
      }
    } catch (err) {
      console.error("Cleanup error:", err)
    }
  })
}