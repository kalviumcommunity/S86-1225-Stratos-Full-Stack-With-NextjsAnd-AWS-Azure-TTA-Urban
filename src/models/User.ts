import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/utils/constants';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  phone?: string; // Optional for OAuth users
  role: UserRole;
  address?: string;
  department?: string;
  isActive: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Ensure email is unique
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Not required for OAuth users
      select: false,
    },
    phone: {
      type: String,
      required: false, // Not required for OAuth users
    },
    role: {
      type: String,
      required: true,
      enum: ['CITIZEN', 'OFFICER', 'ADMIN'],
      default: 'CITIZEN',
    },
    address: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
