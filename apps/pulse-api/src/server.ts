import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDb } from './db'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT) || 5011

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' })
})

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[pulse-api] listening on http://localhost:${PORT}`)
    })
  })
  .catch((e) => {
    console.error('[db] failed to connect', e)
    process.exit(1)
  })
