import mongoose from "mongoose"

const EmailSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    clientName: {
      type: String,
      required: [true, "Please provide a client name"],
    },
    thumbnailImage: {
      type: String,
      required: [true, "Please provide a thumbnail image"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    emailType: {
      type: String,
      enum: ["Newsletter", "Marketing", "Transactional", "Promotional", "Other"],
      required: [true, "Please specify the email type"],
    },
    industry: {
      type: String,
      required: [true, "Please specify the industry"],
    },
    emailContent: {
      type: String,
      required: [true, "Please provide the email content"],
    },
    subject: {
      type: String,
      required: [true, "Please provide the email subject"],
    },
    results: {
      openRate: Number,
      clickRate: Number,
      conversionRate: Number,
      notes: String,
    },
    tags: [String],
    completionDate: {
      type: Date,
      default: Date.now,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Email || mongoose.model("Email", EmailSchema)

