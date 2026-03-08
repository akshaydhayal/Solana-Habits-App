import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IHabitDay {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface IHabit extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  frequency: string[]; // e.g. ['Mon', 'Tue'] or ['Daily']
  color?: string;
  history: IHabitDay[];
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    description: { type: String },
    frequency: { type: [String], default: ['Daily'] },
    color: { type: String, default: '#4CAF50' },
    history: [
      {
        date: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

export const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema)
