import { Schema, model, type Model, type Types, type Document } from 'mongoose'

export interface TeamDoc extends Document {
  name: string
  code: string
  token: string
  players: Types.ObjectId[]
  rounds: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const TeamSchema = new Schema<TeamDoc>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    code: { type: String, required: true, trim: true, uppercase: true, minlength: 3, maxlength: 16, unique: true },
    token: { type: String, required: true },
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    rounds: [{ type: Schema.Types.ObjectId, ref: 'Round' }],
  },
  { timestamps: true }
)

TeamSchema.index({ code: 1 }, { unique: true })

export const Team: Model<TeamDoc> = model<TeamDoc>('Team', TeamSchema)


