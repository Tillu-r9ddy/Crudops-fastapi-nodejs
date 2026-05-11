import type { Task } from "../types"
import TaskItem from "./TaskItem"

interface Props {
  tasks: Task[]
  loading: boolean
  accentColor: string
  onToggle: (id: number, completed: boolean) => void
  onEdit: (id: number, title: string, description: string) => void
  onDelete: (id: number) => void
  onRefresh: () => void
}

export default function TaskList({ tasks, loading, accentColor, onToggle, onEdit, onDelete, onRefresh }: Props) {
  const done = tasks.filter(t => t.completed).length

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem", color: "#444" }}>
          Tasks{!loading && ` — ${tasks.length - done} open, ${done} done`}
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            background: "transparent",
            border: `1px solid ${accentColor}`,
            color: accentColor,
            padding: "0.28rem 0.75rem",
            borderRadius: "5px",
            cursor: loading ? "default" : "pointer",
            fontSize: "0.8rem",
          }}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {loading && tasks.length === 0 ? (
        <div style={empty}>Fetching tasks…</div>
      ) : tasks.length === 0 ? (
        <div style={empty}>No tasks yet. Add one above!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              accentColor={accentColor}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const empty: React.CSSProperties = {
  textAlign: "center",
  padding: "2.5rem 1rem",
  color: "#bbb",
  background: "white",
  borderRadius: "8px",
  fontSize: "0.9rem",
}
