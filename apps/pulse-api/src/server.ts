import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT) || 5011

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log()
})
