import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from "react-markdown"

export default async function BlogDetail({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({
    where: { slug }
  })

  if (!post) {
    return <div style={{ padding: 40 }}>Článok neexistuje</div>
  }

  return (
    <div className="container section" style={{ maxWidth: 900 }}>
      <Link
        href="/blog"
        style={{
          textDecoration: "none",
          color: "var(--color-accent-light)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 16
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
        <span>Späť na blog</span>
      </Link>

      <h1 className="headingPrimary" style={{ marginBottom: 10 }}>
        {post.title}
      </h1>

      <p className="blogItemDate" style={{ marginTop: 0, marginBottom: 24 }}>
        Publikované: {new Date(post.publishedAt).toLocaleDateString("sk-SK")}
      </p>

      {post.heroImage && (
        <div
          style={{
            width: "100%",
            marginBottom: 30,
            overflow: "hidden",
            borderRadius: 12,
            background: "#f3f3f3",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}
        >
          <Image
            src={post.heroImage || "/default.jpg"}
            alt={post.title}
            width={1200}
            height={700}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "cover",
              borderRadius: 12
            }}
          />
        </div>
      )}

      <div
        style={{
          lineHeight: 1.7,
          fontSize: 16
        }}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p style={{ marginTop: 12, textAlign: "justify" }}>{children}</p>
            ),
            strong: ({ children }) => (
              <strong style={{ fontWeight: 700 }}>{children}</strong>
            ),
            em: ({ children }) => (
              <em style={{ fontStyle: "italic" }}>{children}</em>
            ),
            h2: ({ children }) => (
              <h2 className="headingSecondary" style={{ marginTop: 30 }}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="headingTertiary" style={{ marginTop: 20 }}>{children}</h3>
            ),
            ul: ({ children }) => (
              <ul style={{ marginTop: 10, paddingLeft: 20 }}>{children}</ul>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: 6 }}>{children}</li>
            )
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}