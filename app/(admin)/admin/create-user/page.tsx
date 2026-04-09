import { prisma } from "@/lib/prisma"
import CreateUserForm from "./CreateUserForm"
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton"
import EditUserForm from "./EditUserForm"
import type { User } from "@prisma/client"

export default async function Page() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="adminContainer">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30
        }}
      >
        <h1 className="headingPrimary" style={{ marginBottom: 0 }}>
          Prehľad používateľov
        </h1>

        <details id="createUserToggle">
          <summary
            className="primaryBtn"
            style={{ listStyle: "none", cursor: "pointer" }}
            data-open-text="Zavrieť formulár"
            data-closed-text="Pridať používateľa"
          >
            Pridať používateľa
          </summary>
        </details>
      </div>

      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('DOMContentLoaded', function() {
          const btn = document.getElementById('createUserToggle');
          const content = document.getElementById('createUserContent');
          if (!btn || !content) return;

          const summary = btn.querySelector('summary');

          function sync() {
            content.open = btn.open;
            if (summary) {
              summary.textContent = btn.open
                ? summary.getAttribute('data-open-text')
                : summary.getAttribute('data-closed-text');
            }
          }

          btn.addEventListener('toggle', sync);
          sync();
        });
      `}} />

      <details
        style={{ marginBottom: 30 }}
        id="createUserContent"
      >
        <summary style={{ display: "none" }} />

        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 12,
            border: "1px solid #eee",
            boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            marginTop: 0
          }}
        >
          <CreateUserForm />
        </div>
      </details>

      <div style={{ display: "grid", gap: 20, marginTop: 40 }}>
        {users.map((user: User) => (
          <div
            key={user.id}
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #eee",
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >

            {/* INFO */}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{user.email}</div>
                <div style={{ fontSize: 13, color: "#777" }}>{user.role}</div>
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>

              {/* EDIT BUTTON */}
              <EditUserForm user={user} />

              {/* DELETE */}
              <form action={`/api/admin/users/${user.id}/delete`} method="POST">
                <ConfirmDeleteButton>
                  Vymazať
                </ConfirmDeleteButton>
              </form>

            </div>

          </div>
        ))}
      </div>

    </div>
  )
}