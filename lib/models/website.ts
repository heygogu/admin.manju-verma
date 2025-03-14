import mongoose from "mongoose"

const WebsiteSchema = new mongoose.Schema(
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
    url: {
      type: String,
      required: [true, "Please provide the website URL"],
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
    role: {
      type: String,
      required: [true, "Please specify your role"],
    },
    contentSections: [
      {
        title: String,
        content: String,
        image: String,
      },
    ],
    testimonial: {
      quote: String,
      author: String,
      position: String,
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

export default mongoose.models.Website || mongoose.model("Website", WebsiteSchema)

