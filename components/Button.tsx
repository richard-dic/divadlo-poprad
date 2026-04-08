type Variant = "primary" | "secondary" | "ghost"

export default function Button({
  children,
  variant = "primary"
}: {
  children: React.ReactNode
  variant?: Variant
}) {
  let styles = {}

  if (variant === "primary") {
    styles = {
      background: "var(--color-primary)",
      color: "white"
    }
  }

  if (variant === "secondary") {
    styles = {
      background: "var(--color-secondary)",
      color: "white"
    }
  }

  if (variant === "ghost") {
    styles = {
      background: "var(--color-text-muted)",
      color: "white"
    }
  }

  return (
    <button
      style={{
        ...styles,
        padding: "10px 20px",
        borderRadius: "var(--radius-md)",
        border: "none",
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      {children}
    </button>
  )
}