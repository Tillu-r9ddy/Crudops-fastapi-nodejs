import type { Backend, Task, TaskCreatePayload, TaskUpdatePayload } from "./types"

const BASE: Record<Backend, string> = {
  fastapi: "http://127.0.0.1:8000",
  nodejs: "http://127.0.0.1:3001",
}

async function request<T>(backend: Backend, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE[backend]}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (res.status === 204) return undefined as T
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`)
  return data
}

export const api = {
  getTasks: (b: Backend) =>
    request<Task[]>(b, "/tasks"),

  createTask: (b: Backend, payload: TaskCreatePayload) =>
    request<Task>(b, "/tasks", { method: "POST", body: JSON.stringify(payload) }),

  updateTask: (b: Backend, id: number, payload: TaskUpdatePayload) =>
    request<Task>(b, `/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  deleteTask: (b: Backend, id: number) =>
    request<void>(b, `/tasks/${id}`, { method: "DELETE" }),
}
