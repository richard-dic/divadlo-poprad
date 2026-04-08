import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { finalizeOrder } from "@/lib/finalizeOrder"
import { sendGiftCardEmail } from "@/lib/email/sendGiftCardEmail"
import { OrderStatus } from "@prisma/client"
import { generateGiftCardCode } from "@/lib/generateGiftCardCode"
import { generateGiftCardVoucher } from "@/lib/generateGiftCardVoucher"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature error:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const type = session.metadata?.type

    // 🎁 Gift card purchase
    if (type === "giftcard") {
      const amount = Number(session.metadata?.amount)
      const email = session.metadata?.email

      const code = generateGiftCardCode()

      const card = await prisma.giftCard.create({
        data: {
          code,
          initialAmount: amount,
          remainingAmount: amount,
          purchasedByEmail: email
        }
      })

      const pdfFile = await generateGiftCardVoucher({
        code: card.code,
        amount
      })

      if (email) {
        await sendGiftCardEmail(email, card.code, amount, pdfFile)
      }

      return NextResponse.json({ received: true })
    }

    // 🎟 Ticket purchase
    const orderId = Number(session.metadata?.orderId)
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null

    if (orderId) {
      const updated = await prisma.order.updateMany({
        where: {
          id: orderId,
          status: {
            not: OrderStatus.PAID
          }
        },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntentId
        }
      })

      if (updated.count === 0) {
        return NextResponse.json({ received: true })
      }

      await finalizeOrder(orderId)
    }
  }

  return NextResponse.json({ received: true })
}