import { Schema, model, type Model, type Types, type Document } from 'mongoose'

export interface AssignmentDoc extends Document {
  round: Types.ObjectId
  rater: Types.ObjectId
  ratees: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const AssignmentSchema = new Schema<AssignmentDoc>(
  {
    round: { type: Schema.Types.ObjectId, ref: 'Round', required: true, index: true },
    rater: { type: Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
    ratees: [{ type: Schema.Types.ObjectId, ref: 'Player', required: true }],
  },
  { timestamps: true }
)

AssignmentSchema.index({ round: 1, rater: 1 }, { unique: true })

export const Assignment: Model<AssignmentDoc> = model<AssignmentDoc>('Assignment', AssignmentSchema)


