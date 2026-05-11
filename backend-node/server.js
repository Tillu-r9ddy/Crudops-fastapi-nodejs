const express  = require("express")
const cors     = require("cors")
const Database = require("better-sqlite3")
const path     = require("path")

// ---------------------------------------------------------------------------
// Database setup — shared tasks.db at project root (same file as FastAPI)
// ---------------------------------------------------------------------------

const db = new Database(path.join(__dirname, "../tasks.db"))

// WAL mode allows concurrent access alongside the FastAPI process
db.pragma("journal_mode = WAL")

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    completed   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  )
`)

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app  = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Normalise SQLite's integer 0/1 to JS boolean for the frontend
function normalise(task) {
  return { ...task, completed: Boolean(task.completed) }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get("/", (_req, res) => {
  res.json({ msg: "CrudOps Node.js is running" })
})

app.get("/tillu", (_req, res) => {
  res.json({ msg: "Hello tilak from Node.js!" })
})

// GET /tasks — all tasks, newest first
app.get("/tasks", (_req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all()
  res.json(tasks.map(normalise))
})

// GET /tasks/:id — single task
app.get("/tasks/:id", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id)
  if (!task) return res.status(404).json({ error: "Task not found" })
  res.json(normalise(task))
})

// POST /tasks — create
app.post("/tasks", (req, res) => {
  const { title, description = "" } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "title is required" })
  }
  const result = db
    .prepare("INSERT INTO tasks (title, description) VALUES (?, ?)")
    .run(title.trim(), description.trim())
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid)
  res.status(201).json(normalise(task))
})

// PUT /tasks/:id — update (partial)
app.put("/tasks/:id", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id)
  if (!task) return res.status(404).json({ error: "Task not found" })

  const title       = req.body.title       ?? task.title
  const description = req.body.description ?? task.description
  const completed   = req.body.completed   !== undefined
    ? (req.body.completed ? 1 : 0)
    : task.completed

  db.prepare("UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?")
    .run(title, description, completed, req.params.id)

  res.json(normalise(db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id)))
})

// DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id)
  if (!task) return res.status(404).json({ error: "Task not found" })
  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id)
  res.status(204).send()
})

// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Express server running at http://127.0.0.1:${PORT}`)
})
