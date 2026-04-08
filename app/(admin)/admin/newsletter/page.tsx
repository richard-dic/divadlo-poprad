"use client"

import { useEffect, useState } from "react"

type Subscriber = {
  id: number
  email: string
  name: string | null
  birthDate: string | null
}

export default function NewsletterAdminPage() {
  const [data, setData] = useState<Subscriber[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState({
    email: "",
    name: "",
    birthDate: ""
  })

  async function load() {
    const res = await fetch("/api/admin/newsletter")
    const json = await res.json()
    setData(json)
  }

  useEffect(() => {
    async function init() {
      await load()
    }
    void init()
  }, [])

  async function remove(id: number) {
    await fetch(`/api/admin/newsletter/${id}`, {
      method: "DELETE"
    })

    setData((prev) => prev.filter((x) => x.id !== id))
  }

  function startEdit(sub: Subscriber) {
    setEditingId(sub.id)
    setEditData({
      email: sub.email,
      name: sub.name || "",
      birthDate: sub.birthDate
        ? sub.birthDate.slice(0, 10)
        : ""
    })
  }

  async function saveEdit(id: number) {
    await fetch(`/api/admin/newsletter/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(editData)
    })

    setEditingId(null)
    await load()
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Newsletter</h1>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Meno</th>
            <th>Dátum narodenia</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {data.map((s) => (
            <tr key={s.id}>
              {/* EMAIL */}
              <td>
                {editingId === s.id ? (
                  <input
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        email: e.target.value
                      })
                    }
                  />
                ) : (
                  s.email
                )}
              </td>

              {/* MENO */}
              <td>
                {editingId === s.id ? (
                  <input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        name: e.target.value
                      })
                    }
                  />
                ) : (
                  s.name || "-"
                )}
              </td>

              {/* DATUM */}
              <td>
                {editingId === s.id ? (
                  <input
                    type="date"
                    value={editData.birthDate}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        birthDate: e.target.value
                      })
                    }
                  />
                ) : s.birthDate ? (
                  new Date(s.birthDate).toLocaleDateString()
                ) : (
                  "-"
                )}
              </td>

              {/* BUTTONS */}
              <td>
                {editingId === s.id ? (
                  <button onClick={() => saveEdit(s.id)}>
                    Uložiť
                  </button>
                ) : (
                  <button onClick={() => startEdit(s)}>
                    Upraviť
                  </button>
                )}

                <button
                  onClick={() => remove(s.id)}
                  style={{ marginLeft: 10 }}
                >
                  Vymazať
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}