import PageContainer from "@/components/layout/PageContainer"
import Hero from "@/components/home/Hero"
import UpcomingSection from "@/components/home/UpcomingSection"
import BlogSection from "@/components/home/BlogSection"
import ProgramSection from "@/components/home/ProgramSection"

export default function HomePage() {
  return (
    <PageContainer>
      <Hero />

      <div className="container" style={{ paddingBottom: 40 }}>

        {/* GRID (desktop layout) */}
        <div className="homeGrid">

          {/* LEFT */}
          <div>
            <UpcomingSection />
          </div>

          {/* RIGHT (desktop only) */}
          <div className="desktopBlog">
            <BlogSection />
          </div>

        </div>

        {/* PROGRAM */}
        <ProgramSection />

        {/* BLOG POD PROGRAMOM (mobile + tablet) */}
        <div className="mobileBlog">
          <BlogSection />
        </div>

      </div>
    </PageContainer>
  )
}