"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import ImageUpload from "@/components/ImageUpload"
import {
  PERSON_CATEGORY_LABELS,
  PERSON_CATEGORY_OPTIONS
} from "@/lib/personCategories"

type Person = {
  id: number
  fullName: string
  roleLabel: string
  bio: string | null
  imageUrl: string | null
  category: string
  visible: boolean
  sortOrder: number
}

type PersonForm = {
  fullName: string
  roleLabel: string
  bio: string
  imageUrl: string
  category: string
  visible: boolean
  sortOrder: number
}

const EMPTY_FORM: PersonForm = {
  fullName: "",
  roleLabel: "",
  bio: "",
  imageUrl: "",
  category: "HERECKY_SUBOR",
  visible: true,
  sortOrder: 0
}

export default function AdminPeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<PersonForm>(EMPTY_FORM)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<PersonForm>(EMPTY_FORM)

  async function load() {
    const res = await fetch("/api/admin/people")
    const data: Person[] = await res.json()
    setPeople(data)
  }

  useEffect(() => {
    async function init() {
      await load()
    }

    void init()
  }, [])

  function validateForm(form: PersonForm) {
    if (!form.fullName.trim()) return "Meno a priezvisko je povinné"
    if (!form.roleLabel.trim()) return "Rola / označenie je povinné"
    if (!form.category.trim()) return "Kategória je povinná"
    if (Number.isNaN(form.sortOrder)) return "Poradie musí byť číslo"
    return null
  }

  async function createPerson() {
    const error = validateForm(createForm)

    if (error) {
      alert(error)
      return
    }

    const payload = {
      fullName: createForm.fullName.trim(),
      roleLabel: createForm.roleLabel.trim(),
      bio: createForm.bio.trim(),
      imageUrl: createForm.imageUrl.trim(),
      category: createForm.category,
      visible: createForm.visible,
      sortOrder: createForm.sortOrder
    }

    const res = await fetch("/api/admin/people", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const data: { error?: string } = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba pri vytváraní")
      return
    }

    setCreateForm(EMPTY_FORM)
    setShowCreate(false)
    await load()
  }

  function startEdit(person: Person) {
    setEditingId(person.id)
    setEditForm({
      fullName: person.fullName,
      roleLabel: person.roleLabel,
      bio: person.bio || "",
      imageUrl: person.imageUrl || "",
      category: person.category,
      visible: person.visible,
      sortOrder: person.sortOrder
    })
  }

  async function saveEdit(id: number) {
    const error = validateForm(editForm)

    if (error) {
      alert(error)
      return
    }

    const payload = {
      fullName: editForm.fullName.trim(),
      roleLabel: editForm.roleLabel.trim(),
      bio: editForm.bio.trim(),
      imageUrl: editForm.imageUrl.trim(),
      category: editForm.category,
      visible: editForm.visible,
      sortOrder: editForm.sortOrder
    }

    const res = await fetch(`/api/admin/people/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const data: { error?: string } = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba pri ukladaní")
      return
    }

    setEditingId(null)
    await load()
  }

  async function removePerson(id: number) {
    const ok = window.confirm("Naozaj chceš zmazať túto osobu?")
    if (!ok) return

    const res = await fetch(`/api/admin/people/${id}`, {
      method: "DELETE"
    })

    const data: { error?: string } = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba pri mazaní")
      return
    }

    setPeople((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="adminContainer">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        flexWrap: "wrap",
        gap: 12
      }}>
        <h1 className="headingPrimary" style={{ marginBottom: 0 }}>
          PREHĽAD ĽUDÍ
        </h1>

        <button
          className="primaryBtn"
          onClick={() => setShowCreate((prev) => !prev)}
        >
          {showCreate ? "Zavrieť formulár" : "Pridať človeka"}
        </button>
      </div>

      {showCreate && (
        <div
          style={{
            background: "#fff",
            padding: 24,
            marginBottom: 30,
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
            border: "1px solid #eee"
          }}
        >
          <h2
            className="headingSecondary"
            style={{ marginTop: 0, textAlign: "center" }}
          >
            Nový človek
          </h2>

          <div style={{ display: "grid", gap: 10, maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label className="formLabel">Meno a priezvisko</label>
                <input
                  className="input"
                  placeholder="Meno a priezvisko"
                  value={createForm.fullName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, fullName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="formLabel">Rola / označenie</label>
                <input
                  className="input"
                  placeholder="Rola / označenie"
                  value={createForm.roleLabel}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, roleLabel: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="formLabel">Krátky popis (voliteľné)</label>
              <textarea
                className="input"
                placeholder="Krátky popis (voliteľné)"
                value={createForm.bio}
                onChange={(e) =>
                  setCreateForm({ ...createForm, bio: e.target.value })
                }
              />
            </div>

            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                color: "#555",
                marginBottom: 6
              }}>
                Fotka
              </div>
              <ImageUpload
                value={createForm.imageUrl}
                onUpload={(url) =>
                  setCreateForm({ ...createForm, imageUrl: url })
                }
              />
              {createForm.imageUrl && (
                <div style={{
                  marginTop: 10,
                  width: 160,
                  height: 160,
                  position: "relative",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#f3f3f3",
                  marginLeft: "auto",
                  marginRight: "auto"
                }}>
                  <Image
                    src={createForm.imageUrl}
                    alt="Náhľad"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
              <div>
                <label className="formLabel">Kategória</label>
                <select
                  className="input"
                  value={createForm.category}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, category: e.target.value })
                  }
                >
                  {PERSON_CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {PERSON_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="formLabel">Poradie</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Poradie"
                  value={createForm.sortOrder}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      sortOrder: Number(e.target.value)
                    })
                  }
                />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                style={{ accentColor: "var(--primary)", width: 16, height: 16 }}
                checked={createForm.visible}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    visible: e.target.checked
                  })
                }
              />
              {" "}Viditeľný na webe
            </label>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <button className="primaryBtn" onClick={createPerson}>Uložiť</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 30 }}>
        {Object.entries(
          people.reduce((acc, person) => {
            if (!acc[person.category]) acc[person.category] = []
            acc[person.category].push(person)
            return acc
          }, {} as Record<string, Person[]>)
        ).map(([category, persons]) => (
          <div key={category}>
            <h2 className="headingSecondary" style={{ marginBottom: 16 }}>
              {PERSON_CATEGORY_LABELS[category as keyof typeof PERSON_CATEGORY_LABELS]}
            </h2>

            <div style={{ display: "grid", gap: 20 }}>
              {persons.map((person) => {
                const isEditing = editingId === person.id

                return (
                  <div
                    key={person.id}
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                      border: "1px solid #eee"
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: "grid", gap: 10, maxWidth: 600, margin: "0 auto" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <label className="formLabel">Meno a priezvisko</label>
                            <input
                              className="input"
                              value={editForm.fullName}
                              onChange={(e) =>
                                setEditForm({ ...editForm, fullName: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="formLabel">Rola / označenie</label>
                            <input
                              className="input"
                              value={editForm.roleLabel}
                              onChange={(e) =>
                                setEditForm({ ...editForm, roleLabel: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="formLabel">Krátky popis (voliteľné)</label>
                          <textarea
                            className="input"
                            value={editForm.bio}
                            onChange={(e) =>
                              setEditForm({ ...editForm, bio: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            color: "#555",
                            marginBottom: 6
                          }}>
                            Fotka
                          </div>
                          <ImageUpload
                            value={editForm.imageUrl}
                            onUpload={(url) =>
                              setEditForm({ ...editForm, imageUrl: url })
                            }
                          />
                          {editForm.imageUrl && (
                            <div style={{
                              marginTop: 10,
                              width: 160,
                              height: 160,
                              position: "relative",
                              borderRadius: 10,
                              overflow: "hidden",
                              background: "#f3f3f3",
                              marginLeft: "auto",
                              marginRight: "auto"
                            }}>
                              <Image
                                src={editForm.imageUrl}
                                alt="Náhľad"
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
                          <div>
                            <label className="formLabel">Kategória</label>
                            <select
                              className="input"
                              value={editForm.category}
                              onChange={(e) =>
                                setEditForm({ ...editForm, category: e.target.value })
                              }
                            >
                              {PERSON_CATEGORY_OPTIONS.map((category) => (
                                <option key={category} value={category}>
                                  {PERSON_CATEGORY_LABELS[category]}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="formLabel">Poradie</label>
                            <input
                              className="input"
                              type="number"
                              value={editForm.sortOrder}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  sortOrder: Number(e.target.value)
                                })
                              }
                            />
                          </div>
                        </div>

                        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="checkbox"
                            style={{ accentColor: "var(--primary)", width: 16, height: 16 }}
                            checked={editForm.visible}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                visible: e.target.checked
                              })
                            }
                          />
                          {" "}Viditeľný na webe
                        </label>

                        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10 }}>
                          <button className="primaryBtn" onClick={() => saveEdit(person.id)}>Uložiť</button>
                          <button className="secondaryBtn" onClick={() => setEditingId(null)}>Zrušiť</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px 1fr",
                          gap: 16,
                          alignItems: "start"
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: 120,
                            height: 120,
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "#f3f3f3"
                          }}
                        >
                          <Image
                            src={person.imageUrl || "/default.jpg"}
                            alt={person.fullName}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>

                        <div style={{ display: "grid", gap: 8 }}>
                          <div><b>{person.fullName}</b></div>
                          <div>{person.roleLabel}</div>
                          {person.bio && <div>{person.bio}</div>}
                          <div>Viditeľný: {person.visible ? "Áno" : "Nie"}</div>

                          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button className="secondaryBtn" onClick={() => startEdit(person)}>Upraviť</button>
                            <button className="primaryBtn" onClick={() => removePerson(person.id)}>
                              Vymazať
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}