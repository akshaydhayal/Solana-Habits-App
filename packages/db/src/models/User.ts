import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Omit<Document, '_id'> {
  _id: string; // From better-auth
  name: string;
  email: string | null;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  dob?: string | null;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    image: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // Custom Fields
    dob: { type: String, default: null },
  },
  { timestamps: true }
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
