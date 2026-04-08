import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" }
  })

  return (
    <div className="container section">
      <h1 className="headingPrimary">DIVADLENÝ BLOG</h1>

      <div className="blogList blogResponsive">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="blogCard"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,220px) 1fr",
                gap: 20,
                alignItems: "start",
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  borderRadius: 10,
                  background: "#f3f3f3"
                }}
              >
                <Image
                  src={post.coverImage || "/default.jpg"}
                  alt={post.title}
                  width={400}
                  height={400}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              </div>

              <div>
                <h2 className="blogItemTitle" style={{ marginTop: 0 }}>
                  {post.title}
                </h2>

                <p className="blogItemDate" style={{ marginTop: 4 }}>
                  Publikované: {new Date(post.publishedAt).toLocaleDateString("sk-SK")}
                </p>

                <p className="blogItemExcerpt" style={{ marginTop: 25 }}>
                  {post.excerpt}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}