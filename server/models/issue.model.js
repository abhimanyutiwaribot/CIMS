import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    imageUrl: {
      type: String, // Cloudinary URL
      required: false, // Make this field optional
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    aiAnalysis: {
      incidentType: String,
      confidence: Number,
      textAnalysis: {
        issueType: String,
        severity: String,
        confidence: Number,
      },
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationNotes: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending_verification', 'verified', 'rejected', 'in_progress', 'resolved'],
      default: 'pending_verification'
    },
    updates: [{
      message: { type: String, required: true },
      status: { 
        type: String, 
        enum: ['pending_verification', 'verified', 'rejected', 'in_progress', 'resolved'],
        required: true 
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
  },
  { timestamps: true }
);

// Add index for geospatial queries
IssueSchema.index({ "location": "2dsphere" });

export default mongoose.model("Issue", IssueSchema);