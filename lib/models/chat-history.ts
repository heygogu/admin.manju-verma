import mongoose, { Schema, type Document } from "mongoose"

interface IMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface IChatHistory extends Document {
  user: mongoose.Types.ObjectId
  messages: IMessage[]
  title?: string
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    title: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

// Generate title from first user message if not provided
ChatHistorySchema.pre("save", function (next) {
  if (!this.title && this.messages.length > 0) {
    const firstUserMessage = this.messages.find((msg) => msg.role === "user")
    if (firstUserMessage) {
      // Truncate message to create a title
      this.title = firstUserMessage.content.substring(0, 50)
      if (firstUserMessage.content.length > 50) {
        this.title += "..."
      }
    }
  }
  next()
})

// Create indexes for better query performance
ChatHistorySchema.index({ user: 1, createdAt: -1 })

export default mongoose.models.ChatHistory || mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema)

