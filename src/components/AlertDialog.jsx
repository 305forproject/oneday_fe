export default function AlertDialog({ open, onOpenChange, children }) {
  if (!open) return null
  return children
}
