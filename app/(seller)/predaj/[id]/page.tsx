import { prisma } from "@/lib/prisma"
import SellerSeatMap from "../../../../components/SellerSeatMap"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const terminId = Number(id)

  const user = await getCurrentUser()

  if (!user) {
    return <div>Neautorizovaný prístup</div>
  }

  const termin = await prisma.terminHrania.findUnique({
    where: { id: terminId },
    include: {
      inscenacia: true,
      hall: true
    }
  })

  if (!termin) {
    return <div>Termín neexistuje</div>
  }

  const mode =
    user.role === "SELLER_EXTERNAL"
      ? "external"
      : "internal"

  const backHref =
    user.role === "CONTROLLER" || user.role === "ADMIN"
      ? "/scan"
      : "/predaj"

  return (
    <div className="adminContainer" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href={backHref} style={{ color: "#27A7B2", fontWeight: 500 }}>
          ← Späť na výber termínu
        </Link>

        {(user.role === "CONTROLLER" || user.role === "ADMIN") && (
          <>
            {" | "}
            <Link href={`/scan/${terminId}`}>
              Prejsť na kontrolu tohto termínu
            </Link>
          </>
        )}
      </div>

      <h1 className="headingPrimary" style={{ marginBottom: 10 }}>
        {termin.inscenacia.nazov}
      </h1>
      <div style={{ marginBottom: 24, color: "#555", lineHeight: 1.6 }}>
        <div>
          <strong>Dátum:</strong> {new Date(termin.datumCas).toLocaleDateString("sk-SK")}
        </div>
        <div>
          <strong>Čas:</strong> {new Date(termin.datumCas).toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div>
          <strong>Priestor:</strong> {termin.hall.nazov}
        </div>
      </div>

      <SellerSeatMap
        terminId={terminId}
        mode={mode}
      />
    </div>
  )
}