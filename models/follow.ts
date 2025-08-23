import { Schema, model, models } from "mongoose"

const FollowSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure a user can't follow the same person twice
FollowSchema.index({ follower: 1, following: 1 }, { unique: true })

const Follow = models.Follow || model("Follow", FollowSchema)

export default Follow
