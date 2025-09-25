import { Schema, model, type Model, type Types, type Document } from 'mongoose'

export interface SummaryPlayerDoc extends Document {
  player: Types.ObjectId
  round: Types.ObjectId
  strengths: string[]
  improvements: string[]
  createdAt: Date
  updatedAt: Date
}

const SummaryPlayerSchema = new Schema<SummaryPlayerDoc>(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
    round: { type: Schema.Types.ObjectId, ref: 'Round', required: true, index: true },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
  },
  { timestamps: true }
)

SummaryPlayerSchema.index({ player: 1, round: 1 }, { unique: true })

export const SummaryPlayer: Model<SummaryPlayerDoc> = model<SummaryPlayerDoc>('SummaryPlayer', SummaryPlayerSchema)


