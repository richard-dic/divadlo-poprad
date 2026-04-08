import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {

  const body = await request.json()

  const { amount, email } = body

  if (!amount || amount <= 0) {

    return NextResponse.json(
      { error: "Neplatná suma" },
      { status: 400 }
    )

  }

  const session = await stripe.checkout.sessions.create({

    payment_method_types: ["card"],

    mode: "payment",

    line_items: [

      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Darčeková poukážka – Divadlo Poprad"
          },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }

    ],

    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/giftcard/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/giftcard/buy`,

    metadata: {
      type: "giftcard",
      amount: amount.toString(),
      email
    }

  })

  return NextResponse.json({
    url: session.url
  })

}