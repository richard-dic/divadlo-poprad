import Link from "next/link"
import fs from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"
import { generateTicket } from "@/lib/generateTicket"

export default async function PaymentSuccess({
  searchParams
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const orderId = Number(resolvedSearchParams.orderId)

  if (!orderId) {
    return <div>Chýba orderId.</div>
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      tickets: {
        include: {
          seat: true
        }
      },
      termin: {
        include: {
          inscenacia: true,
          hall: true
        }
      }
    }
  })

  if (!order) {
    return <div>Objednávka nebola nájdená.</div>
  }

  const pdfFileName = `ticket-order-${order.id}.pdf`
  const pdfPath = path.join(process.cwd(), "public", "tickets", pdfFileName)

  let pdfExists = fs.existsSync(pdfPath)

  // fallback – ak PDF ešte nie je, skús ho dovygenerovať
  if (!pdfExists && order.tickets.length > 0) {
    await generateTicket(order)
    pdfExists = fs.existsSync(pdfPath)
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 30,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            textAlign: "center"
          }}
        >
          <h1 className="headingPrimary">Platba prebehla úspešne</h1>
          <div style={{ fontSize: 40, marginTop: 10, marginBottom: 10, color: "var(--primary)" }}>
            ✔
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>
              {order.termin.inscenacia.nazov}
            </div>
            <div style={{ color: "#777", fontSize: 14 }}>
              {new Date(order.termin.datumCas).toLocaleDateString("sk-SK")} |{" "}
              {new Date(order.termin.datumCas).toLocaleTimeString("sk-SK", {
                hour: "2-digit",
                minute: "2-digit"
              })}{" "}
              | {order.termin.hall.nazov}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 30 }}>
            <h2 className="headingSecondary" style={{ marginTop: 0 }}>
              Zakúpené miesta
            </h2>

            <div style={{ display: "grid", gap: 6 }}>
              {order.tickets.map((ticket) => (
                <div key={ticket.id}>
                  {formatSeat(ticket.seat)}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            {pdfExists ? (
              <a
                href={`/tickets/${pdfFileName}`}
                download
                className="secondaryBtn"
              >
                Stiahnuť vstupenky (PDF)
              </a>
            ) : (
              <div style={{ color: "red", fontSize: 14 }}>
                PDF vstupenky sa nepodarilo pripraviť.
              </div>
            )}
          </div>

          <p style={{ marginTop: 20, fontSize: 14, color: "#777" }}>
            Vstupenky boli odoslané na váš email. Ak ste ich neobdržali, kontaktujte prosím podporu divadla.
          </p>
          <div style={{ marginTop: 30 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div className="primaryBtn" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
                <span>Späť na hlavnú stránku</span>
                
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatSeat(seat: {
  typMiesta: string
  rad: number | null
  cislo: number | null
  stol: number | null
  stolicka: number | null
}) {
  if (seat.typMiesta === "ROW_SEAT") {
    return `Rad ${seat.rad} – Miesto ${seat.cislo}`
  }

  if (seat.typMiesta === "TABLE_SEAT") {
    return `Stôl ${seat.stol} – Stolička ${seat.stolicka}`
  }

  if (seat.typMiesta === "CHAIR") {
    return `Miesto ${seat.cislo ?? seat.stolicka ?? ""}`.trim()
  }

  if (seat.typMiesta === "CHILD_SEAT") {
    return `Detské miesto ${seat.cislo ?? ""}`.trim()
  }

  return "Miesto"
}