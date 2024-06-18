import { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  address: string;
  apiKey: string;
  webhookUrl: string;
}

export const UserSchema = new Schema<IUser>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
    },
    webhookUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);
