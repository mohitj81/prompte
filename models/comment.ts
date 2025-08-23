import { Schema, model, models } from "mongoose"

const CommentSchema = new Schema(
  {
    prompt: {
      type: Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required!"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Comment = models.Comment || model("Comment", CommentSchema)

export default Comment
