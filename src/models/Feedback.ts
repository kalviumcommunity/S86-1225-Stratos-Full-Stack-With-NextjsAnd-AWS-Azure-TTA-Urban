import mongoose from 'mongoose';

export interface IFeedback extends mongoose.Document {
  complaintId: mongoose.Types.ObjectId;
  citizenId: mongoose.Types.ObjectId;
  officerId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      unique: true, // One feedback per complaint
      index: true
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: 300,
      trim: true
    }
  },
  { 
    timestamps: true,
    collection: 'feedbacks'
  }
);

// Index for admin analytics queries
FeedbackSchema.index({ officerId: 1, rating: 1, createdAt: -1 });

// Index for low rating alerts
FeedbackSchema.index({ rating: 1, createdAt: -1 });

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
