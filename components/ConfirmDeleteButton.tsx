"use client"

type Props = {
  children: React.ReactNode
}

export default function ConfirmDeleteButton({ children }: Props) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!confirm("Naozaj chcete vymazať tento dopyt?")) {
      e.preventDefault()
    }
  }

  return (
    <button onClick={handleClick} className="secondaryBtn">
      {children}
    </button>
  )
}