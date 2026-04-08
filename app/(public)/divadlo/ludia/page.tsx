import { prisma } from "@/lib/prisma"
import {
  PERSON_CATEGORY_LABELS,
  PERSON_CATEGORY_OPTIONS
} from "@/lib/personCategories"
import Image from "next/image"

export default async function PublicPeoplePage() {
  const people = await prisma.person.findMany({
    where: {
      visible: true
    },
    orderBy: [
      { category: "asc" },
      { sortOrder: "asc" },
      { fullName: "asc" }
    ]
  })

  const grouped = PERSON_CATEGORY_OPTIONS
    .map((category) => ({
      category,
      label: PERSON_CATEGORY_LABELS[category],
      people: people.filter((p) => p.category === category)
    }))
    .filter((group) => group.people.length > 0)

  return (
    <div className="container section">
      <h1 className="headingPrimary">ĽUDIA DIVADLA</h1>

      {grouped.map((group) => (
        <section key={group.category} style={{ marginTop: 40 }}>
          <h2 className="headingSecondary">{group.label}</h2>
          <div
            className="peopleGrid"
          >
            {group.people.map((person) => (
              <div
                key={person.id}
                className="personCard"
              >
                <div
                  className="personImage"
                >
                  <Image
                    src={person.imageUrl || "/default.jpg"}
                    alt={person.fullName}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className={`personText ${person.bio ? "" : "centered"}`}>
                  <div className="personName">
                    {person.fullName}
                  </div>
                  <div className="personRole">
                    {person.roleLabel}
                  </div>
                  {person.bio && (
                    <div
                      className="personBio"
                    >
                      {person.bio}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}