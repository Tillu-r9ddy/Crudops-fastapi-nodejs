import { useCallback, useEffect, useState } from "react"
import type { Backend, Task } from "./types"
import { api } from "./api"
import TaskForm from "./components/TaskForm"
import TaskList from "./components/TaskList"

const BACKENDS: Record<Backend, { label: string; port: number; color: string }> = {
  fastapi: { label: "FastAPI", port: 8000, color: "#009688" },
  nodejs:  { label: "Node.js", port: 3001, color: "#3c873a" },
}

export default function App() {
  const [backend, setBackend]   = useState<Backend>("fastapi")
  const [tasks, setTasks]       = useState<Task[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const cfg = BACKENDS[backend]

  // --- data fetching ---

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTasks(await api.getTasks(backend))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }, [backend])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // --- mutations ---

  async function handleCreate(title: string, description: string) {
    try {
      const task = await api.createTask(backend, { title, description })
      setTasks(prev => [task, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
    }
  }

  async function handleToggle(id: number, completed: boolean) {
    try {
      const updated = await api.updateTask(backend, id, { completed })
      setTasks(prev => prev.map(t => t.id === id ? updated : t))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
    }
  }

  async function handleEdit(id: number, title: string, description: string) {
    try {
      const updated = await api.updateTask(backend, id, { title, description })
      setTasks(prev => prev.map(t => t.id === id ? updated : t))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteTask(backend, id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task")
    }
  }

  // --- render ---

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{
        background: cfg.color,
        color: "white",
        padding: "0.9rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.3px" }}>CrudOps</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>React + {cfg.label} + SQLite</div>
        </div>

        {/* Backend toggle */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {(Object.keys(BACKENDS) as Backend[]).map(b => (
            <button
              key={b}
              onClick={() => setBackend(b)}
              style={{
                padding: "0.35rem 0.9rem",
                borderRadius: "999px",
                border: "2px solid white",
                background: backend === b ? "white" : "transparent",
                color: backend === b ? cfg.color : "white",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.82rem",
                transition: "all 0.15s",
              }}
            >
              {BACKENDS[b].label}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <main style={{ maxWidth: "680px", margin: "1.5rem auto", padding: "0 1rem" }}>

        {/* Active backend info */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "0.6rem 1rem",
          marginBottom: "0.9rem",
          fontSize: "0.8rem",
          color: "#666",
          borderLeft: `4px solid ${cfg.color}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <strong style={{ color: cfg.color }}>{cfg.label}</strong>
          &nbsp;→&nbsp;
          <code style={{ background: "#f5f5f5", padding: "0.1rem 0.4rem", borderRadius: "3px" }}>
            http://127.0.0.1:{cfg.port}/tasks
          </code>
          &nbsp;— switch the toggle above to compare both backends on the same data.
        </div>

        <TaskForm onSubmit={handleCreate} accentColor={cfg.color} />

        {error && (
          <div style={{
            background: "#ffebee", color: "#c62828",
            padding: "0.7rem 1rem", borderRadius: "8px",
            marginBottom: "0.9rem", fontSize: "0.88rem",
          }}>
            {error}
          </div>
        )}

        <TaskList
          tasks={tasks}
          loading={loading}
          accentColor={cfg.color}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={fetchTasks}
        />
      </main>
    </div>
  )
}
