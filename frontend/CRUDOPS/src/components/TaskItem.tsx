import { useState } from "react"
import type { Task } from "../types"

interface Props {
  task: Task
  accentColor: string
  onToggle: (id: number, completed: boolean) => void
  onEdit: (id: number, title: string, description: string) => void
  onDelete: (id: number) => void
}

export default function TaskItem({ task, accentColor, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description)

  function saveEdit() {
    if (!editTitle.trim()) return
    onEdit(task.id, editTitle.trim(), editDesc.trim())
    setEditing(false)
  }

  function cancelEdit() {
    setEditTitle(task.title)
    setEditDesc(task.description)
    setEditing(false)
  }

  const formattedDate = task.created_at
    ? new Date(task.created_at.endsWith("Z") ? task.created_at : task.created_at + "Z").toLocaleString()
    : ""

  if (editing) {
    return (
      <div style={card}>
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          style={inputStyle}
          autoFocus
        />
        <input
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          placeholder="Description"
          style={{ ...inputStyle, marginTop: "0.4rem" }}
        />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
          <button onClick={saveEdit} style={smallBtn(accentColor)}>Save</button>
          <button onClick={cancelEdit} style={smallBtn("#9e9e9e")}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...card, opacity: task.completed ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id, !task.completed)}
          style={{ marginTop: "3px", cursor: "pointer", accentColor } as React.CSSProperties}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            color: "#222",
            textDecoration: task.completed ? "line-through" : "none",
            wordBreak: "break-word",
          }}>
            {task.title}
          </div>
          {task.description && (
            <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "2px", wordBreak: "break-word" }}>
              {task.description}
            </div>
          )}
          <div style={{ fontSize: "0.72rem", color: "#bbb", marginTop: "5px" }}>{formattedDate}</div>
        </div>
        <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
          <button onClick={() => setEditing(true)} style={smallBtn("#607d8b")}>Edit</button>
          <button onClick={() => onDelete(task.id)} style={smallBtn("#ef5350")}>Delete</button>
        </div>
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: "white",
  borderRadius: "8px",
  padding: "0.9rem 1rem",
  boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "0.5rem 0.65rem",
  borderRadius: "5px",
  border: "1px solid #ddd",
  fontSize: "0.9rem",
  boxSizing: "border-box",
}

const smallBtn = (bg: string): React.CSSProperties => ({
  background: bg,
  color: "white",
  border: "none",
  padding: "0.28rem 0.65rem",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "0.78rem",
  fontWeight: 600,
})
