import express = require('express')
import cors = require('cors')
import dotenv = require('dotenv')
import { initDb } from './db'
import { authRouter } from './routes/auth'
import { roundsRouter } from './routes/rounds'
import { feedbackRouter } from './routes/feedback'
import { debugRouter } from './routes/debug'

dotenv.config({ path: process.cwd() + '/.env' })
const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT) || 5011

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRouter)
app.use('/rounds', roundsRouter)
app.use('/feedback', feedbackRouter)
app.use('/debug', debugRouter)

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
