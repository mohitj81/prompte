import { Schema, model, models } from "mongoose"

const PromptSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required!"],
    },
    prompt: {
      type: String,
      required: [true, "Prompt is required!"],
    },
    tags: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      enum: [
        "writing",
        "coding",
        "marketing",
        "design",
        "business",
        "education",
        "entertainment",
        "productivity",
        "research",
        "other",
      ],
      default: "other",
    },
    difficulty: {
  type: String,
  enum: ["beginner", "medium", "advanced"],
  default: "beginner",
  required: true,
},
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    saves: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sampleResult: {
      type: String,
    },
    sampleOutputImage: {
      type: String,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateVariables: [
      {
        name: String,
        description: String,
        placeholder: String,
        required: {
          type: Boolean,
          default: false,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Prompt = models.Prompt || model("Prompt", PromptSchema)

export default Prompt
