import { Schema, model, type Model, type Types, type Document } from 'mongoose'

export interface SummaryThemeItem {
  name: string
  count: number
  examples: string[]
}

export interface SummaryTeamDoc extends Document {
  round: Types.ObjectId
  themes: SummaryThemeItem[]
  createdAt: Date
  updatedAt: Date
}

const SummaryTeamSchema = new Schema<SummaryTeamDoc>(
  {
    round: { type: Schema.Types.ObjectId, ref: 'Round', required: true, unique: true, index: true },
    themes: [
      {
        name: { type: String, required: true },
        count: { type: Number, required: true, min: 0 },
        examples: { type: [String], default: [] },
      },
    ],
  },
  { timestamps: true }
)

export const SummaryTeam: Model<SummaryTeamDoc> = model<SummaryTeamDoc>('SummaryTeam', SummaryTeamSchema)


