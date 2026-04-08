import { prisma } from "@/lib/prisma"
import CheckoutForm from "./CheckoutForm"

export default async function Checkout({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sessionId?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const terminId = Number(resolvedParams.id)
  const sessionId = resolvedSearchParams.sessionId

  if (!sessionId) {
    return <div>Chýba session rezervácie.</div>
  }

  const reservations = await prisma.reservationSeat.findMany({
    where: {
      terminId,
      sessionId,
      status: "RESERVED",
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      hallSeat: true
    }
  })

  return (
    <div className="container section" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 className="headingPrimary" style={{ textAlign: "center", marginBottom: 30 }}>
        Checkout
      </h1>

      <div
        style={{
          maxWidth: 700,
          margin: "0 auto 24px",
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
        }}
      >
        <h2 className="headingSecondary" style={{ marginTop: 0 }}>
          Vybrané miesta
        </h2>

        {reservations.length === 0 ? (
          <p style={{ color: "#777" }}>
            Nemáte vybrané žiadne miesta.
          </p>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {reservations.map((r) => (
              <li key={r.id} style={{ marginBottom: 6 }}>
                {formatSeat(r.hallSeat)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 20
        }}
      >
        <CheckoutForm
          terminId={terminId}
          sessionId={sessionId}
        />
      </div>

    </div>
  )
}

function formatSeat(hallSeat: {
  typMiesta: string
  rad: number | null
  cislo: number | null
  stol: number | null
  stolicka: number | null
}) {
  if (hallSeat.typMiesta === "ROW_SEAT") {
    return `Rad ${hallSeat.rad} – Miesto ${hallSeat.cislo}`
  }

  if (hallSeat.typMiesta === "TABLE_SEAT") {
    return `Stôl ${hallSeat.stol} – Stolička ${hallSeat.stolicka}`
  }

  return "Miesto"
}