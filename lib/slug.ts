export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD") // odstráni diakritiku
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}