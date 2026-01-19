import mongoose, { Schema, Document, Model } from 'mongoose';
import { ComplaintStatus, ComplaintCategory } from '@/utils/constants';

export interface IComplaint extends Document {
  _id: mongoose.Types.ObjectId;
  complaintId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: ComplaintStatus;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  officerComments?: Array<{
    comment: string;
    addedBy: mongoose.Types.ObjectId;
    addedAt: Date;
  }>;
  statusHistory: Array<{
    status: ComplaintStatus;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    notes?: string;
  }>;
  resolutionProof?: string[];
  resolutionNotes?: string;
  resolvedAt?: Date;
  slaDeadline: Date;
  isSlaMet?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Road & Infrastructure',
        'Water Supply',
        'Electricity',
        'Garbage Collection',
        'Street Lighting',
        'Drainage',
        'Public Property Damage',
        'Noise Pollution',
        'Air Pollution',
        'Other',
      ],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5;
        },
        message: 'Maximum 5 images allowed',
      },
    },
    location: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'],
      default: 'NEW',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAt: {
      type: Date,
    },
    officerComments: [
      {
        comment: {
          type: String,
          required: true,
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    resolutionProof: {
      type: [String],
      default: [],
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    slaDeadline: {
      type: Date,
      required: true,
    },
    isSlaMet: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ComplaintSchema.index({ complaintId: 1 });
ComplaintSchema.index({ createdBy: 1 });
ComplaintSchema.index({ assignedTo: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ category: 1 });
ComplaintSchema.index({ createdAt: -1 });

const Complaint: Model<IComplaint> =
  mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;
