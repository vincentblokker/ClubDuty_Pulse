import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

export async function initDb(): Promise<void> {
  if (!MONGODB_URI) {
    console.error('[db] MONGODB_URI is not set')
    return
  }
  let attempts = 0
  const maxAttempts = 5
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
  while (attempts < maxAttempts) {
    try {
      await mongoose.connect(MONGODB_URI)
      console.log('[db] connected')
      return
    } catch (err) {
      attempts++
      console.error(`[db] connection failed (attempt ${attempts}/${maxAttempts})`, err)
      if (attempts >= maxAttempts) {
        throw err
      }
      await delay(1000 * attempts)
    }
  }
}
