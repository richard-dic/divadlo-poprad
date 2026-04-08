import SellerSeatMap from '@/components/SellerSeatMap'
import { prisma } from '@/lib/prisma'

export default async function SellerPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const terminId = Number(id)

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

  return (
    <div className="adminContainer" style={{ marginTop: 30 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="headingPrimary" style={{ marginBottom: 6 }}>
            {termin.inscenacia.nazov}
          </h1>

          <div
            style={{
              marginTop: 8,
              color: "var(--color-text-muted)",
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              fontSize: 14
            }}
          >
            <div>
              <b>DÁTUM:</b>{" "}
              {new Date(termin.datumCas).toLocaleDateString("sk-SK").toUpperCase()}
            </div>

            <div>
              <b>ČAS:</b>{" "}
              {new Date(termin.datumCas).toLocaleTimeString("sk-SK", {
                hour: "2-digit",
                minute: "2-digit"
              }).toUpperCase()}
            </div>

            <div>
              <b>PRIESTOR:</b> {termin.hall.nazov.toUpperCase()}
            </div>
          </div>
        </div>
        <SellerSeatMap
          terminId={terminId}
          mode="internal"
        />
      </div>
    </div>
  )
}