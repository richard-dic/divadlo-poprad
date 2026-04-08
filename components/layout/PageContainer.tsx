export default function PageContainer({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: "relative",
        marginTop: -60,
        paddingTop: 60,
        zIndex: 2
      }}
    >
      {/* 🔥 TIEŇ SMEROM DO HEADERA */}
      <div
        style={{
          position: "absolute",
          top: 45,
          left: 0,
          width: "100%",
          height: 15,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0))"
        }}
      />

      {children}
    </div>
  )
}