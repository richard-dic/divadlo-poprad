import { prisma } from "@/lib/prisma"
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton"

export default async function AdminSkolyPage() {
  const data = await prisma.schoolInquiry.findMany({
    orderBy: { createdAt: "desc" }
  })

  const pending = data.filter(i => !i.vybavene)
  const done = data.filter(i => i.vybavene)

  return (
    <div className="adminContainer">
      <h1 className="headingPrimary" style={{ textAlign: "center" }}>
        ZÁUJEM O PREDSTAVENIA
      </h1>

      {/* NEVYBAVENÉ */}
      <h2 className="headingSecondary">Nevybavené</h2>

      <div style={{ display: "grid", gap: 20 }}>
        {pending.map(item => (
          <div
            key={item.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
              border: "1px solid #eee"
            }}
          >
            <div style={{ marginBottom: 10, fontWeight: 600 }}>
              <strong>Škola:</strong> {item.skola}
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>Meno:</strong> {item.meno}{item.funkcia ? ` (${item.funkcia})` : ""}
            </div>
            <div><strong>Email:</strong> {item.email}</div>
            <div><strong>Záujem:</strong> {item.zaujem}</div>
            {item.poznamka && (
              <div style={{ marginTop: 8 }}>
                <strong>Poznámka:</strong> {item.poznamka}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <form action={`/api/admin/skoly/${item.id}/delete`} method="POST">
                <ConfirmDeleteButton>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 40, minWidth: 140 }}>
                    Vymazať
                  </span>
                </ConfirmDeleteButton>
              </form>

              <form action={`/api/admin/skoly/${item.id}/toggle`} method="POST">
                <button className="primaryBtn" style={{ height: 40, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  Označiť ako vybavené
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* VYBAVENÉ */}
      {done.length > 0 && (
        <>
          <h2 className="headingSecondary" style={{ marginTop: 40 }}>
            Vybavené
          </h2>

          <div style={{ display: "grid", gap: 20 }}>
            {done.map(item => (
              <div
                key={item.id}
                style={{
                  background: "#f5f7f7",
                  borderRadius: 12,
                  padding: 20,
                  border: "1px solid #dfe5e5"
                }}
              >
                <div style={{ marginBottom: 10, fontWeight: 600 }}>
                  <strong>Škola:</strong> {item.skola}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Meno:</strong> {item.meno}{item.funkcia ? ` (${item.funkcia})` : ""}
                </div>
                <div><strong>Email:</strong> {item.email}</div>
                <div><strong>Záujem:</strong> {item.zaujem}</div>
                {item.poznamka && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Poznámka:</strong> {item.poznamka}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
                  <form action={`/api/admin/skoly/${item.id}/delete`} method="POST">
                    <ConfirmDeleteButton>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 40, minWidth: 140 }}>
                        Vymazať
                      </span>
                    </ConfirmDeleteButton>
                  </form>

                  <form action={`/api/admin/skoly/${item.id}/toggle`} method="POST">
                    <button className="primaryBtn" style={{ height: 40, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      Označiť ako nevybavené
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}