import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sendNewsletterWelcomeEmail } from "@/lib/email/sendNewsletterWelcomeEmail"

export async function POST(req: Request) {
  try {
    const { email, name, birthDate } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Neplatný email" },
        { status: 400 }
      )
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Email už je prihlásený" },
        { status: 400 }
      )
    }

    await prisma.newsletterSubscriber.create({
    data: {
        email,
        name: name || null,
        birthDate: birthDate ? new Date(birthDate) : null
    }
    })

    try {
    await sendNewsletterWelcomeEmail({
        email,
        name
    })
    } catch (e) {
    console.error("NEWSLETTER EMAIL ERROR:", e)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
  
}