import { Schema, model, type Model, type Types, type Document } from 'mongoose'

export type RoundStatus = 'OPEN' | 'CLOSED' | 'DRAFT'

export interface RoundDoc extends Document {
  name: string
  team: Types.ObjectId
  status: RoundStatus
  startDate?: Date
  endDate?: Date
  assignments: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const RoundSchema = new Schema<RoundDoc>(
  {
    name: { type: String, required: true, trim: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    status: { type: String, enum: ['OPEN', 'CLOSED', 'DRAFT'], default: 'DRAFT', index: true },
    startDate: { type: Date },
    endDate: { type: Date },
    assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],
  },
  { timestamps: true }
)

RoundSchema.index({ team: 1, status: 1 })

export const Round: Model<RoundDoc> = model<RoundDoc>('Round', RoundSchema)


