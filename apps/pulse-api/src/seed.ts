import 'dotenv/config';
import mongoose from 'mongoose';
import { connectToDatabase } from './db.js';
import { Team, Player, Round } from './models.js';

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clubduty-pulse';
  await connectToDatabase(uri);

  await Promise.all([
    Team.deleteMany({}),
    Player.deleteMany({}),
    Round.deleteMany({}),
  ]);

  const team = await Team.create({ name: 'Pulse U15', joinCode: 'U15-TEST' });
  const players = await Player.insertMany([
    { teamId: team._id, firstName: 'Alex', token: '111111', isCoach: true },
    { teamId: team._id, firstName: 'Sam', token: '222222' },
    { teamId: team._id, firstName: 'Bo', token: '333333' },
    { teamId: team._id, firstName: 'Eli', token: '444444' },
  ]);

  const round = await Round.create({ teamId: team._id, title: 'Seizoenstart', status: 'open' });

  console.log('Seeded:', { team: team.name, players: players.length, round: round.title });
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
