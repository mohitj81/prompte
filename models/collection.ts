import { Schema, model, models } from "mongoose"

const CollectionSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Collection name is required!"],
      maxlength: [100, "Collection name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Prompt",
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    coverImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

const Collection = models.Collection || model("Collection", CollectionSchema)

export default Collection
