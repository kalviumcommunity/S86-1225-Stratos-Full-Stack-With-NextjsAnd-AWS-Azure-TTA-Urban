import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  head?: mongoose.Types.ObjectId;
  officers: mongoose.Types.ObjectId[];
  categories: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    head: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    officers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    categories: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index
DepartmentSchema.index({ name: 1 });

const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
