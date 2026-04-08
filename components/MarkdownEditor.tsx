"use client"

import ReactMarkdown from "react-markdown"

type Props = {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder
}: Props) {
  return (
    <div className="formGroup" style={{ marginTop: 20 }}>
      <label>{label}</label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Použi: **bold**, *italic*"}
        className="input"
        style={{ minHeight: 180 }}
      />

      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 13,
          color: "#777",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          Náhľad
        </div>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 14,
            background: "#fff",
            lineHeight: 1.6
          }}
        >
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}