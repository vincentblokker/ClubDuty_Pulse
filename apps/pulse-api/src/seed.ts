import dotenv from 'dotenv'
import mongoose, { Types } from 'mongoose'
import { Team } from './models/Team'
import { Player } from './models/Player'

dotenv.config()

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')
  await mongoose.connect(uri)

  const teamCode = 'ABC123'
  const teamToken = 'demo-token'

  let team = await Team.findOne({ code: teamCode })
  if (!team) {
    team = await Team.create({ name: 'Demo Team', code: teamCode, token: teamToken, players: [], rounds: [] })
  } else {
    team.token = teamToken
    await team.save()
  }

  const players = [
    { name: 'Alice Example', team: team._id },
    { name: 'Bob Example', team: team._id },
    { name: 'Charlie Example', team: team._id },
  ]

  const created = await Player.insertMany(players)
  team.players = created.map((p) => new Types.ObjectId(String(p._id)))
  await team.save()

  console.log('Seed complete:')
  console.log('- teamCode:', teamCode)
  console.log('- token   :', teamToken)

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
