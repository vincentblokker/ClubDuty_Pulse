import { Schema, model, type Model, type Types, type Document } from 'mongoose'

export interface FeedbackDoc extends Document {
  assignment: Types.ObjectId
  ratee: Types.ObjectId
  strengths: string[]
  improvement: string
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema<FeedbackDoc>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    ratee: { type: Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
    strengths: { type: [String], validate: [(arr: string[]) => arr.length === 2, 'Exactly two strengths required'] },
    improvement: { type: String, required: true, minlength: 2, maxlength: 280 },
  },
  { timestamps: true }
)

FeedbackSchema.index({ assignment: 1, ratee: 1 }, { unique: true })

export const Feedback: Model<FeedbackDoc> = model<FeedbackDoc>('Feedback', FeedbackSchema)


