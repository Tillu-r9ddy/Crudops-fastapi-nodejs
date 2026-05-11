import { useState } from "react"

interface Props {
  onSubmit: (title: string, description: string) => void
  accentColor: string
}

export default function TaskForm({ onSubmit, accentColor }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit(title.trim(), description.trim())
    setTitle("")
    setDescription("")
  }

  return (
    <form onSubmit={handleSubmit} style={card}>
      <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem", color: "#333" }}>Add New Task</h2>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title *"
        required
        style={input}
      />
      <input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        style={{ ...input, marginTop: "0.4rem" }}
      />
      <button type="submit" style={btn(accentColor)}>
        Add Task
      </button>
    </form>
  )
}

const card: React.CSSProperties = {
  background: "white",
  borderRadius: "10px",
  padding: "1.25rem",
  marginBottom: "1rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
}

const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "0.55rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "0.9rem",
  boxSizing: "border-box",
}

const btn = (bg: string): React.CSSProperties => ({
  marginTop: "0.75rem",
  background: bg,
  color: "white",
  border: "none",
  padding: "0.55rem 1.4rem",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.9rem",
})
