const express = require("express")
const cors = require("cors")

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ msg: "welcome to express course" })
})

app.get("/tillu", (req, res) => {
  res.json({ msg: "Hello tilak from Node.js!" })
})

app.listen(PORT, () => {
  console.log(`Express server running at http://127.0.0.1:${PORT}`)
})
