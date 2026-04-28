import { useState } from "react"

type FetchState = {
  message: string | null
  loading: boolean
  error: string | null
}

const initialState: FetchState = { message: null, loading: false, error: null }

function App() {
  const [fastapi, setFastapi] = useState<FetchState>(initialState)
  const [node, setNode] = useState<FetchState>(initialState)
  const [streamChunks, setStreamChunks] = useState<string[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)

  const fetchFrom = async (
    url: string,
    setState: React.Dispatch<React.SetStateAction<FetchState>>
  ) => {
    setState({ message: null, loading: true, error: null })
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
      const data = await res.json()
      setState({ message: data.msg, loading: false, error: null })
    } catch (err) {
      setState({
        message: null,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  const fetchStream = async () => {
    setStreamChunks([])
    setStreamError(null)
    setStreaming(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/stream")
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true }).trim()
        if (text) setStreamChunks((prev) => [...prev, text])
      }
    } catch (err) {
      setStreamError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      <div>
        <button
          onClick={() => fetchFrom("http://127.0.0.1:8000/tillu", setFastapi)}
          disabled={fastapi.loading}
        >
          {fastapi.loading ? "Loading..." : "Fetch from FastAPI"}
        </button>
        {fastapi.message && <p style={{ color: "green" }}>FastAPI: {fastapi.message}</p>}
        {fastapi.error && <p style={{ color: "red" }}>Error: {fastapi.error}</p>}
      </div>

      <div>
        <button
          onClick={() => fetchFrom("http://127.0.0.1:3001/tillu", setNode)}
          disabled={node.loading}
        >
          {node.loading ? "Loading..." : "Fetch from Node.js"}
        </button>
        {node.message && <p style={{ color: "blue" }}>Node.js: {node.message}</p>}
        {node.error && <p style={{ color: "red" }}>Error: {node.error}</p>}
      </div>

      <div>
        <button onClick={fetchStream} disabled={streaming}>
          {streaming ? "Streaming..." : "Start Stream (FastAPI yield)"}
        </button>
        {streamError && <p style={{ color: "red" }}>Error: {streamError}</p>}
        {streamChunks.length > 0 && (
          <div style={{ marginTop: "0.75rem", background: "#1e1e1e", color: "#00ff99", padding: "1rem", borderRadius: "6px", fontFamily: "monospace" }}>
            {streamChunks.map((chunk, i) => (
              <div key={i}>{chunk}</div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default App
