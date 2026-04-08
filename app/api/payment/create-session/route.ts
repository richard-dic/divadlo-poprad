import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.json()
  const orderId = Number(body.orderId)

  if (!orderId) {
    return NextResponse.json(
      { error: "Chýba orderId" },
      { status: 400 }
    )
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      termin: {
        include: {
          inscenacia: true
        }
      },
      tickets: true
    }
  })

  if (!order) {
    return NextResponse.json(
      { error: "Objednávka neexistuje" },
      { status: 404 }
    )
  }

  if (order.tickets.length === 0) {
    return NextResponse.json(
      { error: "Objednávka nemá žiadne miesta" },
      { status: 400 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Divadlo Poprad – ${order.termin.inscenacia.nazov}`
            },
            unit_amount: Math.round(order.totalAmount * 100)
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancel`,
      metadata: {
        orderId: order.id.toString()
      }
    })

    return NextResponse.json({
      url: session.url
    })
  } catch (error) {
    console.error("Payment session error:", error)

    return NextResponse.json(
      { error: "Payment session failed" },
      { status: 500 }
    )
  }
}