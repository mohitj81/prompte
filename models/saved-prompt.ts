import { Schema, model, models } from "mongoose"

const SavedPromptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: {
      type: Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure a user can't save the same prompt twice
SavedPromptSchema.index({ user: 1, prompt: 1 }, { unique: true })

const SavedPrompt = models.SavedPrompt || model("SavedPrompt", SavedPromptSchema)

export default SavedPrompt
