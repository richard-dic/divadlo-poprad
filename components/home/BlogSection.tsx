import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function BlogSection() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: 3
  })

  return (
    <div className="blogSection">
      
      {/* NADPIS */}
      <h2 className="headingSecondary" style={{ marginBottom: 10 }}>
        Z DIVADLENÉHO ZÁKULISIA
      </h2>

      {/* LIST */}
      <div className="blogList">
        {posts.map((p) => {
          const formattedDate = new Date(p.publishedAt).toLocaleDateString("sk-SK", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })

          return (
            <Link key={p.id} href={`/blog/${p.slug}`}>
              <div style={{ cursor: "pointer" }}>
                
                <div className="programTitle">
                  {p.title}
                </div>

                <div className="programDay">
                  {formattedDate}
                </div>

              </div>
            </Link>
          )
        })}
      </div>

      {/* BUTTON */}
      <Link href="/blog">
        <button className="primaryBtn blogBtn">
          Divadelný blog
        </button>
      </Link>
    </div>
  )
}