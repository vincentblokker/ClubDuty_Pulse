import { Schema, model, type Model, type Types, type Document } from 'mongoose'

export interface PlayerDoc extends Document {
  name: string
  email?: string
  team: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PlayerSchema = new Schema<PlayerDoc>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, match: /.+@.+\..+/ },
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  },
  { timestamps: true }
)

PlayerSchema.index({ team: 1, name: 1 })

export const Player: Model<PlayerDoc> = model<PlayerDoc>('Player', PlayerSchema)


