export type Backend = "fastapi" | "nodejs"

export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  created_at: string
}

export interface TaskCreatePayload {
  title: string
  description: string
}

export interface TaskUpdatePayload {
  title?: string
  description?: string
  completed?: boolean
}
