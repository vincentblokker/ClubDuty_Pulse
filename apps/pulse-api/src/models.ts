import mongoose, { Schema } from 'mongoose';

export interface TeamDoc extends mongoose.Document {
  name: string;
  joinCode: string;
}

export const TeamSchema = new Schema<TeamDoc>({
  name: { type: String, required: true },
  joinCode: { type: String, required: true, unique: true },
});
export const Team = mongoose.model<TeamDoc>('Team', TeamSchema);

export interface PlayerDoc extends mongoose.Document {
  teamId: mongoose.Types.ObjectId;
  firstName: string;
  token: string;
  isCoach?: boolean;
}

export const PlayerSchema = new Schema<PlayerDoc>({
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', index: true, required: true },
  firstName: { type: String, required: true },
  token: { type: String, required: true },
  isCoach: { type: Boolean, default: false },
});
export const Player = mongoose.model<PlayerDoc>('Player', PlayerSchema);

export interface RoundDoc extends mongoose.Document {
  teamId: mongoose.Types.ObjectId;
  title: string;
  status: 'open' | 'closed';
  createdAt: Date;
}

export const RoundSchema = new Schema<RoundDoc>({
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', index: true, required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  createdAt: { type: Date, default: Date.now },
});
export const Round = mongoose.model<RoundDoc>('Round', RoundSchema);

export interface AssignmentDoc extends mongoose.Document {
  roundId: mongoose.Types.ObjectId;
  raterId: mongoose.Types.ObjectId;
  rateeId: mongoose.Types.ObjectId;
}

export const AssignmentSchema = new Schema<AssignmentDoc>({
  roundId: { type: Schema.Types.ObjectId, ref: 'Round', index: true, required: true },
  raterId: { type: Schema.Types.ObjectId, ref: 'Player', index: true, required: true },
  rateeId: { type: Schema.Types.ObjectId, ref: 'Player', index: true, required: true },
});
export const Assignment = mongoose.model<AssignmentDoc>('Assignment', AssignmentSchema);

export interface FeedbackDoc extends mongoose.Document {
  roundId: mongoose.Types.ObjectId;
  raterId: mongoose.Types.ObjectId;
  rateeId: mongoose.Types.ObjectId;
  strengths: [string, string];
  improve: string;
  createdAt: Date;
}

export const FeedbackSchema = new Schema<FeedbackDoc>({
  roundId: { type: Schema.Types.ObjectId, ref: 'Round', index: true, required: true },
  raterId: { type: Schema.Types.ObjectId, ref: 'Player', index: true, required: true },
  rateeId: { type: Schema.Types.ObjectId, ref: 'Player', index: true, required: true },
  strengths: { type: [String], validate: (v: string[]) => v.length === 2, required: true },
  improve: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const Feedback = mongoose.model<FeedbackDoc>('Feedback', FeedbackSchema);
