import { Schema, model, models } from "mongoose"

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "system"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedPrompt: {
      type: Schema.Types.ObjectId,
      ref: "Prompt",
    },
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

const Notification = models.Notification || model("Notification", NotificationSchema)

export default Notification
