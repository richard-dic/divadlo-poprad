import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.json()

  const amount = Number(body.amount)
  const purchasedByEmail = body.purchasedByEmail ?? ""
  const recipientEmail = body.recipientEmail ?? ""
  const recipientName = body.recipientName ?? ""
  const message = body.message ?? ""

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: "Neplatná suma poukážky" },
      { status: 400 }
    )
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    metadata: {
      kind: "giftcard",
      amount: amount.toString(),
      purchasedByEmail,
      recipientEmail,
      recipientName,
      message
    },
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Darčeková poukážka Divadlo Poprad"
          },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }
    ],
    mode: "payment",
    success_url: `${process.env.BASE_URL}/giftcard/success`,
    cancel_url: `${process.env.BASE_URL}/giftcard/cancel`
  })

  return NextResponse.json({ url: session.url })
}