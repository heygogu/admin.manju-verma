import mongoose, { Schema, type Document } from "mongoose"

export interface IClientInquiry extends Document {
  name: string
  email: string
  company?: string
  phone?: string
  message: string
  status: "New" | "Contacted" | "Pending" | "Resolved"
  assignedTo?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ClientInquirySchema = new Schema<IClientInquiry>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot be more than 100 characters"],
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Please provide a message"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Pending", "Resolved"],
      default: "New",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

// Create indexes for better query performance
ClientInquirySchema.index({ status: 1 })
ClientInquirySchema.index({ createdAt: -1 })
ClientInquirySchema.index({ assignedTo: 1 })

export default mongoose.models.ClientInquiry || mongoose.model<IClientInquiry>("ClientInquiry", ClientInquirySchema)

